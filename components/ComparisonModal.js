import { X, Scale, Layers, Hash, Trash2, ShieldAlert } from "lucide-react";
import { getShellsForElement } from "./shellsData";

const CATEGORY_LABELS = {
  "nonmetal": "Nonlogam Lainnya",
  "noble-gas": "Gas Mulia",
  "alkali-metal": "Logam Alkali",
  "alkaline-earth": "Logam Alkali Tanah",
  "metalloid": "Metaloid",
  "halogen": "Halogen",
  "transition-metal": "Logam Transisi",
  "post-transition": "Pasca-Transisi",
  "lanthanide": "Lantanida",
  "actinide": "Aktinida"
};

export default function ComparisonModal({ compareElements, onClose, onRemoveElement }) {
  if (!compareElements || compareElements.length === 0) return null;

  // Helper untuk menentukan s/p/d/f block
  const getElementBlock = (el) => {
    if (el.row >= 9) return "f";
    if (el.col === 1 || el.col === 2 || (el.col === 18 && el.row === 1)) return "s";
    if (el.col >= 13 && el.col <= 18) return "p";
    return "d";
  };

  const numCols = compareElements.length;
  // CSS class helper untuk grid kolom dinamis
  const gridColsClass = 
    numCols === 1 ? "grid-cols-1" : 
    numCols === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[var(--bg-card)] border border-[var(--border-deck)] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative">
        
        {/* Header Modal */}
        <header className="p-5 border-b border-[var(--border-deck)]/60 flex justify-between items-center bg-slate-950/15 dark:bg-slate-950/40">
          <div>
            <span className="text-[10px] tracking-widest font-mono text-[var(--color-accent)] font-extrabold uppercase">
              Komparator Kuantum
            </span>
            <h2 className="text-xl font-black text-[var(--text-main)]">
              Perbandingan Unsur Kimia ({compareElements.length}/3)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[var(--border-deck)] hover:bg-[var(--bg-deck)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Tutup Perbandingan"
          >
            <X size={18} />
          </button>
        </header>

        {/* Matrix Perbandingan (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
          
          {/* BARIS 0: Kartu Visual & Tombol Hapus */}
          <div className="compare-row-grid border-b-2 border-[var(--border-deck)]/75 pb-4">
            <div className="compare-prop-label text-xs font-black">Visualisasi</div>
            <div className={`grid ${gridColsClass} gap-4`}>
              {compareElements.map((el) => (
                <div key={`header-${el.number}`} className="flex flex-col items-center gap-3">
                  <div
                    style={{ backgroundColor: `var(--cat-${el.category})` }}
                    className="w-20 h-20 rounded-xl flex flex-col items-center justify-center shadow-lg border border-white/10 relative group"
                  >
                    <span className="text-[10px] text-white/80 font-mono absolute top-1 left-1.5 leading-none">
                      {el.number}
                    </span>
                    <span className="text-3xl font-black text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {el.symbol}
                    </span>
                    <span className="text-[8px] font-bold text-white/90 truncate max-w-[90%] absolute bottom-1 px-1 text-center leading-none">
                      {el.name}
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveElement(el.number)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 hover:text-rose-400 font-bold rounded-md border border-rose-500/20 transition-all active:scale-95 cursor-pointer"
                    title={`Hapus ${el.name} dari perbandingan`}
                  >
                    <Trash2 size={12} /> Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* BARIS 1: Kategori */}
          <div className="compare-row-grid">
            <div className="compare-prop-label">Kategori</div>
            <div className={`grid ${gridColsClass} gap-4 text-center`}>
              {compareElements.map((el) => (
                <div key={`category-${el.number}`} className="px-2 py-1 text-xs font-bold capitalize" style={{ color: `var(--cat-${el.category})` }}>
                  {CATEGORY_LABELS[el.category] || el.category.replace("-", " ")}
                </div>
              ))}
            </div>
          </div>

          {/* BARIS 2: Nomor Atom */}
          <div className="compare-row-grid">
            <div className="compare-prop-label flex items-center gap-1">
              <Hash size={13} className="text-purple-500" /> No. Atom
            </div>
            <div className={`grid ${gridColsClass} gap-4 text-center`}>
              {compareElements.map((el) => (
                <div key={`num-${el.number}`} className="text-sm font-mono font-black text-[var(--text-main)]">
                  {el.number}
                </div>
              ))}
            </div>
          </div>

          {/* BARIS 3: Massa Atom */}
          <div className="compare-row-grid">
            <div className="compare-prop-label flex items-center gap-1">
              <Scale size={13} className="text-emerald-500" /> Massa Atom
            </div>
            <div className={`grid ${gridColsClass} gap-4 text-center`}>
              {compareElements.map((el) => (
                <div key={`mass-${el.number}`} className="text-xs font-mono font-bold text-[var(--text-main)]">
                  {el.mass} u
                </div>
              ))}
            </div>
          </div>

          {/* BARIS 4: Posisi Golongan */}
          <div className="compare-row-grid">
            <div className="compare-prop-label flex items-center gap-1">
              <Layers size={13} className="text-blue-500" /> Golongan
            </div>
            <div className={`grid ${gridColsClass} gap-4 text-center`}>
              {compareElements.map((el) => (
                <div key={`col-${el.number}`} className="text-xs font-bold text-[var(--text-main)]">
                  {el.row <= 7 ? `Golongan ${el.col}` : "Golongan - (Transisi Dalam)"}
                </div>
              ))}
            </div>
          </div>

          {/* BARIS 5: Posisi Periode */}
          <div className="compare-row-grid">
            <div className="compare-prop-label flex items-center gap-1">
              <Layers size={13} className="text-indigo-500" /> Periode
            </div>
            <div className={`grid ${gridColsClass} gap-4 text-center`}>
              {compareElements.map((el) => (
                <div key={`row-${el.number}`} className="text-xs font-bold text-[var(--text-main)]">
                  Periode {el.row <= 7 ? el.row : el.row === 9 ? 6 : 7}
                </div>
              ))}
            </div>
          </div>

          {/* BARIS 6: Blok Orbital */}
          <div className="compare-row-grid">
            <div className="compare-prop-label flex items-center gap-1">
              <ShieldAlert size={13} className="text-amber-500" /> Blok Orbital
            </div>
            <div className={`grid ${gridColsClass} gap-4 text-center`}>
              {compareElements.map((el) => {
                const block = getElementBlock(el);
                let blockColor = "text-red-500";
                if (block === "d") blockColor = "text-amber-500";
                else if (block === "p") blockColor = "text-cyan-500";
                else if (block === "f") blockColor = "text-purple-500";
                return (
                  <div key={`block-${el.number}`} className={`text-xs font-mono font-black uppercase ${blockColor}`}>
                    Blok {block}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BARIS 7: Kulit Elektron Bohr */}
          <div className="compare-row-grid">
            <div className="compare-prop-label">Kulit Bohr</div>
            <div className={`grid ${gridColsClass} gap-4 text-center`}>
              {compareElements.map((el) => {
                const shells = getShellsForElement(el.number);
                return (
                  <div key={`shells-${el.number}`} className="flex flex-col gap-1 items-center">
                    <span className="text-xs font-mono font-bold text-[var(--text-main)]">
                      {shells.join(", ")}
                    </span>
                    <div className="flex gap-1 mt-1">
                      {shells.map((sh, idx) => (
                        <span
                          key={idx}
                          className="w-4 h-4 rounded-full bg-slate-900/40 dark:bg-slate-950/60 border border-[var(--border-deck)] text-[8px] font-mono font-bold flex items-center justify-center text-[var(--text-muted)]"
                          title={`Kulit ${idx + 1}: ${sh} elektron`}
                        >
                          {sh}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <footer className="p-4 bg-slate-950/20 border-t border-[var(--border-deck)]/60 text-center text-[10px] text-[var(--text-muted)]">
          Bandingkan karakteristik atom, subkulit, dan konfigurasi elektron untuk melihat perbedaan kecenderungan kimiawi.
        </footer>
      </div>
    </div>
  );
}
