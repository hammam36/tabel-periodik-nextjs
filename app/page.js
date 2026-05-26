'use client';

import { useState, useEffect } from "react";
import { Sun, Moon, RotateCcw, Play } from "lucide-react";
import ElementModal from "@/components/ElementModal";
import PeriodicGame from "@/components/PeriodicGame";

// Daftar kategori penentu filter & legenda (Sesuai gambar referensi Anda)
const CATEGORIES = [
  { id: "alkali-metal", label: "Logam Alkali" },
  { id: "alkaline-earth", label: "Logam Alkali Tanah" },
  { id: "transition-metal", label: "Logam Transisi" },
  { id: "post-transition", label: "Pasca-Transisi" },
  { id: "metalloid", label: "Metaloid" },
  { id: "halogen", label: "Halogen" },
  { id: "noble-gas", label: "Gas Mulia" },
  { id: "lanthanide", label: "Lantanida" },
  { id: "actinide", label: "Aktinida" },
  { id: "nonmetal", label: "Nonlogam Lainnya" }
];

export default function HomePage() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null); // State untuk filter kategori eksplorasi
  const [isLightMode, setIsLightMode] = useState(false);  // State untuk Warm/Dark Mode (diatur via .light-theme)
  const [loading, setLoading] = useState(true);
  
  // State peluncur game hafalan terpisah
  const [isGameActive, setIsGameActive] = useState(false);

  useEffect(() => {
    fetch("/api/elements")
      .then((res) => res.json())
      .then((data) => {
        setElements(data);
        setLoading(false);
      })
      .catch((err) => console.error("Gagal memuat API:", err));
  }, []);

  // Handler untuk mengubah class tema di root HTML document
  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    if (!isLightMode) {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center text-[var(--color-accent)] font-mono">
        Memuat Data API...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-6 transition-colors duration-300">

      {/* PROTEKSI MOBILE */}
      <div className="block md:hidden text-center pt-20 px-4">
        <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-500 mb-4">Layar Terlalu Kecil</h2>
        <p className="text-[var(--text-muted)]">
          Website ini membutuhkan layar lebar. Silakan gunakan Laptop/Desktop.
        </p>
      </div>

      {/* TAMPILAN UTAMA */}
      <div className="hidden md:block max-w-7xl mx-auto">

        {isGameActive ? (
          /* --- A. MODE GAME PERMAINAN TERPISAH (MODULAR) --- */
          <PeriodicGame 
            elements={elements} 
            onExit={() => setIsGameActive(false)} 
          />
        ) : (
          /* --- B. MODE EKSPLORASI NORMAL --- */
          <>
            {/* HEADER & CONTROLS */}
            <header className="flex justify-between items-center mb-6 border-b border-slate-800/10 dark:border-slate-800/40 pb-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[var(--color-accent)]">
                  TABEL PERIODIK INTERAKTIF
                </h1>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Klik kategori untuk memfilter, klik kotak unsur untuk info detail.
                </p>
              </div>

              {/* Tombol Fitur & Toggle Tema */}
              <div className="flex gap-2">
                {activeFilter && (
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--bg-card)] border border-[var(--border-deck)] hover:bg-[var(--bg-deck)] text-[var(--text-main)] rounded-lg transition-all shadow-sm"
                  >
                    <RotateCcw size={14} /> Atur Ulang Filter
                  </button>
                )}
                
                {/* Tombol Peluncur Game Hafalan */}
                <button
                  onClick={() => setIsGameActive(true)}
                  className="flex items-center gap-2 px-4 py-1.5 text-xs bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg hover:shadow-amber-500/10 transition-all scale-100 hover:scale-105 active:scale-95"
                >
                  <Play size={14} className="fill-white" /> Tantangan Hafalan
                </button>

                <button
                  onClick={toggleTheme}
                  className="p-2 bg-[var(--bg-card)] border border-[var(--border-deck)] hover:bg-[var(--bg-deck)] text-amber-600 dark:text-amber-400 rounded-lg transition-all shadow-sm"
                  title="Ganti Tema"
                >
                  {isLightMode ? <Moon size={18} className="text-indigo-600 dark:text-indigo-400" /> : <Sun size={18} />}
                </button>
              </div>
            </header>

            {/* BARIS FILTER KATEGORI (BERADAPTASI DENGAN TEMA HANGAT) */}
            <section className="grid grid-cols-5 gap-2 mb-8 p-4 bg-slate-950/5 dark:bg-slate-950/50 rounded-xl border border-[var(--border-deck)]">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(activeFilter === cat.id ? null : cat.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${
                    activeFilter === cat.id
                      ? "border-[var(--text-main)] bg-[var(--text-main)] text-[var(--bg-main)] font-bold shadow-lg scale-102"
                      : "border-[var(--border-deck)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-deck)]"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: `var(--cat-${cat.id})` }}
                  />
                  <span className="text-xs font-medium tracking-wide truncate">{cat.label}</span>
                </button>
              ))}
            </section>

            {/* GRID TABEL PERIODIK UTAMA */}
            <section className="grid grid-cols-18 gap-1.5 p-4 bg-slate-950/10 dark:bg-slate-950/30 rounded-2xl border border-[var(--border-deck)] shadow-inner">
              {elements.map((el) => {
                // Logika kecerahan kotak berdasarkan filter aktif
                const isMatch = !activeFilter || el.category === activeFilter;

                return (
                  <div
                    key={el.number}
                    onClick={() => setSelectedElement(el)}
                    style={{
                      gridColumnStart: el.col,
                      gridRowStart: el.row,
                      backgroundColor: `var(--cat-${el.category})`
                    }}
                    className={`border border-slate-900/10 dark:border-slate-900/20 rounded-lg p-1.5 flex flex-col items-center justify-between aspect-square transition-all duration-300 cursor-pointer group shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] ${
                      isMatch
                        ? "opacity-100 scale-100 hover:scale-110 hover:brightness-110 hover:dark:brightness-125 z-10 shadow-md"
                        : "opacity-15 scale-95 saturate-50 pointer-events-none"
                    }`}
                  >
                    <span className="text-[9px] text-white/70 self-start font-mono font-bold leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{el.number}</span>
                    <span className="text-lg font-black text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{el.symbol}</span>
                    <span className="text-[8px] font-bold text-white/90 truncate max-w-full leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{el.name}</span>
                  </div>
                );
              })}
            </section>

            {/* MODAL DETAIL */}
            <ElementModal
              element={selectedElement}
              onClose={() => setSelectedElement(null)}
            />
          </>
        )}

      </div>
    </main>
  );
}