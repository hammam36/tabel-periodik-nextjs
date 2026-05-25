import { X, Award, Layers, Hash } from "lucide-react";

export default function ElementModal({ element, onClose }) {
    if (!element) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--bg-card)] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center">

                {/* Tombol Tutup dengan Ikon Lucide */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Representasi Visual Atom */}
                <div
                    style={{ backgroundColor: `var(--cat-${element.category})` }}
                    className="w-24 h-24 rounded-2xl mx-auto flex flex-col items-center justify-center shadow-lg mb-4 border border-white/10"
                >
                    <span className="text-xs text-white/70 font-mono">{element.number}</span>
                    <span className="text-4xl font-bold text-white tracking-wide">{element.symbol}</span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{element.name}</h2>
                <p className="text-xs text-[var(--color-accent)] uppercase tracking-widest font-bold mb-6">
                    {element.category.replace("-", " ")}
                </p>

                {/* Informasi Detail Jangka Panjang */}
                <div className="border-t border-slate-800 pt-4 text-left space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                        <span className="text-[var(--text-muted)] flex items-center gap-2">
                            <Award size={16} className="text-emerald-400" /> Massa Atom
                        </span>
                        <span className="font-mono font-semibold">{element.mass} u</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                        <span className="text-[var(--text-muted)] flex items-center gap-2">
                            <Layers size={16} className="text-blue-400" /> Golongan (Kolom)
                        </span>
                        <span className="font-mono font-semibold">{element.col}</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                        <span className="text-[var(--text-muted)] flex items-center gap-2">
                            <Hash size={16} className="text-purple-400" /> Periode (Baris)
                        </span>
                        <span className="font-mono font-semibold">{element.row}</span>
                    </div>
                </div>

                {/* Slot Jangka Panjang: Tempat Penjelasan Tambahan Kedepannya */}
                <div className="mt-4 p-3 bg-slate-950/40 rounded-xl text-left text-xs text-[var(--text-muted)] leading-relaxed border border-slate-800">
                    <span className="font-semibold text-slate-400 block mb-1">Catatan Karakteristik:</span>
                    Unsur ini diklasifikasikan sebagai kelompok {element.category.replace("-", " ")} yang memiliki konfigurasi elektron dan karakteristik kimia yang unik di tabel periodik.
                </div>

            </div>
        </div>
    );
}