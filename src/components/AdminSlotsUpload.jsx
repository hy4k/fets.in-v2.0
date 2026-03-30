import { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

// Set this in your .env as VITE_ADMIN_PASSWORD
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'fets@admin2024';

export default function AdminSlotsUpload({ onClose }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [authError, setAuthError] = useState('');

  const [parsedRows, setParsedRows] = useState(null);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [clearExisting, setClearExisting] = useState(false);

  const authenticate = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password.');
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    setParseError('');
    setResult(null);
    setParsedRows(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { raw: false, dateNF: 'yyyy-mm-dd' });

        const rows = raw.map((r, idx) => {
          const date = r['Date'] || r['date'];
          const center = r['Center'] || r['center'];
          const time_slot = r['Time Slot'] || r['time_slot'] || r['Time'] || r['time'];
          const part = r['Part'] || r['part'];
          const total_seats = parseInt(r['Total Seats'] || r['total_seats'] || r['Seats'] || r['seats'] || '10', 10);

          if (!date || !center || !time_slot || !part) return null;

          // Normalize center spelling
          const normalizedCenter = center.trim().toLowerCase().includes('cochin') || center.trim().toLowerCase().includes('kochi')
            ? 'Cochin' : 'Calicut';
          // Normalize part
          const normalizedPart = part.trim().toLowerCase().includes('1') ? 'Part 1' : 'Part 2';
          // Normalize date to YYYY-MM-DD
          let normalizedDate = date.trim();
          if (normalizedDate.includes('/')) {
            const parts = normalizedDate.split('/');
            if (parts[0].length === 4) normalizedDate = `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
            else normalizedDate = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
          }

          return { date: normalizedDate, center: normalizedCenter, time_slot: time_slot.trim(), part: normalizedPart, total_seats: isNaN(total_seats) ? 10 : total_seats, booked_seats: 0, _row: idx + 2 };
        }).filter(Boolean);

        if (rows.length === 0) {
          setParseError('No valid rows found. Check that your Excel has columns: Date, Center, Time Slot, Part, Total Seats');
          return;
        }
        setParsedRows(rows);
      } catch (err) {
        setParseError('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const uploadSlots = async () => {
    if (!parsedRows?.length) return;
    setUploading(true);
    setResult(null);
    try {
      if (clearExisting) {
        const { error: delError } = await supabase
          .from('mock_exam_slots')
          .delete()
          .gte('date', new Date().toISOString().split('T')[0]);
        if (delError) throw delError;
      }

      const insertRows = parsedRows.map(({ _row, ...r }) => r);
      const { error } = await supabase
        .from('mock_exam_slots')
        .upsert(insertRows, { onConflict: 'date,center,time_slot,part' });

      if (error) throw error;
      setResult({ success: true, count: insertRows.length });
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
      <div className="bg-light-50 rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden border border-light-200">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-light-200 shrink-0">
          <h2 className="heading-serif text-xl font-semibold text-dark-950">Admin — Upload Exam Slots</h2>
          <button onClick={onClose} className="p-2 hover:bg-light-200 rounded-full transition-colors">
            <X size={18} className="text-dark-800" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-6">

          {/* AUTH */}
          {!authenticated ? (
            <div className="max-w-sm mx-auto">
              <p className="text-sm text-dark-800 mb-5">Enter the admin password to manage exam slots.</p>
              <div className="relative mb-3">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && authenticate()}
                  placeholder="Admin password"
                  className="input-clean pr-10"
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-800">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {authError && <p className="text-red-500 text-xs mb-3">{authError}</p>}
              <button onClick={authenticate} className="btn-primary w-full">Login</button>
            </div>
          ) : (
            <div className="space-y-5">

              {/* Template format info */}
              <div className="bg-primary-400/5 border border-primary-400/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-dark-950 mb-2">Required Excel Columns:</p>
                <div className="overflow-x-auto">
                  <table className="text-xs w-full">
                    <thead>
                      <tr className="text-left text-dark-800">
                        {['Date', 'Center', 'Time Slot', 'Part', 'Total Seats'].map(h => (
                          <th key={h} className="pr-4 pb-1 font-bold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-dark-950 font-mono">
                        <td className="pr-4">2026-04-10</td>
                        <td className="pr-4">Cochin</td>
                        <td className="pr-4">9:00 AM</td>
                        <td className="pr-4">Part 1</td>
                        <td>8</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-dark-800 mt-2">
                  Center: "Cochin" or "Calicut" &nbsp;|&nbsp; Part: "Part 1" or "Part 2" &nbsp;|&nbsp; Date: YYYY-MM-DD
                </p>
              </div>

              {/* Drop zone */}
              <div
                className="border-2 border-dashed border-light-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400/50 hover:bg-primary-400/3 transition-all"
                onClick={() => document.getElementById('admin-slot-file').click()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                onDragOver={e => e.preventDefault()}
              >
                <input
                  type="file"
                  id="admin-slot-file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
                />
                <FileSpreadsheet size={36} className="mx-auto text-primary-500 mb-3" />
                <p className="font-semibold text-dark-950 text-sm mb-1">
                  {fileName || 'Drop your Excel / CSV file here'}
                </p>
                <p className="text-xs text-dark-800">
                  {parsedRows ? `${parsedRows.length} valid rows loaded` : 'or click to browse (.xlsx, .xls, .csv)'}
                </p>
              </div>

              {parseError && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /> {parseError}
                </div>
              )}

              {/* Preview table */}
              {parsedRows && parsedRows.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-dark-800 uppercase tracking-wider mb-2">
                    Preview (first {Math.min(5, parsedRows.length)} of {parsedRows.length} rows)
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-light-200">
                    <table className="w-full text-xs">
                      <thead className="bg-light-100">
                        <tr>
                          {['Date', 'Center', 'Time', 'Part', 'Seats'].map(h => (
                            <th key={h} className="px-3 py-2 text-left font-semibold text-dark-950">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.slice(0, 5).map((r, i) => (
                          <tr key={i} className="border-t border-light-100">
                            <td className="px-3 py-2 text-dark-800">{r.date}</td>
                            <td className="px-3 py-2 text-dark-800">{r.center}</td>
                            <td className="px-3 py-2 text-dark-800">{r.time_slot}</td>
                            <td className="px-3 py-2 text-dark-800">{r.part}</td>
                            <td className="px-3 py-2 text-dark-800">{r.total_seats}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Clear existing option */}
              {parsedRows && (
                <label className="flex items-center gap-2 text-sm text-dark-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={clearExisting}
                    onChange={e => setClearExisting(e.target.checked)}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <Trash2 size={13} className="text-red-400" />
                  Delete existing future slots before uploading
                </label>
              )}

              {/* Result */}
              {result && (
                <div className={`flex items-start gap-2 p-4 rounded-xl text-sm ${result.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {result.success
                    ? <CheckCircle size={16} className="shrink-0 mt-0.5" />
                    : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                  {result.success
                    ? `Successfully uploaded ${result.count} slot entries to the database.`
                    : `Upload failed: ${result.message}`}
                </div>
              )}

              <button
                onClick={uploadSlots}
                disabled={!parsedRows || uploading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading
                  ? <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                  : <><Upload size={16} /> Upload {parsedRows?.length || 0} Slots to Database</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
