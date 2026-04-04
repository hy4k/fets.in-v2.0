import { useState, useEffect, useCallback } from 'react';
import {
  X, Upload, FileSpreadsheet, CheckCircle, AlertCircle,
  Loader2, Eye, EyeOff, Trash2, Table2, RefreshCw, Save,
  ChevronDown, Filter, Edit3, Users, BookOpen, Bell, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'fets@admin2024';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(str) {
  if (!str) return '';
  return new Date(str + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', weekday: 'short',
  });
}

const MONTH_MAP = {Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};

function normDate(str) {
  if (!str) return null;
  str = String(str).trim();
  // DD-Mon-YYYY  e.g. "01-Apr-2026"
  if (/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(str)) {
    const [d, m, y] = str.split('-');
    return `${y}-${MONTH_MAP[m] || '01'}-${d}`;
  }
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // DD/MM/YYYY
  if (str.includes('/')) {
    const p = str.split('/');
    return p[0].length === 4
      ? `${p[0]}-${p[1].padStart(2,'0')}-${p[2].padStart(2,'0')}`
      : `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
  }
  return null;
}

function parseExcelFile(file, onDone, onError) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      // Read as raw 2D array to detect FETS tracking form format
      const raw2d = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '', header: 1 });

      // ── Detect FETS tracking form (has "SEAT AVAILABILITY TRACKING FORM" in row 0) ──
      const isFETSFormat = String(raw2d[0]?.[0] || '').includes('SEAT AVAILABILITY');

      if (isFETSFormat) {
        // Determine center and total seats from header rows
        const locationCell = String(raw2d[4]?.[2] || '').toLowerCase();
        const isCalicut = locationCell.includes('calicut') || locationCell.includes('kozhikode');
        const centerName = isCalicut ? 'Calicut' : 'Cochin';
        // Calicut seats: row 4 col 7; Cochin seats: row 5 col 7
        const totalSeats = parseInt(isCalicut ? raw2d[4]?.[7] : raw2d[5]?.[7], 10) || 40;

        const slots = [];
        for (let i = 11; i <= 163; i++) {
          const row = raw2d[i];
          if (!row || !row[1]) continue;
          const date = normDate(row[1]);
          if (!date) continue;
          const mornBooked = Math.max(0, parseInt(row[3], 10) || 0);
          const noonBooked = Math.max(0, parseInt(row[5], 10) || 0);
          slots.push({ date, center: centerName, time_slot: '9:00 AM', total_seats: totalSeats, booked_seats: mornBooked });
          slots.push({ date, center: centerName, time_slot: '2:00 PM', total_seats: totalSeats, booked_seats: noonBooked });
        }
        if (!slots.length) { onError('No data rows found in the FETS tracking form.'); return; }
        onDone(slots);
        return;
      }

      // ── Generic format with column headers ──
      const raw = XLSX.utils.sheet_to_json(ws, { raw: false, dateNF: 'yyyy-mm-dd' });
      const rows = raw.map((r) => {
        const date     = r['Date']      || r['date'];
        const center   = r['Center']    || r['center'];
        const timeSlot = r['Time Slot'] || r['time_slot'] || r['Time'] || r['time'];
        const seats    = parseInt(r['Total Seats'] || r['total_seats'] || r['Seats'] || r['seats'] || '40', 10);
        const booked   = parseInt(r['Booked'] || r['booked_seats'] || r['Booked Seats'] || '0', 10);
        if (!date || !center || !timeSlot) return null;
        const normCenter = center.toLowerCase().includes('cochin') || center.toLowerCase().includes('kochi') ? 'Cochin' : 'Calicut';
        return { date: normDate(date) || date, center: normCenter, time_slot: timeSlot.trim(), total_seats: isNaN(seats) ? 40 : seats, booked_seats: isNaN(booked) ? 0 : booked };
      }).filter(Boolean);

      if (!rows.length) { onError('No valid rows found. Check columns: Date, Center, Time Slot, Total Seats'); return; }
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
    if (!supabase) {
      setResult({ success: false, message: 'Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).' });
      return;
    }
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
        .upsert(parsedRows, { onConflict: 'date,center,time_slot' });
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
        <p className="text-sm font-semibold text-dark-950 mb-2">Accepted formats:</p>
        <div className="space-y-2 text-xs">
          <div className="bg-white border border-light-200 rounded-lg p-2">
            <p className="font-bold text-dark-950 mb-1">✓ FETS Tracking Form (your existing files)</p>
            <p className="text-dark-800">The "Seat Availability Tracking Form" Excel — just upload as-is. Morning = 9:00 AM, Noon = 2:00 PM.</p>
          </div>
          <div className="bg-white border border-light-200 rounded-lg p-2">
            <p className="font-bold text-dark-950 mb-1">✓ Simple format</p>
            <p className="font-mono text-dark-800">Date | Center | Time Slot | Total Seats | Booked</p>
          </div>
        </div>
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
                <tr>{['Date','Center','Session','Total','Booked','Available'].map(h=>(
                  <th key={h} className="px-3 py-2 text-left font-semibold text-dark-950">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {parsedRows.slice(0,6).map((r,i)=>(
                  <tr key={i} className="border-t border-light-100">
                    <td className="px-3 py-2 text-dark-800">{r.date}</td>
                    <td className="px-3 py-2 text-dark-800">{r.center}</td>
                    <td className="px-3 py-2 text-dark-800">{r.time_slot}</td>
                    <td className="px-3 py-2 text-dark-800">{r.total_seats}</td>
                    <td className="px-3 py-2 text-dark-800">{r.booked_seats}</td>
                    <td className="px-3 py-2 font-semibold text-green-700">{r.total_seats - r.booked_seats}</td>
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
    if (!supabase) {
      setSlots([]);
      setLoading(false);
      return;
    }
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
    if (!supabase) {
      setSaveResult((prev) => ({ ...prev, [slot.id]: 'err' }));
      return;
    }
    const e = getEdit(slot);
    setSaving((prev) => ({ ...prev, [slot.id]: true }));
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function exportCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r =>
    headers.map(h => JSON.stringify(r[h] ?? '')).join(',')
  )].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function DataTable({ columns, rows, emptyMsg }) {
  if (!rows.length) return (
    <p className="text-center py-10 text-sm text-dark-800">{emptyMsg}</p>
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-light-200">
      <table className="w-full text-xs min-w-[600px]">
        <thead className="bg-light-100 border-b border-light-200">
          <tr>
            {columns.map(c => (
              <th key={c.key} className="px-3 py-2.5 text-left font-bold text-dark-950 whitespace-nowrap">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-light-100 hover:bg-light-50">
              {columns.map(c => (
                <td key={c.key} className="px-3 py-2 text-dark-800 whitespace-nowrap max-w-[200px] truncate">
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ value }) {
  const colors = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors[value] || 'bg-light-200 text-dark-700'}`}>
      {value || '—'}
    </span>
  );
}

