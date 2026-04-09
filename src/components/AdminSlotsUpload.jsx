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
      <span className="text-[10px] font-black text-[#FFD000]/70 uppercase tracking-[0.25em]">{label}</span>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD000]/10 text-[#FFD000]/60">{count}</span>
      <div className="flex-1 h-px bg-white/[0.08]"/>
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
      <div className="bg-[#FFD000]/[0.05] border border-[#FFD000]/20 rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-3">Accepted formats</p>
        <div className="space-y-2 text-xs">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3">
            <p className="font-bold text-white mb-1">✓ FETS Tracking Form (your existing files)</p>
            <p className="text-white/50">The "Seat Availability Tracking Form" Excel — just upload as-is. Morning = 9:00 AM, Noon = 2:00 PM.</p>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3">
            <p className="font-bold text-white mb-1">✓ Simple format</p>
            <p className="font-mono text-white/50">Date | Center | Time Slot | Total Seats | Booked</p>
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-white/[0.12] rounded-2xl p-10 text-center cursor-pointer hover:border-[#FFD000]/40 hover:bg-white/[0.02] transition-all"
        onClick={() => document.getElementById('admin-slot-file').click()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}
      >
        <input
          type="file" id="admin-slot-file" accept=".xlsx,.xls,.csv" className="hidden"
          onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
        />
        <FileSpreadsheet size={36} className="mx-auto text-[#FFD000]/60 mb-3" />
        <p className="font-bold text-white text-sm mb-1">
          {fileName || 'Drop your Excel / CSV here'}
        </p>
        <p className="text-xs text-white/40">
          {parsedRows ? `${parsedRows.length} valid rows loaded` : 'or click to browse (.xlsx, .xls, .csv)'}
        </p>
      </div>

      {parseError && (
        <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <AlertCircle size={15} className="shrink-0 mt-0.5"/> {parseError}
        </div>
      )}

      {/* Preview */}
      {parsedRows?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
            Preview — first {Math.min(6, parsedRows.length)} of {parsedRows.length} rows
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full text-xs">
              <thead className="bg-white/[0.06]">
                <tr>{['Date','Center','Session','Total','Booked','Available'].map(h=>(
                  <th key={h} className="px-3 py-2 text-left font-bold text-white/70 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {parsedRows.slice(0,6).map((r,i)=>(
                  <tr key={i} className="border-t border-white/[0.06]">
                    <td className="px-3 py-2 text-white/60">{r.date}</td>
                    <td className="px-3 py-2 text-white/60">{r.center}</td>
                    <td className="px-3 py-2 text-white/60">{r.time_slot}</td>
                    <td className="px-3 py-2 text-white/60">{r.total_seats}</td>
                    <td className="px-3 py-2 text-white/60">{r.booked_seats}</td>
                    <td className="px-3 py-2 font-bold text-emerald-400">{r.total_seats - r.booked_seats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {parsedRows && (
        <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer select-none">
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
          result.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {result.success ? <CheckCircle size={15} className="shrink-0 mt-0.5"/> : <AlertCircle size={15} className="shrink-0 mt-0.5"/>}
          {result.success ? `Successfully uploaded ${result.count} slot entries.` : `Error: ${result.message}`}
        </div>
      )}

      <button
        onClick={upload}
        disabled={!parsedRows || uploading}
        className="w-full h-12 rounded-xl bg-[#FFD000] text-[#0a0a0a] font-black text-sm hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,208,0,0.2)]"
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

  const selectCls = 'px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/70 text-xs cursor-pointer focus:outline-none focus:border-[#FFD000]/40';

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={13} className="text-white/40 shrink-0"/>
        <select value={filterCenter} onChange={e => setFilterCenter(e.target.value)} className={selectCls} style={{ colorScheme: 'dark' }}>
          {centers.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={selectCls} style={{ colorScheme: 'dark' }}>
          {months.map(m => <option key={m}>{m === 'All' ? 'All Months' : new Date(m+'-01').toLocaleString('default',{month:'long',year:'numeric'})}</option>)}
        </select>
        <button onClick={fetchSlots} className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={26} className="animate-spin text-[#FFD000]/40"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center">
          <p className="text-sm text-white/30">No slots found for the selected filters.</p>
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
              <div key={key} className="border border-white/[0.08] rounded-xl overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(key)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.04] hover:bg-white/[0.06] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      group.center === 'Cochin' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>{group.center}</span>
                    <span className="font-semibold text-white text-sm">{fmtDate(group.date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/40">
                      {totalAvail} seat{totalAvail !== 1 ? 's' : ''} available
                    </span>
                    <ChevronDown size={15} className={`text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
                  </div>
                </button>

                {/* Slot rows */}
                {isOpen && (
                  <div className="divide-y divide-white/[0.05]">
                    {group.slots.map(slot => {
                      const e      = getEdit(slot);
                      const dirty  = isDirty(slot);
                      const avail  = Math.max(0, e.total_seats - e.booked_seats);
                      const isSaving = saving[slot.id];
                      const res    = saveResult[slot.id];

                      return (
                        <div key={slot.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 bg-white/[0.01]">
                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-white/80 text-sm">{slot.time_slot}</span>
                              {slot.part && <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFD000]/10 text-[#FFD000]/70 font-semibold">{slot.part}</span>}
                              <span className={`text-[11px] font-semibold ${avail === 0 ? 'text-red-400' : avail <= 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {avail === 0 ? 'Full' : `${avail} available`}
                              </span>
                            </div>
                          </div>

                          {/* Editable fields */}
                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <label className="text-xs text-white/40 whitespace-nowrap">Total</label>
                              <input
                                type="number" min="0" max="999"
                                value={e.total_seats}
                                onChange={ev => setEdit(slot.id, 'total_seats', ev.target.value)}
                                className="w-16 text-center text-sm font-bold border border-white/[0.12] rounded-lg py-1 bg-white/[0.06] text-white focus:border-[#FFD000]/40 focus:outline-none"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <label className="text-xs text-white/40 whitespace-nowrap">Booked</label>
                              <input
                                type="number" min="0"
                                value={e.booked_seats}
                                onChange={ev => setEdit(slot.id, 'booked_seats', ev.target.value)}
                                className="w-16 text-center text-sm font-bold border border-white/[0.12] rounded-lg py-1 bg-white/[0.06] text-white focus:border-[#FFD000]/40 focus:outline-none"
                              />
                            </div>

                            {dirty && !res && (
                              <button
                                onClick={() => saveSlot(slot)}
                                disabled={isSaving}
                                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FFD000] text-[#0a0a0a] hover:bg-[#ffe44d] transition-colors disabled:opacity-50"
                              >
                                {isSaving ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>}
                                {isSaving ? 'Saving' : 'Save'}
                              </button>
                            )}
                            {res === 'ok' && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400"><CheckCircle size={13}/> Saved</span>}
                            {res === 'err' && <span className="flex items-center gap-1 text-xs font-semibold text-red-400"><AlertCircle size={13}/> Error</span>}
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

      <p className="text-xs text-white/20 text-center pt-1">
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
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center">
      <p className="text-sm text-white/30">{emptyMsg}</p>
    </div>
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full text-xs min-w-[600px]">
        <thead className="bg-white/[0.06] border-b border-white/[0.08]">
          <tr>
            {columns.map(c => (
              <th key={c.key} className="px-3 py-2.5 text-left font-bold text-white/70 whitespace-nowrap uppercase tracking-wider text-[10px]">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-white/[0.06] hover:bg-white/[0.03] transition-colors">
              {columns.map(c => (
                <td key={c.key} className="px-3 py-2.5 text-white/60 whitespace-nowrap max-w-[200px] truncate">
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

  const fetchLeads = useCallback(async () => {
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

  useEffect(() => { void fetchLeads(); }, [fetchLeads]);

  return (
    <div className="space-y-8 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-black text-white tracking-tight">Early Access Leads</p>
          <p className="text-xs text-white/40 mt-1 font-medium">Waitlist and expression of interest</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchLeads} className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
          <button onClick={() => exportCSV(rows, 'fets-leads.csv')} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[#FFD000] text-[#0a0a0a] hover:bg-[#ffe44d] transition-all shadow-[0_4px_20px_rgba(255,208,0,0.2)]">
            <Download size={13}/> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={26} className="animate-spin text-[#FFD000]/40"/></div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-8 py-16 text-center text-sm text-white/30 font-medium">No early access registrations yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rows.map(row => (
            <div key={row.id} className="group relative rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all hover:bg-white/[0.03] hover:border-white/[0.1] shadow-xl p-5">
               <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#FFD000] blur-[40px] opacity-[0.03] group-hover:opacity-[0.08] transition-all pointer-events-none" style={{ transform: 'translate(30%, -30%)' }} />
               
               <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[14px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                        <span className="font-black text-[#FFD000] text-sm">{row.full_name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-[15px] leading-tight">{row.full_name}</h4>
                        <p className="text-[10px] font-semibold text-[#FFD000]/80 tracking-widest uppercase mt-0.5">{row.interested_exam || 'UNKNOWN'}</p>
                      </div>
                    </div>
                 </div>

                 <div className="space-y-3 pt-4 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/30">Email</span>
                      <span className="text-xs font-medium text-white/80 select-all">{row.email || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/30">Phone</span>
                      <span className="text-xs font-medium text-white/80 select-all">{row.phone || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/30">Date</span>
                      <span className="text-xs font-medium text-white/80">{new Date(row.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                    </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
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
        <p className="text-sm font-bold text-white">{rows.length} <span className="text-white/40 font-normal">bookings</span></p>
        <div className="flex gap-2">
          <button onClick={fetch} className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
          <button onClick={() => exportCSV(rows, 'fets-bookings.csv')} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FFD000] text-[#0a0a0a] hover:bg-[#ffe44d] transition-colors">
            <Download size={12}/> Export CSV
          </button>
        </div>
      </div>
      {loading
        ? <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-[#FFD000]/40"/></div>
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
        <p className="text-sm font-bold text-white">{rows.length} <span className="text-white/40 font-normal">CMA mock requests</span></p>
        <div className="flex gap-2">
          <button onClick={fetch} className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
          <button onClick={exportAll} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FFD000] text-[#0a0a0a] hover:bg-[#ffe44d] transition-colors">
            <Download size={12}/> Export CSV
          </button>
        </div>
      </div>

      {loading
        ? <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-[#FFD000]/40"/></div>
        : rows.length === 0
          ? <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center"><p className="text-sm text-white/30">No CMA mock requests yet.</p></div>
          : groupByPeriod(rows, r => r.preferred_date).map(([period, items]) => (
            <div key={period}>
              <PeriodHeader label={period} count={items.length} />
              <div className="space-y-2">
                {items.map(r => (
                  <div key={r.id} className="border border-white/[0.08] rounded-xl overflow-hidden">
                    <button
                      onClick={() => r.booking_type === 'institutional' ? loadStudents(r.id) : setExpanded(expanded === r.id ? null : r.id)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] text-left transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${r.booking_type === 'institutional' ? 'bg-blue-500/15 text-blue-400' : 'bg-[#FFD000]/15 text-[#FFD000]/80'}`}>
                          {r.booking_type === 'institutional' ? 'Bulk' : 'Direct'}
                        </span>
                        <span className="font-semibold text-white text-sm truncate">
                          {r.lead_name || `Coaching Center · ${r.student_count} students`}
                        </span>
                        <span className="text-xs text-white/40 shrink-0">{r.exam_part}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-white/40">{r.preferred_date}</span>
                        <StatusBadge value={r.status} />
                        <ChevronDown size={14} className={`text-white/30 transition-transform ${expanded === r.id ? 'rotate-180' : ''}`}/>
                      </div>
                    </button>
                    {expanded === r.id && (
                      <div className="px-4 py-4 border-t border-white/[0.06] bg-white/[0.02] text-xs space-y-3">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          {r.booking_type === 'direct' && <>
                            <div><span className="text-white/40 font-semibold">Email: </span><span className="text-white/70">{r.lead_email || '—'}</span></div>
                            <div><span className="text-white/40 font-semibold">Phone: </span><span className="text-white/70">{r.lead_phone || '—'}</span></div>
                          </>}
                          {r.confirmation_code && <div><span className="text-white/40 font-semibold">Booking Code: </span><span className="font-mono font-bold text-[#FFD000]">{r.confirmation_code}</span></div>}
                          <div><span className="text-white/40 font-semibold">Session: </span><span className="text-white/70">{r.session_time}</span></div>
                          <div><span className="text-white/40 font-semibold">Payment: </span><span className="text-white/70">{r.payment_method}</span></div>
                          <div><span className="text-white/40 font-semibold">Submitted: </span><span className="text-white/70">{r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : '—'}</span></div>
                        </div>
                        {r.booking_type === 'institutional' && students[r.id] && (
                          <div>
                            <p className="font-bold text-white/80 mb-1.5">Student Roster ({students[r.id].length})</p>
                            <ol className="space-y-1">
                              {students[r.id].map((s, i) => <li key={i} className="text-white/50">{i + 1}. {s.student_name}</li>)}
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

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight">Overview</h2>
      </div>
      <div className="rounded-2xl border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)' }}>
        <div className="p-8 text-center text-white/50">
           Welcome to FETS Command Centre. This dashboard will contain the overview metrics in later phases.
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Tab ─────────────────────────────────────────────────────────────

function CalendarTab() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('mock_exam_slots').select('*').order('date', { ascending: true })
      .then(({ data }) => { setSlots(data || []); setLoading(false); });
  }, []);

  const getOccupancy = (s) => (s.booked_seats / s.total_seats) * 100;

  if (loading) return <div className="text-center p-8 text-white/50 animate-pulse">Loading schedule...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white">Exam Calendar</h2>
          <p className="text-sm text-white/40 mt-1">Live slot occupancy and schedule</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map(s => {
          const occ = getOccupancy(s);
          return (
            <div key={s.id} className="relative rounded-2xl p-5 border border-white/[0.08] overflow-hidden group" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>
              <div className="flex items-start justify-between mb-4 relative">
                <div>
                  <div className="text-[#FFD000] font-black text-xs tracking-widest uppercase mb-1">{fmtDate(s.date)}</div>
                  <div className="text-white font-bold">{s.time_slot}</div>
                  <div className="text-white/40 text-xs mt-0.5">{s.center}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-white">{s.booked_seats}<span className="text-white/40 text-sm">/{s.total_seats}</span></div>
                  <div className="text-[10px] text-white/40 uppercase font-bold mt-1 tracking-widest">Booked</div>
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-[#FFD000] to-[#f5a623] rounded-full" style={{ width: `${occ}%` }}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

// ─── Candidates Tab ───────────────────────────────────────────────────────────

function CandidatesTab() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('cma_mock_bookings')
      .select('*, coaching_centers(name)')
      .eq('booking_type', 'direct')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setCandidates(data || []); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center p-8 text-white/50 animate-pulse">Loading candidates...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white">Candidates</h2>
          <p className="text-sm text-white/40 mt-1">Direct bookings roster</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map(r => (
            <div key={r.id} className="rounded-2xl p-5 border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-white max-w-[150px] truncate">{r.lead_name || '—'}</h3>
                {r.confirmation_code && <span className="font-mono text-xs font-bold text-[#FFD000] py-0.5 px-2 bg-[#FFD000]/10 rounded-full">{r.confirmation_code}</span>}
              </div>
              <div className="space-y-1.5 text-xs text-white/60">
                <p>📧 {r.lead_email || '—'}</p>
                <p>📞 {r.lead_phone || '—'}</p>
                <p>📅 {fmtDate(r.exam_date)}</p>
                <p>⏰ {r.session_time}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/40">
                 <span>{r.exam_part || 'Full'}</span>
                 <StatusBadge value={r.payment_status} />
              </div>
            </div>
        ))}
      </div>
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
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Institute Added — Share this Access Code</p>
            <p className="font-mono font-black text-[#FFD000] text-xl tracking-widest">{successCode}</p>
          </div>
          <button onClick={() => { copyCode(successCode); setSuccessCode(''); }} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30">
            <Copy size={12}/> Copy & Dismiss
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white">{centers.length} <span className="text-white/40 font-normal">partner institutes</span></p>
        <div className="flex gap-2">
          <button onClick={fetchCenters} className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FFD000] text-[#0a0a0a] hover:bg-[#ffe44d] transition-colors">
            <Plus size={12}/> Add Institute
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-white/[0.10] rounded-2xl p-5 bg-white/[0.04] space-y-4">
          <h4 className="font-bold text-white text-sm">Add New Institute</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Institute Name *', val: name, set: setName, placeholder: 'Institute name' },
              null,
              { label: 'Contact Person *', val: contactPerson, set: setContactPerson, placeholder: 'Contact person name' },
              { label: 'Phone *', val: phone, set: setPhone, placeholder: '+91 XXXXX XXXXX', type: 'tel' },
            ].map((field, i) => field ? (
              <div key={i}>
                <label className="block text-[10px] font-bold text-white/40 mb-1 uppercase tracking-wider">{field.label}</label>
                <input value={field.val} onChange={e => field.set(e.target.value)} placeholder={field.placeholder} type={field.type || 'text'}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/40 transition-colors text-sm" required />
              </div>
            ) : (
              <div key={i}>
                <label className="block text-[10px] font-bold text-white/40 mb-1 uppercase tracking-wider">City *</label>
                <select value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white focus:outline-none focus:border-[#FFD000]/40 transition-colors text-sm" style={{ colorScheme: 'dark' }}>
                  <option>Calicut</option><option>Kochi</option><option>Other</option>
                </select>
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-white/40 mb-1 uppercase tracking-wider">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="institute@email.com"
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/40 transition-colors text-sm" required />
            </div>
          </div>
          {formError && <p className="text-red-400 text-xs">{formError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl bg-[#FFD000] text-[#0a0a0a] font-black hover:bg-[#ffe44d] transition-all">
              {submitting ? <Loader2 size={13} className="animate-spin"/> : <Plus size={13}/>} Create Institute
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs font-bold text-white/40 hover:text-white px-3 py-2 rounded-xl border border-white/[0.10] hover:border-white/20 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-[#FFD000]/40"/></div>
      ) : centers.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center"><p className="text-sm text-white/30">No institutes added yet.</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="w-full text-xs min-w-[700px]">
            <thead className="bg-white/[0.06] border-b border-white/[0.08]">
              <tr>
                {['Name', 'City', 'Access Code', 'Contact', 'Phone', 'Status', '# Bookings', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-bold text-white/60 whitespace-nowrap uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {centers.map(c => (
                <tr key={c.id} className="border-t border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                  <td className="px-3 py-2.5 font-semibold text-white max-w-[160px] truncate">{c.name}</td>
                  <td className="px-3 py-2.5 text-white/50">{c.city || '—'}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className="font-mono cursor-pointer select-none text-white/40 hover:text-[#FFD000] transition-colors"
                      title="Hover to reveal"
                      onMouseEnter={() => setRevealedCodes(p => ({ ...p, [c.id]: true }))}
                      onMouseLeave={() => setRevealedCodes(p => ({ ...p, [c.id]: false }))}
                    >
                      {revealedCodes[c.id] ? c.access_code : '••••••••••••'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-white/50">{c.contact_name || c.contact || '—'}</td>
                  <td className="px-3 py-2.5 text-white/50">{c.contact || '—'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-white/50 text-center">{bookingCounts[c.id] ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => copyCode(c.access_code)}
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-[#FFD000]/10 text-[#FFD000]/80 hover:bg-[#FFD000]/20 transition-colors border border-[#FFD000]/20"
                        title="Copy code">
                        <Copy size={10}/> Copy
                      </button>
                      <button onClick={() => toggleActive(c)}
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08] text-white/50 transition-colors"
                        title={c.is_active ? 'Deactivate' : 'Activate'}>
                        {c.is_active ? <ToggleRight size={12} className="text-emerald-400"/> : <ToggleLeft size={12} className="text-white/30"/>}
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
      <div className="mt-6 pt-5 border-t border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBookings(!showBookings)}
              className="flex items-center gap-2 text-sm font-bold text-white hover:text-white/70 transition-colors"
            >
              <ChevronDown size={15} className={`transition-transform ${showBookings ? 'rotate-0' : '-rotate-90'}`}/>
              Institute Bookings
            </button>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">{instBookings.length}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchInstBookings} className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors">
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
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FFD000] text-[#0a0a0a] hover:bg-[#ffe44d] transition-colors disabled:opacity-40"
            >
              <Download size={12}/> Export CSV
            </button>
          </div>
        </div>

        {showBookings && (
          instBookingsLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#FFD000]/40"/></div>
          ) : instBookings.length === 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-8 text-center"><p className="text-sm text-white/30">No institutional bookings yet.</p></div>
          ) : (
            <div>
              {groupByPeriod(instBookings, b => b.preferred_date).map(([period, items]) => (
                <div key={period}>
                  <PeriodHeader label={period} count={items.length} />
                  <div className="space-y-2">
                    {items.map(b => (
                      <div key={b.id} className="border border-white/[0.08] rounded-xl overflow-hidden">
                        <button onClick={() => loadBookingStudents(b.id)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] text-left transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">Bulk</span>
                            <span className="font-semibold text-white text-sm truncate">{b.coaching_centers?.name || 'Unknown Institute'}</span>
                            <span className="text-xs text-white/40 shrink-0">{b.exam_part}</span>
                            <span className="text-xs text-white/40 shrink-0">{b.student_count} students</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-white/40">{b.preferred_date}</span>
                            <StatusBadge value={b.status || 'pending'} />
                            <ChevronDown size={13} className={`text-white/30 transition-transform ${expandedBooking === b.id ? 'rotate-180' : ''}`}/>
                          </div>
                        </button>
                        {expandedBooking === b.id && (
                          <div className="px-4 py-4 border-t border-white/[0.06] bg-white/[0.02] text-xs space-y-3">
                            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                              <div><span className="text-white/40 font-semibold">Institute: </span><span className="text-white font-bold">{b.coaching_centers?.name || '—'}</span></div>
                              <div><span className="text-white/40 font-semibold">City: </span><span className="text-white/70">{b.coaching_centers?.city || '—'}</span></div>
                              <div><span className="text-white/40 font-semibold">Session: </span><span className="text-white/70">{b.session_time}</span></div>
                              <div><span className="text-white/40 font-semibold">Payment: </span><span className="text-white/70">{b.payment_method}</span></div>
                              <div><span className="text-white/40 font-semibold">Submitted: </span><span className="text-white/70">{b.created_at ? new Date(b.created_at).toLocaleString('en-IN') : '—'}</span></div>
                            </div>
                            {bookingStudents[b.id] && (
                              <div>
                                <p className="font-bold text-white/80 mb-1.5">Student Roster ({bookingStudents[b.id].length})</p>
                                <div className="grid grid-cols-2 gap-1">
                                  {bookingStudents[b.id].map((s, i) => <span key={i} className="text-white/50">{i + 1}. {s.student_name}</span>)}
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
      <div className="rounded-2xl border border-white/[0.10] overflow-hidden">
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="w-full flex items-center justify-between px-5 py-4 bg-[#FFD000]/[0.08] hover:bg-[#FFD000]/[0.12] transition-colors border-b border-[#FFD000]/10"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Upload size={14} className="text-[#FFD000]"/> Publish Exam Results
          </div>
          <ChevronDown size={14} className={`transition-transform text-white/30 ${showUpload ? 'rotate-180' : ''}`}/>
        </button>

        {showUpload && (
          <div className="p-5 bg-white/[0.02] space-y-4">
            {/* Mode toggle */}
            <div className="flex gap-1 bg-white/[0.06] rounded-xl p-1">
              {[['institute', 'Institute Results'], ['individual', 'Individual Candidate']].map(([mode, label]) => (
                <button key={mode} onClick={() => { setUploadMode(mode); setUploadMsg(null); setParsedRows([]); if (fileRef.current) fileRef.current.value = ''; }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${uploadMode === mode ? 'bg-[#FFD000] text-[#0a0a0a] shadow-sm' : 'text-white/40 hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Template download */}
            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
              <div>
                <p className="text-xs font-bold text-white mb-0.5">Excel Format: Student Name · CMA Part · Exam Date · Score · Result (Pass/Fail)</p>
                <p className="text-[11px] text-white/40">Download template for the correct column order</p>
              </div>
              <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FFD000]/10 text-[#FFD000]/80 hover:bg-[#FFD000]/20 border border-[#FFD000]/20 shrink-0">
                <Download size={12}/> Template
              </button>
            </div>

            {/* Institute selector OR candidate email */}
            {uploadMode === 'institute' ? (
              <div>
                <label className="block text-[10px] font-bold text-white/40 mb-1.5 uppercase tracking-wider">Select Institute *</label>
                <select value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white focus:outline-none focus:border-[#FFD000]/40 transition-colors text-sm"
                  style={{ colorScheme: 'dark' }}>
                  <option value="">— Choose institute —</option>
                  {centers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.city ? ` (${c.city})` : ''}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-white/40 mb-1.5 uppercase tracking-wider">Candidate Email *</label>
                <input type="email" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)}
                  placeholder="candidate@email.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFD000]/40 transition-colors text-sm" />
                <p className="text-[11px] text-white/30 mt-1.5">Results will appear in this candidate's personal dashboard when they log in.</p>
              </div>
            )}

            {/* File upload */}
            <div>
              <label className="block text-[10px] font-bold text-white/40 mb-1.5 uppercase tracking-wider">Upload Excel File *</label>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white/60 focus:outline-none focus:border-[#FFD000]/40 transition-colors text-sm cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-white/[0.08] file:text-white/60 file:text-xs file:font-bold hover:file:bg-white/[0.12]" />
            </div>

            {parseErr && <p className="text-red-400 text-xs font-medium">{parseErr}</p>}

            {/* Preview */}
            {parsedRows.length > 0 && (
              <div className="rounded-xl border border-white/[0.08] overflow-hidden">
                <div className="px-3 py-2 bg-emerald-500/10 border-b border-white/[0.06] flex items-center justify-between">
                  <p className="text-xs font-bold text-emerald-400">{parsedRows.length} rows ready to publish</p>
                  <span className="text-[10px] text-white/30">Preview (first 5)</span>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-white/[0.05]">
                    <tr>{['Student Name','Part','Date','Score','Result'].map(h => <th key={h} className="px-3 py-2 text-left font-bold text-white/50 uppercase tracking-wider text-[10px]">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0,5).map((r,i) => (
                      <tr key={i} className="border-t border-white/[0.05]">
                        <td className="px-3 py-1.5 font-medium text-white">{r.student_name}</td>
                        <td className="px-3 py-1.5 text-white/50">{r.exam_part || '—'}</td>
                        <td className="px-3 py-1.5 text-white/50">{r.exam_date || '—'}</td>
                        <td className="px-3 py-1.5 text-white/50">{r.score ?? '—'}</td>
                        <td className="px-3 py-1.5">{statusBadge(r.result_status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {uploadMsg && (
              <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${uploadMsg.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
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
          { label: 'Total', value: results.length, cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
          { label: 'Passed', value: results.filter(r => r.result_status === 'pass').length, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
          { label: 'Failed', value: results.filter(r => r.result_status === 'fail').length, cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`rounded-2xl p-4 border ${cls}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{label}</p>
            <p className="text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search student, institute, exam part…"
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-white/25 focus:outline-none focus:border-[#FFD000]/40 transition-colors text-sm" />
        <div className="flex gap-0.5 bg-white/[0.06] rounded-xl p-1">
          {['all', 'pass', 'fail', 'pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? 'bg-[#FFD000] text-[#0a0a0a] shadow-sm' : 'text-white/40 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={doExportCSV} disabled={!filtered.length}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FFD000] text-[#0a0a0a] text-xs font-bold hover:bg-[#ffe44d] disabled:opacity-40 transition-colors">
          <Download size={13}/> Export CSV
        </button>
        <button onClick={fetchResults} className="p-2 text-white/30 hover:text-white transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/>
        </button>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-[#FFD000]/40"/></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center">
          <p className="text-sm text-white/30">{results.length === 0 ? 'No results published yet. Use the upload section above.' : 'No results match your filters.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.06] border-b border-white/[0.08]">
                {['Student Name','Exam Part','Exam Date','Score','Result','Institute','Published'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-black text-white/50 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-3 py-2.5 font-semibold text-white whitespace-nowrap">{r.student_name}</td>
                  <td className="px-3 py-2.5 text-white/50">{r.exam_part || '—'}</td>
                  <td className="px-3 py-2.5 text-white/50 whitespace-nowrap">{r.exam_date ? new Date(r.exam_date + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}</td>
                  <td className="px-3 py-2.5 text-white/50 text-center font-mono font-bold">{r.score ?? '—'}</td>
                  <td className="px-3 py-2.5">{statusBadge(r.result_status)}</td>
                  <td className="px-3 py-2.5 text-white/60">
                    <span className="font-medium">{r.coaching_centers?.name || (r.candidate_email ? `📧 ${r.candidate_email}` : '—')}</span>
                    {r.coaching_centers?.city && <span className="text-white/30 text-xs ml-1">({r.coaching_centers.city})</span>}
                  </td>
                  <td className="px-3 py-2.5 text-white/30 text-xs whitespace-nowrap">{r.uploaded_at ? new Date(r.uploaded_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '—'}</td>
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
  { id: 'dashboard',  label: 'Dashboard',   icon: Trophy },
  { id: 'calendar',   label: 'Exam Calendar', icon: BookOpen },
  { id: 'candidates', label: 'Candidates',  icon: Users },
  { id: 'institutes', label: 'Institutes',  icon: Building2 },
  { id: 'leads',      label: 'Leads',       icon: Bell },
  { id: 'results',    label: 'Results',     icon: Table2 },
];

export default function AdminSlotsUpload({ onClose }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState('dashboard');

  const authenticate = () => {
    if (password === ADMIN_PASSWORD) { setAuthenticated(true); setAuthError(''); }
    else setAuthError('Incorrect password.');
  };

  /* ── Login screen ── */
  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'linear-gradient(145deg, #080810 0%, #0c0c14 50%, #0a0a12 100%)' }}>
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0" aria-hidden>
          <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #FFD000, transparent 70%)' }} />
        </div>
        <div className="relative w-full max-w-sm rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(40px) saturate(180%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)' }}>
          <div className="mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #FFD000, #f5a623)', boxShadow: '0 8px 30px rgba(255,208,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
              <Eye size={24} className="text-[#0a0a0a]"/>
            </div>
            <h3 className="text-xl font-black text-white">Admin Access</h3>
            <p className="text-sm text-white/40 mt-2">Enter your admin password to continue.</p>
          </div>
          <div className="relative mb-4">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && authenticate()}
              placeholder="Admin password"
              className="w-full px-4 py-3.5 rounded-2xl text-white font-mono tracking-widest text-sm focus:outline-none pr-12 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
              autoFocus
            />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          {authError && <p className="text-red-400 text-xs mb-3 text-center font-semibold">{authError}</p>}
          <button onClick={authenticate} className="w-full h-12 rounded-2xl font-black text-sm text-[#0a0a0a] transition-all" style={{ background: 'linear-gradient(135deg, #FFD000, #f5a623)', boxShadow: '0 4px 20px rgba(255,208,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)' }}>Enter Command Centre</button>
        </div>
      </div>
    );
  }

  const activeTab = TABS.find(t => t.id === tab);

  /* ── Full-page admin dashboard with liquid glass + neumorphism ── */
  return (
    <div className="fixed inset-0 z-[70] flex" style={{ background: 'linear-gradient(145deg, #080810 0%, #0c0c14 40%, #0a0a12 100%)' }}>
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #FFD000, transparent 70%)' }} />
        <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #00d4ff, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[35%] w-[400px] h-[400px] rounded-full opacity-[0.02]" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
      </div>

      {/* ── Sidebar — liquid glass ── */}
      <div className="relative w-56 xl:w-64 flex flex-col shrink-0 border-r border-white/[0.06]" style={{ background: 'rgba(12, 12, 20, 0.85)', backdropFilter: 'blur(40px) saturate(180%)' }}>
        {/* Neumorphic inner highlight */}
        <div className="absolute inset-0 rounded-none pointer-events-none" style={{ boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.04), inset -1px 0 0 rgba(0,0,0,0.3)' }} />

        {/* Brand */}
        <div className="relative px-5 py-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFD000, #f5a623)', boxShadow: '0 4px 20px rgba(255,208,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
              <span className="text-[#0a0a0a] font-black text-sm">F</span>
            </div>
            <div>
              <p className="text-white font-black text-base tracking-tight leading-none">FETS</p>
              <p className="text-white/25 text-[9px] font-bold uppercase tracking-[0.25em] mt-1">Command Centre</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[13px] font-semibold transition-all text-left group ${
                  isActive
                    ? 'text-[#0a0a0a]'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #FFD000, #f5a623)',
                  boxShadow: '0 4px 20px rgba(255,208,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 3px rgba(0,0,0,0.3)',
                } : {}}
              >
                <t.icon size={16} className={`shrink-0 ${isActive ? '' : 'opacity-50 group-hover:opacity-80'}`} />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Supabase warning */}
        {!isSupabaseConfigured && (
          <div className="mx-3 mb-3 rounded-2xl px-3 py-2.5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-amber-400 text-[10px] font-bold leading-snug">⚠ Supabase not configured</p>
          </div>
        )}

        {/* Exit */}
        <div className="px-3 py-4 border-t border-white/[0.05]">
          <button
            onClick={onClose}
            className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-semibold text-white/25 hover:text-white/70 transition-all"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <X size={14} className="shrink-0" />
            Exit Admin
          </button>
        </div>
      </div>

      {/* ── Main content — glass surface ── */}
      <div className="relative flex-1 flex flex-col min-w-0">
        {/* Page header — frosted glass bar */}
        <div className="flex items-center gap-3 px-8 h-16 border-b border-white/[0.06] shrink-0" style={{ background: 'rgba(14, 14, 22, 0.7)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3">
            {activeTab && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,208,0,0.08)', border: '1px solid rgba(255,208,0,0.12)' }}>
                <activeTab.icon size={14} className="text-[#FFD000]" />
              </div>
            )}
            <h2 className="text-base font-bold text-white tracking-tight">{activeTab?.label}</h2>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] text-white/20 font-mono">fets.in/admin</p>
            </div>
          </div>
        </div>

        {/* Tab content — wrapped in a glass panel */}
        <div className="flex-1 overflow-y-auto p-6 xl:p-8">
          <div className="rounded-3xl p-6 xl:p-8" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 40px rgba(0,0,0,0.3)' }}>
            {tab === 'dashboard'  && <DashboardTab />}
            {tab === 'calendar'   && <CalendarTab />}
            {tab === 'candidates' && <CandidatesTab />}
            {tab === 'institutes' && <InstitutesTab />}
            {tab === 'leads'      && <LeadsTab />}
            {tab === 'results'    && <ResultsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
