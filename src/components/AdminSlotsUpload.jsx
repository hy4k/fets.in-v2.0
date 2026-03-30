import { useState, useEffect, useCallback } from 'react';
import {
  X, Upload, FileSpreadsheet, CheckCircle, AlertCircle,
  Loader2, Eye, EyeOff, Trash2, Table2, RefreshCw, Save,
  ChevronDown, Filter, Edit3
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'fets@admin2024';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(str) {
  if (!str) return '';
  return new Date(str + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', weekday: 'short',
  });
}

function parseExcelFile(file, onDone, onError) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { raw: false, dateNF: 'yyyy-mm-dd' });

      const rows = raw.map((r) => {
        const date     = r['Date']       || r['date'];
        const center   = r['Center']     || r['center'];
        const timeSlot = r['Time Slot']  || r['time_slot'] || r['Time'] || r['time'];
        const part     = r['Part']       || r['part'];
        const seats    = parseInt(r['Total Seats'] || r['total_seats'] || r['Seats'] || r['seats'] || '10', 10);

        if (!date || !center || !timeSlot || !part) return null;

        const normCenter = center.trim().toLowerCase().includes('cochin') ||
                           center.trim().toLowerCase().includes('kochi')
          ? 'Cochin' : 'Calicut';
        const normPart = part.trim().toLowerCase().includes('1') ? 'Part 1' : 'Part 2';

        let normDate = date.trim();
        if (normDate.includes('/')) {
          const p = normDate.split('/');
          normDate = p[0].length === 4
            ? `${p[0]}-${p[1].padStart(2,'0')}-${p[2].padStart(2,'0')}`
            : `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
        }

        return {
          date: normDate,
          center: normCenter,
          time_slot: timeSlot.trim(),
          part: normPart,
          total_seats: isNaN(seats) ? 10 : seats,
          booked_seats: 0,
        };
      }).filter(Boolean);

      if (!rows.length) {
        onError('No valid rows found. Ensure columns: Date, Center, Time Slot, Part, Total Seats');
        return;
      }
      onDone(rows);
    } catch (err) {
      onError('Failed to parse file: ' + err.message);
    }
  };
  reader.readAsBinaryString(file);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
        active ? 'bg-primary-400 text-dark-950 shadow-sm' : 'text-dark-800 hover:bg-light-200'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Upload Tab ───────────────────────────────────────────────────────────────

function UploadTab() {
  const [parsedRows, setParsedRows] = useState(null);
  const [fileName, setFileName]   = useState('');
  const [parseError, setParseError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult]       = useState(null);
  const [clearExisting, setClearExisting] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    setParseError(''); setResult(null); setParsedRows(null);
    setFileName(file.name);
    parseExcelFile(file, setParsedRows, setParseError);
  };

  const upload = async () => {
    if (!parsedRows?.length) return;
    setUploading(true); setResult(null);
    try {
      if (clearExisting) {
        const { error } = await supabase
          .from('mock_exam_slots')
          .delete()
          .gte('date', new Date().toISOString().split('T')[0]);
        if (error) throw error;
      }
      const { error } = await supabase
        .from('mock_exam_slots')
        .upsert(parsedRows, { onConflict: 'date,center,time_slot,part' });
      if (error) throw error;
      setResult({ success: true, count: parsedRows.length });
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Format guide */}
      <div className="bg-primary-400/5 border border-primary-400/20 rounded-xl p-4">
        <p className="text-sm font-semibold text-dark-950 mb-2">Required Excel Columns:</p>
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr className="text-left text-dark-800">
                {['Date','Center','Time Slot','Part','Total Seats'].map(h=>(
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
          Center: "Cochin" or "Calicut" &nbsp;|&nbsp; Part: "Part 1" or "Part 2" &nbsp;|&nbsp;
          Date: YYYY-MM-DD or DD/MM/YYYY
        </p>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-light-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400/50 transition-all"
        onClick={() => document.getElementById('admin-slot-file').click()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}
      >
        <input
          type="file" id="admin-slot-file" accept=".xlsx,.xls,.csv" className="hidden"
          onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
        />
        <FileSpreadsheet size={36} className="mx-auto text-primary-500 mb-3" />
        <p className="font-semibold text-dark-950 text-sm mb-1">
          {fileName || 'Drop your Excel / CSV here'}
        </p>
        <p className="text-xs text-dark-800">
          {parsedRows ? `${parsedRows.length} valid rows loaded` : 'or click to browse (.xlsx, .xls, .csv)'}
        </p>
      </div>

      {parseError && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle size={15} className="shrink-0 mt-0.5"/> {parseError}
        </div>
      )}

      {/* Preview */}
      {parsedRows?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-dark-800 uppercase tracking-wider mb-2">
            Preview — first {Math.min(6, parsedRows.length)} of {parsedRows.length} rows
          </p>
          <div className="overflow-x-auto rounded-xl border border-light-200">
            <table className="w-full text-xs">
              <thead className="bg-light-100">
                <tr>{['Date','Center','Time','Part','Seats'].map(h=>(
                  <th key={h} className="px-3 py-2 text-left font-semibold text-dark-950">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {parsedRows.slice(0,6).map((r,i)=>(
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

      {parsedRows && (
        <label className="flex items-center gap-2 text-sm text-dark-800 cursor-pointer select-none">
          <input
            type="checkbox" checked={clearExisting}
            onChange={e => setClearExisting(e.target.checked)}
            className="w-4 h-4 accent-red-500"
          />
          <Trash2 size={13} className="text-red-400"/>
          Delete all future slots before uploading (replaces everything)
        </label>
      )}

      {result && (
        <div className={`flex items-start gap-2 p-4 rounded-xl text-sm ${
          result.success ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {result.success ? <CheckCircle size={15} className="shrink-0 mt-0.5"/> : <AlertCircle size={15} className="shrink-0 mt-0.5"/>}
          {result.success ? `Successfully uploaded ${result.count} slot entries.` : `Error: ${result.message}`}
        </div>
      )}

      <button
        onClick={upload}
        disabled={!parsedRows || uploading}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
      >
        {uploading
          ? <><Loader2 size={15} className="animate-spin"/> Uploading...</>
          : <><Upload size={15}/> Upload {parsedRows?.length || 0} Slots to Database</>}
      </button>
    </div>
  );
}

