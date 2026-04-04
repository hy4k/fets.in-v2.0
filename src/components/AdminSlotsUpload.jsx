import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, Upload, FileSpreadsheet, CheckCircle, AlertCircle,
  Loader2, Eye, EyeOff, Trash2, Table2, RefreshCw, Save,
  ChevronDown, Filter, Edit3, Users, BookOpen, Bell, Download,
  Building2, Copy, ToggleLeft, ToggleRight, Plus, Trophy
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ADMIN_PASSWORD = 'fets@in';

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

// ─── Period Grouping ─────────────────────────────────────────────────────────

const BI_PERIODS = ['Jan – Feb','Mar – Apr','May – Jun','Jul – Aug','Sep – Oct','Nov – Dec'];

function periodLabel(dateStr) {
  if (!dateStr) return 'Undated';
  const d = new Date(String(dateStr).includes('T') ? dateStr : dateStr + 'T00:00:00');
  if (isNaN(d)) return 'Undated';
  return `${BI_PERIODS[Math.floor(d.getMonth() / 2)]} ${d.getFullYear()}`;
}

function groupByPeriod(items, getDate) {
  const map = {};
  for (const item of items) {
    const key = periodLabel(getDate(item));
    if (!map[key]) map[key] = [];
    map[key].push(item);
  }
  return Object.entries(map).sort((a, b) => {
    const parseKey = k => { const y = parseInt(k.slice(-4)); const p = BI_PERIODS.findIndex(x => k.startsWith(x)); return y * 10 + p; };
    return parseKey(b[0]) - parseKey(a[0]);
  });
}