// ─── Leads Tab ────────────────────────────────────────────────────────────────

function LeadsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from('early_access_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const cols = [
    { key: 'created_at', label: 'Date', render: v => v ? new Date(v).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' }) : '—' },
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'interested_exam', label: 'Exam' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-dark-950">{rows.length} registrations</p>
        <div className="flex gap-2">
          <button onClick={fetch} className="flex items-center gap-1.5 text-xs font-semibold text-dark-800 hover:text-dark-950">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
          <button onClick={() => exportCSV(rows, 'fets-leads.csv')} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-dark-950 text-primary-400 hover:bg-dark-800">
            <Download size={12}/> Export CSV
          </button>
        </div>
      </div>
      {loading
        ? <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary-500"/></div>
        : <DataTable columns={cols} rows={rows} emptyMsg="No early access registrations yet." />
      }
    </div>
  );
}

// ─── Bookings Tab (slot-based CMAMockBooking) ─────────────────────────────────

function BookingsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from('mock_exam_bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const cols = [
    { key: 'created_at', label: 'Date', render: v => v ? new Date(v).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' }) : '—' },
    { key: 'candidate_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'mobile', label: 'Phone' },
    { key: 'part', label: 'Part' },
    { key: 'final_price', label: 'Amount', render: v => v != null ? `₹${v}` : '—' },
    { key: 'payment_method', label: 'Method' },
    { key: 'payment_status', label: 'Status', render: v => <StatusBadge value={v} /> },
    { key: 'coupon_code', label: 'Coupon' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-dark-950">{rows.length} bookings</p>
        <div className="flex gap-2">
          <button onClick={fetch} className="flex items-center gap-1.5 text-xs font-semibold text-dark-800 hover:text-dark-950">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
          <button onClick={() => exportCSV(rows, 'fets-bookings.csv')} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-dark-950 text-primary-400 hover:bg-dark-800">
            <Download size={12}/> Export CSV
          </button>
        </div>
      </div>
      {loading
        ? <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary-500"/></div>
        : <DataTable columns={cols} rows={rows} emptyMsg="No slot-based bookings yet." />
      }
    </div>
  );
}

// ─── CMA Requests Tab (new CMAMockBookingModal) ───────────────────────────────

function CmaRequestsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [students, setStudents] = useState({}); // { [booking_id]: [...] }

  const fetch = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from('cma_mock_bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const loadStudents = async (bookingId) => {
    if (students[bookingId]) {
      setExpanded(expanded === bookingId ? null : bookingId);
      return;
    }
    const { data } = await supabase
      .from('cma_mock_students')
      .select('student_name')
      .eq('booking_id', bookingId);
    setStudents(prev => ({ ...prev, [bookingId]: data || [] }));
    setExpanded(bookingId);
  };

  const exportAll = () => {
    const flat = rows.map(r => ({
      date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '',
      type: r.booking_type,
      name: r.lead_name || '(institutional)',
      email: r.lead_email || '',
      phone: r.lead_phone || '',
      exam_part: r.exam_part,
      preferred_date: r.preferred_date,
      session: r.session_time,
      students: r.student_count,
      payment: r.payment_method,
      status: r.status,
    }));
    exportCSV(flat, 'fets-cma-requests.csv');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-dark-950">{rows.length} CMA mock requests</p>
        <div className="flex gap-2">
          <button onClick={fetch} className="flex items-center gap-1.5 text-xs font-semibold text-dark-800 hover:text-dark-950">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
          <button onClick={exportAll} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-dark-950 text-primary-400 hover:bg-dark-800">
            <Download size={12}/> Export CSV
          </button>
        </div>
      </div>

      {loading
        ? <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary-500"/></div>
        : rows.length === 0
          ? <p className="text-center py-10 text-sm text-dark-800">No CMA mock requests yet.</p>
          : rows.map(r => (
            <div key={r.id} className="border border-light-200 rounded-xl overflow-hidden">
              <button
                onClick={() => r.booking_type === 'institutional' ? loadStudents(r.id) : setExpanded(expanded === r.id ? null : r.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-light-50 hover:bg-light-100 text-left transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${r.booking_type === 'institutional' ? 'bg-blue-100 text-blue-700' : 'bg-primary-400/15 text-primary-600'}`}>
                    {r.booking_type === 'institutional' ? 'Bulk' : 'Direct'}
                  </span>
                  <span className="font-semibold text-dark-950 text-sm truncate">
                    {r.lead_name || `Coaching Center · ${r.student_count} students`}
                  </span>
                  <span className="text-xs text-dark-800 shrink-0">{r.exam_part}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-dark-800">{r.preferred_date}</span>
                  <StatusBadge value={r.status} />
                  <ChevronDown size={14} className={`text-dark-800 transition-transform ${expanded === r.id ? 'rotate-180' : ''}`}/>
                </div>
              </button>

              {expanded === r.id && (
                <div className="px-4 py-4 border-t border-light-100 bg-white text-xs space-y-3">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {r.booking_type === 'direct' && <>
                      <div><span className="text-dark-600 font-semibold">Email: </span><span className="text-dark-950">{r.lead_email || '—'}</span></div>
                      <div><span className="text-dark-600 font-semibold">Phone: </span><span className="text-dark-950">{r.lead_phone || '—'}</span></div>
                    </>}
                    <div><span className="text-dark-600 font-semibold">Session: </span><span className="text-dark-950">{r.session_time}</span></div>
                    <div><span className="text-dark-600 font-semibold">Payment: </span><span className="text-dark-950">{r.payment_method}</span></div>
                    <div><span className="text-dark-600 font-semibold">Submitted: </span><span className="text-dark-950">{r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : '—'}</span></div>
                  </div>
                  {r.booking_type === 'institutional' && students[r.id] && (
                    <div>
                      <p className="font-bold text-dark-950 mb-1.5">Student Roster ({students[r.id].length})</p>
                      <ol className="space-y-1">
                        {students[r.id].map((s, i) => (
                          <li key={i} className="text-dark-800">{i + 1}. {s.student_name}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
      }
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'leads',    label: 'Leads',          icon: Bell,     count: true },
  { id: 'cma',      label: 'CMA Requests',   icon: BookOpen, count: true },
  { id: 'bookings', label: 'Slot Bookings',  icon: Users,    count: true },
  { id: 'manage',   label: 'Manage Seats',   icon: Edit3 },
  { id: 'upload',   label: 'Upload Excel',   icon: Table2 },
];

export default function AdminSlotsUpload({ onClose }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState('leads');

  const authenticate = () => {
    if (password === ADMIN_PASSWORD) { setAuthenticated(true); setAuthError(''); }
    else setAuthError('Incorrect password.');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-light-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-200 shrink-0 bg-dark-950">
          <div>
            <h2 className="text-base font-black text-white tracking-tight">FETS Admin Panel</h2>
            <p className="text-[11px] text-white/40 mt-0.5">
              Access via URL: <span className="text-[#FFD000] font-mono">yoursite.com/?admin=true</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
            <X size={18}/>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 flex flex-col">
          {!authenticated ? (
            /* ── Login ── */
            <div className="max-w-sm mx-auto w-full py-12 px-6">
              <div className="mb-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-dark-950 flex items-center justify-center mx-auto mb-3">
                  <Eye size={22} className="text-[#FFD000]"/>
                </div>
                <h3 className="text-lg font-bold text-dark-950">Admin Access</h3>
                <p className="text-sm text-dark-800 mt-1">Enter your admin password to continue.</p>
              </div>
              <div className="relative mb-3">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && authenticate()}
                  placeholder="Admin password"
                  className="input-clean pr-10 font-mono tracking-widest"
                  autoFocus
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-800 hover:text-dark-950">
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {authError && <p className="text-red-500 text-xs mb-3 text-center">{authError}</p>}
              <button onClick={authenticate} className="btn-primary w-full h-11">Login</button>
              <p className="text-center text-[10px] text-dark-600 mt-4">
                Default: <span className="font-mono">fets@admin2024</span> — set <span className="font-mono">VITE_ADMIN_PASSWORD</span> in .env to change
              </p>
            </div>
          ) : (
            /* ── Authenticated ── */
            <div className="flex flex-col flex-1 min-h-0">
              {!isSupabaseConfigured && (
                <div className="mx-6 mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  ⚠ Supabase not configured — set <code className="rounded bg-white/80 px-1">VITE_SUPABASE_URL</code> and <code className="rounded bg-white/80 px-1">VITE_SUPABASE_ANON_KEY</code> in .env, then rebuild.
                </div>
              )}

              {/* Tab bar */}
              <div className="flex gap-0 border-b border-light-200 px-4 shrink-0 overflow-x-auto">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                      tab === t.id
                        ? 'border-dark-950 text-dark-950'
                        : 'border-transparent text-dark-600 hover:text-dark-950'
                    }`}
                  >
                    <t.icon size={13}/> {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-6">
                {tab === 'leads'    && <LeadsTab />}
                {tab === 'cma'      && <CmaRequestsTab />}
                {tab === 'bookings' && <BookingsTab />}
                {tab === 'manage'   && <ManageTab />}
                {tab === 'upload'   && <UploadTab />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