// ─── Manage Seats Tab ─────────────────────────────────────────────────────────

function ManageTab() {
  const [slots, setSlots]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState({}); // { [id]: true }
  const [edits, setEdits]         = useState({}); // { [id]: { total_seats, booked_seats } }
  const [filterCenter, setFilterCenter] = useState('All');
  const [filterMonth, setFilterMonth]   = useState('All');
  const [saveResult, setSaveResult]     = useState({}); // { [id]: 'ok' | 'err' }
  const [expandedDates, setExpandedDates] = useState({});

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('mock_exam_slots')
        .select('*')
        .gte('date', today)
        .lte('date', '2026-08-31')
        .order('date')
        .order('center')
        .order('time_slot');
      if (error) throw error;
      setSlots(data || []);
      // Expand first date by default
      if (data?.length) {
        setExpandedDates({ [data[0].date + data[0].center]: true });
      }
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const getEdit = (slot) => edits[slot.id] ?? { total_seats: slot.total_seats, booked_seats: slot.booked_seats };

  const setEdit = (id, field, value) => {
    const v = Math.max(0, parseInt(value, 10) || 0);
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: v } }));
    setSaveResult(prev => { const n={...prev}; delete n[id]; return n; });
  };

  const isDirty = (slot) => {
    const e = edits[slot.id];
    if (!e) return false;
    return e.total_seats !== slot.total_seats || e.booked_seats !== slot.booked_seats;
  };

  const saveSlot = async (slot) => {
    const e = getEdit(slot);
    setSaving(prev => ({ ...prev, [slot.id]: true }));
    try {
      const { error } = await supabase
        .from('mock_exam_slots')
        .update({ total_seats: e.total_seats, booked_seats: e.booked_seats })
        .eq('id', slot.id);
      if (error) throw error;
      setSlots(prev => prev.map(s => s.id === slot.id
        ? { ...s, total_seats: e.total_seats, booked_seats: e.booked_seats }
        : s
      ));
      setEdits(prev => { const n={...prev}; delete n[slot.id]; return n; });
      setSaveResult(prev => ({ ...prev, [slot.id]: 'ok' }));
      setTimeout(() => setSaveResult(prev => { const n={...prev}; delete n[slot.id]; return n; }), 2000);
    } catch {
      setSaveResult(prev => ({ ...prev, [slot.id]: 'err' }));
    } finally {
      setSaving(prev => { const n={...prev}; delete n[slot.id]; return n; });
    }
  };

  // Filters
  const months = ['All', ...new Set(slots.map(s => s.date.slice(0,7)).sort())];
  const centers = ['All', 'Cochin', 'Calicut'];

  const filtered = slots.filter(s => {
    if (filterCenter !== 'All' && s.center !== filterCenter) return false;
    if (filterMonth !== 'All' && !s.date.startsWith(filterMonth)) return false;
    return true;
  });

  // Group by date + center
  const groups = filtered.reduce((acc, slot) => {
    const key = slot.date + '|' + slot.center;
    if (!acc[key]) acc[key] = { date: slot.date, center: slot.center, slots: [] };
    acc[key].slots.push(slot);
    return acc;
  }, {});

  const toggleGroup = (key) => setExpandedDates(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={13} className="text-dark-800 shrink-0"/>
        <select
          value={filterCenter}
          onChange={e => setFilterCenter(e.target.value)}
          className="input-clean w-auto py-1.5 text-xs cursor-pointer"
        >
          {centers.map(c => <option key={c}>{c}</option>)}
        </select>
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="input-clean w-auto py-1.5 text-xs cursor-pointer"
        >
          {months.map(m => <option key={m}>{m === 'All' ? 'All Months' : new Date(m+'-01').toLocaleString('default',{month:'long',year:'numeric'})}</option>)}
        </select>
        <button
          onClick={fetchSlots}
          className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-dark-800 hover:text-dark-950 transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={26} className="animate-spin text-primary-500"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-sm text-dark-800 bg-light-100 rounded-xl border border-light-200">
          No slots found for the selected filters.
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(groups).map(([key, group]) => {
            const isOpen = !!expandedDates[key];
            const totalAvail = group.slots.reduce((s, sl) => {
              const e = getEdit(sl);
              return s + Math.max(0, e.total_seats - e.booked_seats);
            }, 0);
            return (
              <div key={key} className="border border-light-200 rounded-xl overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(key)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-light-100 hover:bg-light-200 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      group.center === 'Cochin' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>{group.center}</span>
                    <span className="font-semibold text-dark-950 text-sm">{fmtDate(group.date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-dark-800">
                      {totalAvail} seat{totalAvail !== 1 ? 's' : ''} available
                    </span>
                    <ChevronDown size={15} className={`text-dark-800 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
                  </div>
                </button>

                {/* Slot rows */}
                {isOpen && (
                  <div className="divide-y divide-light-100">
                    {group.slots.map(slot => {
                      const e      = getEdit(slot);
                      const dirty  = isDirty(slot);
                      const avail  = Math.max(0, e.total_seats - e.booked_seats);
                      const isSaving = saving[slot.id];
                      const res    = saveResult[slot.id];

                      return (
                        <div key={slot.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-dark-950 text-sm">{slot.time_slot}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-400/10 text-primary-600 font-semibold">{slot.part}</span>
                              <span className={`text-[11px] font-semibold ${avail === 0 ? 'text-red-500' : avail <= 2 ? 'text-amber-600' : 'text-green-600'}`}>
                                {avail === 0 ? 'Full' : `${avail} available`}
                              </span>
                            </div>
                          </div>

                          {/* Editable fields */}
                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <label className="text-xs text-dark-800 whitespace-nowrap">Total seats</label>
                              <input
                                type="number" min="0" max="999"
                                value={e.total_seats}
                                onChange={ev => setEdit(slot.id, 'total_seats', ev.target.value)}
                                className="w-16 text-center text-sm font-semibold border border-light-300 rounded-lg py-1 bg-light-50 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <label className="text-xs text-dark-800 whitespace-nowrap">Booked</label>
                              <input
                                type="number" min="0"
                                value={e.booked_seats}
                                onChange={ev => setEdit(slot.id, 'booked_seats', ev.target.value)}
                                className="w-16 text-center text-sm font-semibold border border-light-300 rounded-lg py-1 bg-light-50 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20"
                              />
                            </div>

                            {/* Save button */}
                            {dirty && !res && (
                              <button
                                onClick={() => saveSlot(slot)}
                                disabled={isSaving}
                                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-dark-950 text-primary-400 hover:bg-dark-800 transition-colors disabled:opacity-50"
                              >
                                {isSaving ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>}
                                {isSaving ? 'Saving' : 'Save'}
                              </button>
                            )}
                            {res === 'ok' && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                <CheckCircle size={13}/> Saved
                              </span>
                            )}
                            {res === 'err' && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                                <AlertCircle size={13}/> Error
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-dark-800 text-center pt-1">
        Changes save instantly to the database. The booking page updates in real time.
      </p>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function AdminSlotsUpload({ onClose }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState('manage'); // 'upload' | 'manage'

  const authenticate = () => {
    if (password === ADMIN_PASSWORD) { setAuthenticated(true); setAuthError(''); }
    else setAuthError('Incorrect password.');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
      <div className="bg-light-50 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-light-200">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-light-200 shrink-0">
          <div>
            <h2 className="heading-serif text-xl font-semibold text-dark-950">Admin Panel</h2>
            <p className="text-xs text-dark-800 mt-0.5">CMA US Mock Exam — Seat Management</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-light-200 rounded-full transition-colors">
            <X size={18} className="text-dark-800"/>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-6">
          {!authenticated ? (
            /* ── Login ── */
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
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {authError && <p className="text-red-500 text-xs mb-3">{authError}</p>}
              <button onClick={authenticate} className="btn-primary w-full">Login</button>
            </div>
          ) : (
            /* ── Authenticated ── */
            <div>
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-light-200 rounded-xl mb-6">
                <TabBtn active={tab === 'manage'} onClick={() => setTab('manage')}>
                  <span className="flex items-center justify-center gap-1.5">
                    <Edit3 size={13}/> Manage Seats
                  </span>
                </TabBtn>
                <TabBtn active={tab === 'upload'} onClick={() => setTab('upload')}>
                  <span className="flex items-center justify-center gap-1.5">
                    <Table2 size={13}/> Upload Excel
                  </span>
                </TabBtn>
              </div>

              {tab === 'manage' ? <ManageTab /> : <UploadTab />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