function PeriodHeader({ label, count }) {
  return (
    <div className="flex items-center gap-3 mt-6 mb-2 first:mt-0">
      <span className="text-xs font-black text-dark-600 uppercase tracking-[0.2em]">{label}</span>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dark-950/8 text-dark-600">{count}</span>
      <div className="flex-1 h-px bg-light-200"/>
    </div>
  );
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
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
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
          : groupByPeriod(rows, r => r.preferred_date).map(([period, items]) => (
            <div key={period}>
              <PeriodHeader label={period} count={items.length} />
              <div className="space-y-2">
                {items.map(r => (
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
                          {r.confirmation_code && <div><span className="text-dark-600 font-semibold">Booking Code: </span><span className="font-mono font-bold text-dark-950">{r.confirmation_code}</span></div>}
                          <div><span className="text-dark-600 font-semibold">Session: </span><span className="text-dark-950">{r.session_time}</span></div>
                          <div><span className="text-dark-600 font-semibold">Payment: </span><span className="text-dark-950">{r.payment_method}</span></div>
                          <div><span className="text-dark-600 font-semibold">Submitted: </span><span className="text-dark-950">{r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : '—'}</span></div>
                        </div>
                        {r.booking_type === 'institutional' && students[r.id] && (
                          <div>
                            <p className="font-bold text-dark-950 mb-1.5">Student Roster ({students[r.id].length})</p>
                            <ol className="space-y-1">
                              {students[r.id].map((s, i) => <li key={i} className="text-dark-800">{i + 1}. {s.student_name}</li>)}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
      }
    </div>
  );
}

// ─── Institutes Tab ───────────────────────────────────────────────────────────

function InstitutesTab() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successCode, setSuccessCode] = useState('');
  const [bookingCounts, setBookingCounts] = useState({});
  const [revealedCodes, setRevealedCodes] = useState({});

  // Institute bookings
  const [instBookings, setInstBookings] = useState([]);
  const [instBookingsLoading, setInstBookingsLoading] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [bookingStudents, setBookingStudents] = useState({});
  const [showBookings, setShowBookings] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('Calicut');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const fetchCenters = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from('coaching_centers')
      .select('*')
      .order('created_at', { ascending: false });
    const rows = data || [];
    setCenters(rows);
    // Fetch booking counts
    const counts = {};
    await Promise.all(rows.map(async (c) => {
      const { count } = await supabase
        .from('cma_mock_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('coaching_center_id', c.id);
      counts[c.id] = count || 0;
    }));
    setBookingCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCenters(); }, [fetchCenters]);

  const fetchInstBookings = useCallback(async () => {
    if (!supabase) return;
    setInstBookingsLoading(true);
    const { data } = await supabase
      .from('cma_mock_bookings')
      .select('*, coaching_centers(name, city)')
      .eq('booking_type', 'institutional')
      .order('created_at', { ascending: false })
      .limit(200);
    setInstBookings(data || []);
    setInstBookingsLoading(false);
  }, []);

  useEffect(() => { fetchInstBookings(); }, [fetchInstBookings]);

  const loadBookingStudents = async (bookingId) => {
    if (expandedBooking === bookingId) { setExpandedBooking(null); return; }
    setExpandedBooking(bookingId);
    if (bookingStudents[bookingId]) return;
    const { data } = await supabase.from('cma_mock_students').select('student_name').eq('booking_id', bookingId);
    setBookingStudents(p => ({ ...p, [bookingId]: data || [] }));
  };

  const generateCode = () => {
    const firstWord = name.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return `${firstWord}2026`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !contactPerson || !phone || !email) {
      setFormError('All fields except description are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    const code = generateCode();
    try {
      const { error } = await supabase.from('coaching_centers').insert({
        name, city, contact: phone, email,
        contact_name: contactPerson,
        access_code: code,
        is_active: true,
      });
      if (error) throw error;
      setSuccessCode(code);
      setName(''); setCity('Calicut'); setContactPerson(''); setPhone(''); setEmail('');
      setShowForm(false);
      fetchCenters();
    } catch (err) {
      setFormError(err.message || 'Failed to add institute.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (center) => {
    if (!supabase) return;
    await supabase.from('coaching_centers').update({ is_active: !center.is_active }).eq('id', center.id);
    fetchCenters();
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
  };

  return (
    <div className="space-y-4">
      {successCode && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-green-50 border border-green-200">
          <div>
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Institute Added — Share this Access Code</p>
            <p className="font-mono font-black text-green-800 text-xl tracking-widest">{successCode}</p>
          </div>
          <button onClick={() => { copyCode(successCode); setSuccessCode(''); }} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">
            <Copy size={12}/> Copy & Dismiss
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-dark-950">{centers.length} partner institutes</p>
        <div className="flex gap-2">
          <button onClick={fetchCenters} className="flex items-center gap-1.5 text-xs font-semibold text-dark-800 hover:text-dark-950">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-dark-950 text-primary-400 hover:bg-dark-800">
            <Plus size={12}/> Add Institute
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-light-200 rounded-xl p-5 bg-light-50 space-y-4">
          <h4 className="font-bold text-dark-950 text-sm">Add New Institute</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-dark-700 mb-1 uppercase tracking-wider">Institute Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Institute name" className="input-clean text-sm" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-dark-700 mb-1 uppercase tracking-wider">City *</label>
              <select value={city} onChange={e => setCity(e.target.value)} className="input-clean text-sm">
                <option>Calicut</option>
                <option>Kochi</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-dark-700 mb-1 uppercase tracking-wider">Contact Person *</label>
              <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Contact person name" className="input-clean text-sm" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-dark-700 mb-1 uppercase tracking-wider">Phone *</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="input-clean text-sm" required />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-dark-700 mb-1 uppercase tracking-wider">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="institute@email.com" className="input-clean text-sm" required />
            </div>
          </div>
          {formError && <p className="text-red-500 text-xs">{formError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-1.5 text-sm">
              {submitting ? <Loader2 size={13} className="animate-spin"/> : <Plus size={13}/>} Create Institute
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs font-bold text-dark-700 hover:text-dark-950 px-3 py-1.5 rounded-lg border border-light-300 bg-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary-500"/></div>
      ) : centers.length === 0 ? (
        <p className="text-center py-10 text-sm text-dark-800">No institutes added yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-light-200">
          <table className="w-full text-xs min-w-[700px]">
            <thead className="bg-dark-950 border-b border-light-200">
              <tr>
                {['Name', 'City', 'Access Code', 'Contact', 'Phone', 'Status', '# Bookings', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-bold text-white whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {centers.map(c => (
                <tr key={c.id} className="border-t border-light-100 hover:bg-light-50">
                  <td className="px-3 py-2.5 font-semibold text-dark-950 max-w-[160px] truncate">{c.name}</td>
                  <td className="px-3 py-2.5 text-dark-800">{c.city || '—'}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className="font-mono cursor-pointer select-none"
                      title="Hover to reveal"
                      onMouseEnter={() => setRevealedCodes(p => ({ ...p, [c.id]: true }))}
                      onMouseLeave={() => setRevealedCodes(p => ({ ...p, [c.id]: false }))}
                    >
                      {revealedCodes[c.id] ? c.access_code : '••••••••••••'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-dark-800">{c.contact_name || c.contact || '—'}</td>
                  <td className="px-3 py-2.5 text-dark-800">{c.contact || '—'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-dark-800 text-center">{bookingCounts[c.id] ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyCode(c.access_code)}
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-dark-950 text-primary-400 hover:bg-dark-800"
                        title="Copy code"
                      >
                        <Copy size={10}/> Copy
                      </button>
                      <button
                        onClick={() => toggleActive(c)}
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border border-light-300 bg-white hover:bg-light-100 text-dark-700"
                        title={c.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {c.is_active ? <ToggleRight size={12} className="text-green-600"/> : <ToggleLeft size={12} className="text-dark-600"/>}
                        {c.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Institute Bookings section ── */}
      <div className="mt-6 pt-5 border-t border-light-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBookings(!showBookings)}
              className="flex items-center gap-2 text-sm font-bold text-dark-950 hover:text-dark-700"
            >
              <ChevronDown size={15} className={`transition-transform ${showBookings ? 'rotate-0' : '-rotate-90'}`}/>
              Institute Bookings
            </button>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{instBookings.length}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchInstBookings} className="flex items-center gap-1.5 text-xs font-semibold text-dark-800 hover:text-dark-950">
              <RefreshCw size={12} className={instBookingsLoading ? 'animate-spin' : ''}/> Refresh
            </button>
            <button
              onClick={() => {
                const flat = instBookings.map(b => ({
                  institute: b.coaching_centers?.name || '',
                  city: b.coaching_centers?.city || '',
                  exam_part: b.exam_part,
                  preferred_date: b.preferred_date,
                  session: b.session_time,
                  students: b.student_count,
                  payment: b.payment_method,
                  status: b.status || 'pending',
                  submitted: b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN') : '',
                }));
                exportCSV(flat, 'fets-institute-bookings.csv');
              }}
              disabled={!instBookings.length}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-dark-950 text-primary-400 hover:bg-dark-800 disabled:opacity-40"
            >
              <Download size={12}/> Export CSV
            </button>
          </div>
        </div>

        {showBookings && (
          instBookingsLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-primary-500"/></div>
          ) : instBookings.length === 0 ? (
            <p className="text-center py-8 text-sm text-dark-600">No institutional bookings yet.</p>
          ) : (
            <div>
              {groupByPeriod(instBookings, b => b.preferred_date).map(([period, items]) => (
                <div key={period}>
                  <PeriodHeader label={period} count={items.length} />
                  <div className="space-y-2">
                    {items.map(b => (
                      <div key={b.id} className="border border-light-200 rounded-xl overflow-hidden">
                        <button onClick={() => loadBookingStudents(b.id)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-light-50 hover:bg-light-100 text-left transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Bulk</span>
                            <span className="font-semibold text-dark-950 text-sm truncate">{b.coaching_centers?.name || 'Unknown Institute'}</span>
                            <span className="text-xs text-dark-600 shrink-0">{b.exam_part}</span>
                            <span className="text-xs text-dark-600 shrink-0">{b.student_count} students</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-dark-700">{b.preferred_date}</span>
                            <StatusBadge value={b.status || 'pending'} />
                            <ChevronDown size={13} className={`text-dark-600 transition-transform ${expandedBooking === b.id ? 'rotate-180' : ''}`}/>
                          </div>
                        </button>
                        {expandedBooking === b.id && (
                          <div className="px-4 py-4 border-t border-light-100 bg-white text-xs space-y-3">
                            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                              <div><span className="text-dark-600 font-semibold">Institute: </span><span className="text-dark-950 font-bold">{b.coaching_centers?.name || '—'}</span></div>
                              <div><span className="text-dark-600 font-semibold">City: </span><span className="text-dark-950">{b.coaching_centers?.city || '—'}</span></div>
                              <div><span className="text-dark-600 font-semibold">Session: </span><span className="text-dark-950">{b.session_time}</span></div>
                              <div><span className="text-dark-600 font-semibold">Payment: </span><span className="text-dark-950">{b.payment_method}</span></div>
                              <div><span className="text-dark-600 font-semibold">Submitted: </span><span className="text-dark-950">{b.created_at ? new Date(b.created_at).toLocaleString('en-IN') : '—'}</span></div>
                            </div>
                            {bookingStudents[b.id] && (
                              <div>
                                <p className="font-bold text-dark-950 mb-1.5">Student Roster ({bookingStudents[b.id].length})</p>
                                <div className="grid grid-cols-2 gap-1">
                                  {bookingStudents[b.id].map((s, i) => <span key={i} className="text-dark-700">{i + 1}. {s.student_name}</span>)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ─── Results Tab ─────────────────────────────────────────────────────────────

function parseDate(v) {
  if (!v) return null;
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (s.includes('/')) {
    const p = s.split('/');
    return p[0].length === 4
      ? `${p[0]}-${p[1].padStart(2,'0')}-${p[2].padStart(2,'0')}`
      : `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
  }
  const d = new Date(s);
  return isNaN(d) ? null : d.toISOString().split('T')[0];
}

function ResultsTab() {
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');

  // Upload state
  const [uploadMode, setUploadMode] = useState('institute'); // 'institute' | 'individual'
  const [centers, setCenters]     = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [parseErr, setParseErr]   = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef(null);

  const fetchResults = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from('exam_results')
      .select('*, coaching_centers(name, city)')
      .order('uploaded_at', { ascending: false });
    setResults(data || []);
    setLoading(false);
  }, []);

  const fetchCenters = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from('coaching_centers').select('id, name, city').eq('is_active', true).order('name');
    setCenters(data || []);
  }, []);

  useEffect(() => { fetchResults(); fetchCenters(); }, [fetchResults, fetchCenters]);

  const handleFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setParseErr(''); setParsedRows([]);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const data = rows.slice(1).filter(r => r[0]).map(r => ({
          student_name: String(r[0] || '').trim(),
          exam_part:    String(r[1] || '').trim() || null,
          exam_date:    parseDate(r[2]),
          score:        r[3] !== undefined && r[3] !== '' ? parseFloat(r[3]) : null,
          result_status: String(r[4] || '').toLowerCase().includes('pass') ? 'pass'
            : String(r[4] || '').toLowerCase().includes('fail') ? 'fail' : 'pending',
        }));
        if (!data.length) { setParseErr('No valid rows found. Check format.'); return; }
        setParsedRows(data);
      } catch (err) { setParseErr('Failed to parse: ' + err.message); }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Student Name', 'CMA Part', 'Exam Date', 'Score', 'Result'],
      ['John Doe', 'Part 1', '2026-04-10', '72', 'Pass'],
      ['Jane Smith', 'Part 2', '2026-04-10', '55', 'Fail'],
    ]);
    ws['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    XLSX.writeFile(wb, 'FETS_Results_Template.xlsx');
  };

  const handleUpload = async () => {
    if (uploadMode === 'institute' && !selectedCenter) { setUploadMsg({ ok: false, msg: 'Select an institute first.' }); return; }
    if (uploadMode === 'individual' && !candidateEmail.trim()) { setUploadMsg({ ok: false, msg: 'Enter candidate email first.' }); return; }
    if (!parsedRows.length) { setUploadMsg({ ok: false, msg: 'Parse an Excel file first.' }); return; }
    setUploading(true); setUploadMsg(null);
    try {
      const rows = parsedRows.map(r => ({
        ...r,
        ...(uploadMode === 'institute'
          ? { coaching_center_id: selectedCenter }
          : { candidate_email: candidateEmail.trim().toLowerCase() }),
      }));
      const { error } = await supabase.from('exam_results').insert(rows);
      if (error) throw error;
      setUploadMsg({ ok: true, msg: `${rows.length} results published.${uploadMode === 'institute' ? ' Institute dashboard updated.' : ' Candidate dashboard updated.'}` });
      setParsedRows([]); if (fileRef.current) fileRef.current.value = '';
      fetchResults();
    } catch (err) { setUploadMsg({ ok: false, msg: err.message || 'Upload failed.' }); }
    finally { setUploading(false); }
  };

  const filtered = results.filter(r => {
    const matchStatus = filter === 'all' || r.result_status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.student_name || '').toLowerCase().includes(q) ||
      (r.coaching_centers?.name || '').toLowerCase().includes(q) ||
      (r.exam_part || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const doExportCSV = () => {
    const header = ['Student Name', 'Exam Part', 'Exam Date', 'Score', 'Result', 'Institute', 'City', 'Published At'];
    const rows = filtered.map(r => [
      r.student_name, r.exam_part || '', r.exam_date || '', r.score ?? '',
      r.result_status, r.coaching_centers?.name || '', r.coaching_centers?.city || '',
      r.uploaded_at ? new Date(r.uploaded_at).toLocaleString('en-IN') : '',
    ]);
    const csv = [header, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `FETS_Results_${new Date().toISOString().split('T')[0]}.csv`;
    a.style.display = 'none'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const statusBadge = (s) => {
    if (s === 'pass') return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">PASS</span>;
    if (s === 'fail') return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">FAIL</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-500">PENDING</span>;
  };

  return (
    <div className="space-y-5">

      {/* ── Upload section ── */}
      <div className="rounded-xl border border-light-200 overflow-hidden">
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="w-full flex items-center justify-between px-4 py-3 bg-dark-950 text-white hover:bg-dark-900 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <Upload size={14} className="text-primary-400"/> Publish Results to Institutes
          </div>
          <ChevronDown size={14} className={`transition-transform text-white/40 ${showUpload ? 'rotate-180' : ''}`}/>
        </button>

        {showUpload && (
          <div className="p-4 bg-light-50 space-y-4">
            {/* Mode toggle */}
            <div className="flex gap-1 bg-light-200 rounded-xl p-1">
              {[['institute', 'Institute Results'], ['individual', 'Individual Candidate']].map(([mode, label]) => (
                <button key={mode} onClick={() => { setUploadMode(mode); setUploadMsg(null); setParsedRows([]); if (fileRef.current) fileRef.current.value = ''; }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${uploadMode === mode ? 'bg-dark-950 text-white shadow-sm' : 'text-dark-700 hover:text-dark-950'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Template download */}
            <div className="flex items-center justify-between rounded-lg border border-light-200 bg-white px-4 py-3">
              <div>
                <p className="text-xs font-bold text-dark-950 mb-0.5">Excel Format: Student Name · CMA Part · Exam Date · Score · Result (Pass/Fail)</p>
                <p className="text-[11px] text-dark-600">Download template for the correct column order</p>
              </div>
              <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-dark-950 text-primary-400 hover:bg-dark-800 shrink-0">
                <Download size={12}/> Template
              </button>
            </div>

            {/* Institute selector OR candidate email */}
            {uploadMode === 'institute' ? (
              <div>
                <label className="block text-[10px] font-bold text-dark-700 mb-1.5 uppercase tracking-wider">Select Institute *</label>
                <select value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)} className="input-clean text-sm w-full">
                  <option value="">— Choose institute —</option>
                  {centers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.city ? ` (${c.city})` : ''}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-dark-700 mb-1.5 uppercase tracking-wider">Candidate Email *</label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={e => setCandidateEmail(e.target.value)}
                  placeholder="candidate@email.com"
                  className="input-clean text-sm w-full"
                />
                <p className="text-[11px] text-dark-500 mt-1">Results will appear in this candidate's personal dashboard when they log in.</p>
              </div>
            )}

            {/* File upload */}
            <div>
              <label className="block text-[10px] font-bold text-dark-700 mb-1.5 uppercase tracking-wider">Upload Excel File *</label>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="input-clean text-sm w-full cursor-pointer" />
            </div>

            {parseErr && <p className="text-red-600 text-xs font-medium">{parseErr}</p>}

            {/* Preview */}
            {parsedRows.length > 0 && (
              <div className="rounded-lg border border-light-200 overflow-hidden">
                <div className="px-3 py-2 bg-emerald-50 border-b border-light-200 flex items-center justify-between">
                  <p className="text-xs font-bold text-emerald-700">{parsedRows.length} rows ready to publish</p>
                  <span className="text-[10px] text-dark-600">Preview (first 5)</span>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-light-100">
                    <tr>{['Student Name','Part','Date','Score','Result'].map(h => <th key={h} className="px-3 py-2 text-left font-bold text-dark-700">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0,5).map((r,i) => (
                      <tr key={i} className="border-t border-light-100">
                        <td className="px-3 py-1.5 font-medium text-dark-950">{r.student_name}</td>
                        <td className="px-3 py-1.5 text-dark-700">{r.exam_part || '—'}</td>
                        <td className="px-3 py-1.5 text-dark-700">{r.exam_date || '—'}</td>
                        <td className="px-3 py-1.5 text-dark-700">{r.score ?? '—'}</td>
                        <td className="px-3 py-1.5">{statusBadge(r.result_status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {uploadMsg && (
              <div className={`rounded-lg px-4 py-3 text-sm font-semibold ${uploadMsg.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {uploadMsg.msg}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !parsedRows.length || (uploadMode === 'institute' ? !selectedCenter : !candidateEmail.trim())}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-dark-950 text-white text-sm font-bold hover:bg-dark-800 disabled:opacity-40 transition-all"
            >
              {uploading ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14}/>}
              {uploading ? 'Publishing…' : `Publish ${parsedRows.length || ''} Results${uploadMode === 'institute' ? ' to Institute Dashboard' : ' to Candidate Dashboard'}`}
            </button>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: results.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Passed', value: results.filter(r => r.result_status === 'pass').length, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Failed', value: results.filter(r => r.result_status === 'fail').length, color: 'bg-red-50 text-red-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-3 ${color} border border-current/10`}>
            <p className="text-xs font-semibold opacity-70">{label}</p>
            <p className="text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search student, institute, exam part…" className="input-clean flex-1 min-w-[200px] text-sm" />
        <div className="flex gap-1 bg-light-100 rounded-lg p-1">
          {['all', 'pass', 'fail', 'pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-bold capitalize transition-all ${filter === f ? 'bg-dark-950 text-white shadow-sm' : 'text-dark-700 hover:text-dark-950'}`}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={doExportCSV} disabled={!filtered.length}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-950 text-white text-xs font-bold hover:bg-dark-900 disabled:opacity-40">
          <Download size={13}/> Export CSV
        </button>
        <button onClick={fetchResults} className="p-2 text-dark-600 hover:text-dark-950">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/>
        </button>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-dark-600"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-dark-600 text-sm">
          {results.length === 0 ? 'No results published yet. Use the upload section above.' : 'No results match your filters.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-light-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-light-100 border-b border-light-200">
                {['Student Name','Exam Part','Exam Date','Score','Result','Institute','Published'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-black text-dark-700 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-light-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-light-50">
                  <td className="px-3 py-2.5 font-semibold text-dark-950 whitespace-nowrap">{r.student_name}</td>
                  <td className="px-3 py-2.5 text-dark-700">{r.exam_part || '—'}</td>
                  <td className="px-3 py-2.5 text-dark-700 whitespace-nowrap">{r.exam_date ? new Date(r.exam_date + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}</td>
                  <td className="px-3 py-2.5 text-dark-700 text-center font-mono">{r.score ?? '—'}</td>
                  <td className="px-3 py-2.5">{statusBadge(r.result_status)}</td>
                  <td className="px-3 py-2.5 text-dark-700">
                    <span className="font-medium">{r.coaching_centers?.name || '—'}</span>
                    {r.coaching_centers?.city && <span className="text-dark-500 text-xs ml-1">({r.coaching_centers.city})</span>}
                  </td>
                  <td className="px-3 py-2.5 text-dark-500 text-xs whitespace-nowrap">{r.uploaded_at ? new Date(r.uploaded_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'leads',      label: 'Leads',          icon: Bell,      count: true },
  { id: 'cma',        label: 'CMA Requests',   icon: BookOpen,  count: true },
  { id: 'bookings',   label: 'Slot Bookings',  icon: Users,     count: true },
  { id: 'institutes', label: 'Institutes',     icon: Building2, count: true },
  { id: 'results',    label: 'Results',        icon: Trophy,    count: true },
  { id: 'manage',     label: 'Manage Seats',   icon: Edit3 },
  { id: 'upload',     label: 'Upload Excel',   icon: Table2 },
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

  /* ── Login screen ── */
  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0a0a0a]/95 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border border-light-200">
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
            Password: <span className="font-mono">fets@in</span>
          </p>
        </div>
      </div>
    );
  }

  const activeTab = TABS.find(t => t.id === tab);

  /* ── Full-page admin dashboard ── */
  return (
    <div className="fixed inset-0 z-[70] flex">

      {/* ── Sidebar ── */}
      <div className="w-52 xl:w-60 bg-[#0e0e0e] border-r border-white/[0.06] flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <p className="text-[#FFD000] font-black text-lg tracking-tight leading-none">FETS</p>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                tab === t.id
                  ? 'bg-[#FFD000] text-[#0a0a0a]'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <t.icon size={15} className="shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Supabase warning */}
        {!isSupabaseConfigured && (
          <div className="mx-2 mb-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            <p className="text-amber-400 text-[10px] font-bold leading-snug">⚠ Supabase not configured</p>
          </div>
        )}

        {/* Exit */}
        <div className="px-2 py-3 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X size={14} className="shrink-0" />
            Close Admin
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Page header */}
        <div className="flex items-center gap-3 px-6 h-14 border-b border-light-200 shrink-0 bg-white">
          {activeTab && <activeTab.icon size={16} className="text-dark-600 shrink-0" />}
          <h2 className="text-sm font-black text-dark-950 tracking-tight">{activeTab?.label}</h2>
          <div className="ml-auto">
            <p className="text-[10px] text-dark-500 font-mono">fets.in/?admin=true</p>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6 xl:p-8">
          {tab === 'leads'      && <LeadsTab />}
          {tab === 'cma'        && <CmaRequestsTab />}
          {tab === 'bookings'   && <BookingsTab />}
          {tab === 'institutes' && <InstitutesTab />}
          {tab === 'results'    && <ResultsTab />}
          {tab === 'manage'     && <ManageTab />}
          {tab === 'upload'     && <UploadTab />}
        </div>
      </div>
    </div>
  );
}
