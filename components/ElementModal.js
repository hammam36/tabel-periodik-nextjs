import { X, Scale, Layers, Hash } from "lucide-react";

export default function ElementModal({ element, onClose }) {
    if (!element) return null;

    return (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--bg-card)] border border-[var(--border-deck)] rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center">

                {/* Tombol Tutup */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Representasi Visual Atom */}
                <div
                    style={{ backgroundColor: `var(--cat-${element.category})` }}
                    className="w-24 h-24 rounded-2xl mx-auto flex flex-col items-center justify-center shadow-lg mb-4 border border-white/10"
                >
                    <span className="text-xs text-white/85 font-mono drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{element.number}</span>
                    <span className="text-4xl font-black text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{element.symbol}</span>
                </div>

                <h2 className="text-2xl font-black text-[var(--text-main)] mb-1">{element.name}</h2>
                <p className="text-xs text-[var(--color-accent)] uppercase tracking-widest font-extrabold mb-6">
                    {element.category.replace("-", " ")}
                </p>

                {/* Informasi Detail Unsur (Sangat Dinamis) */}
                <div className="border-t border-[var(--border-deck)] pt-4 text-left space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border-deck)]/50">
                        <span className="text-[var(--text-muted)] flex items-center gap-2 font-medium">
                            <Scale size={16} className="text-emerald-600 dark:text-emerald-400" /> Massa Atom (Berat Atom)
                        </span>
                        <span className="font-mono font-bold text-[var(--text-main)]">{element.mass} u</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[var(--border-deck)]/50">
                        <span className="text-[var(--text-muted)] flex items-center gap-2 font-medium">
                            <Layers size={16} className="text-blue-600 dark:text-blue-400" /> Golongan (Kolom)
                        </span>
                        <span className="font-mono font-bold text-[var(--text-main)]">{element.col}</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                        <span className="text-[var(--text-muted)] flex items-center gap-2 font-medium">
                            <Hash size={16} className="text-purple-600 dark:text-purple-400" /> Periode (Baris)
                        </span>
                        <span className="font-mono font-bold text-[var(--text-main)]">{element.row}</span>
                    </div>
                </div>

                {/* Catatan Karakteristik */}
                <div className="mt-4 p-3 bg-slate-950/5 dark:bg-slate-950/40 rounded-xl text-left text-xs text-[var(--text-muted)] leading-relaxed border border-[var(--border-deck)]">
                    <span className="font-bold text-[var(--text-main)]/90 block mb-1">Catatan Karakteristik:</span>
                    Unsur ini diklasifikasikan sebagai kelompok <span className="font-semibold text-[var(--text-main)]">{element.category.replace("-", " ")}</span> yang memiliki konfigurasi elektron dan karakteristik kimia yang unik di dalam tabel periodik.
                </div>

            </div>
        </div>
    );
}