export default function Toast({ message, type, onClose }) {
  return (
    <div className="fixed top-6 right-6 z-[100] toast">
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
          type === 'success'
            ? 'bg-emerald-900/80 border-emerald-500/30 text-emerald-100'
            : type === 'error'
            ? 'bg-red-900/80 border-red-500/30 text-red-100'
            : 'bg-navy-800/80 border-gold-500/30 text-gold-100'
        }`}
      >
        <span className="text-xl">{type === 'success' ? '\u2713' : type === 'error' ? '\u2717' : '\u2139'}</span>
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100 transition-opacity text-lg">&times;</button>
      </div>
    </div>
  );
}
