'use client';

import { useState, useEffect, useRef } from "react";
import { Sun, Moon, RotateCcw, Play, Search, X, Sliders } from "lucide-react";
import ElementModal from "@/components/ElementModal";
import PeriodicGame from "@/components/PeriodicGame";
import { getShellsForElement } from "@/components/shellsData";

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

  // State pencarian atom
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef(null);

  // State untuk Hover Highlight System & Smart Tooltip
  const [hoveredElement, setHoveredElement] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Toggles Visualisasi Tabel Periodik
  const [highlightGroup, setHighlightGroup] = useState(false);
  const [highlightPeriod, setHighlightPeriod] = useState(false);
  const [showBlockOverlay, setShowBlockOverlay] = useState(false);
  const [showAtomicMass, setShowAtomicMass] = useState(false);
  const [showElectronShell, setShowElectronShell] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);

  // State untuk Sidebar Drawer Modal
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tracker pergerakan mouse untuk floating tooltip
  const handleMouseMove = (e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  // Helper untuk menentukan s/p/d/f block
  const getElementBlock = (el) => {
    if (el.row >= 9) return "f";
    if (el.col === 1 || el.col === 2 || (el.col === 18 && el.row === 1)) return "s";
    if (el.col >= 13 && el.col <= 18) return "p";
    return "d";
  };

  // Helper untuk mendapatkan label kategori bahasa Indonesia
  const getCategoryLabel = (catId) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.label : catId.replace("-", " ");
  };

  // Listener keyboard global untuk hotkey "/" fokus ke input pencarian
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Abaikan jika pengguna sedang mengetik di input, textarea, atau elemen yang bisa diedit
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setShowSuggestions(true);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  // Fungsi pencocokan unsur berdasarkan kata kunci pencarian (nama, simbol, atau nomor atom)
  const matchesSearch = (el) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      el.name.toLowerCase().includes(q) ||
      el.symbol.toLowerCase().includes(q) ||
      el.number.toString() === q
    );
  };

  // Mendapatkan daftar saran autocomplete (maksimal 8 unsur)
  const suggestions = searchQuery.trim()
    ? elements.filter(matchesSearch).slice(0, 8)
    : [];

  // Handler navigasi keyboard untuk daftar saran autocomplete
  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < suggestions.length) {
        selectSuggestion(suggestions[focusedSuggestionIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSuggestions(false);
      setFocusedSuggestionIndex(-1);
      e.target.blur();
    }
  };

  // Memilih unsur dari saran pencarian
  const selectSuggestion = (el) => {
    setSelectedElement(el);
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
  };

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
            <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6 border-b border-slate-800/10 dark:border-slate-800/40 pb-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[var(--color-accent)] animate-slide-up">
                  TABEL PERIODIK INTERAKTIF
                </h1>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Klik kategori untuk memfilter, cari atom untuk mempermudah pencarian, klik kotak unsur untuk info detail.
                </p>
              </div>

              {/* Tombol Fitur, Pencarian & Toggle Tema */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">

                {/* Input Pencarian dengan Autocomplete */}
                <div className="relative flex-1 sm:w-80">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                        setFocusedSuggestionIndex(-1);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => {
                        // Delay sedikit agar klik pada item autocomplete terdaftar sebelum menu ditutup
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Cari nama, simbol, nomor atom..."
                      className="w-full pl-9 pr-9 py-2 bg-[var(--bg-card)] border border-[var(--border-deck)] text-[var(--text-main)] rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] placeholder:text-[var(--text-muted)]/50 shadow-sm"
                    />
                    {!searchQuery && (
                      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--text-muted)]/70 bg-slate-900/10 dark:bg-slate-900/40 border border-[var(--border-deck)]/60 rounded shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)] pointer-events-none select-none">
                        /
                      </kbd>
                    )}
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setFocusedSuggestionIndex(-1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                        title="Bersihkan pencarian"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* FLOATING DROPDOWN SUGGESTIONS */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-deck)] rounded-xl shadow-2xl overflow-hidden z-40 backdrop-blur-md bg-opacity-95 dark:bg-opacity-90 max-h-80 overflow-y-auto animate-slide-up border-slate-700/30">
                      <div className="py-1">
                        {suggestions.map((el, index) => {
                          const isFocused = index === focusedSuggestionIndex;
                          return (
                            <div
                              key={el.number}
                              onMouseDown={() => selectSuggestion(el)}
                              onMouseEnter={() => setFocusedSuggestionIndex(index)}
                              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-all duration-150 border-b border-[var(--border-deck)]/30 last:border-0 ${isFocused
                                ? "bg-[var(--color-accent)]/10 text-[var(--text-main)] shadow-inner"
                                : "hover:bg-[var(--bg-deck)] text-[var(--text-main)]/90"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  style={{ backgroundColor: `var(--cat-${el.category})` }}
                                  className="w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold text-white shadow-md border border-white/10"
                                >
                                  {el.number}
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold tracking-tight">
                                    {el.name} <span className="text-xs text-[var(--text-muted)] font-mono">({el.symbol})</span>
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)] font-medium capitalize">
                                    {getCategoryLabel(el.category)}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-[var(--text-muted)] bg-slate-950/25 dark:bg-slate-950/60 px-2 py-0.5 rounded border border-[var(--border-deck)]/20">
                                {el.mass} u
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  {(activeFilter || searchQuery) && (
                    <button
                      onClick={() => {
                        setActiveFilter(null);
                        setSearchQuery("");
                        setFocusedSuggestionIndex(-1);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--bg-card)] border border-[var(--border-deck)] hover:bg-[var(--bg-deck)] text-[var(--text-main)] rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                      title="Atur Ulang Semua Filter"
                    >
                      <RotateCcw size={14} /> Atur Ulang
                    </button>
                  )}

                  {/* Tombol Pemicu Pusat Kontrol HUD Sidebar */}
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-xs bg-[var(--bg-card)] border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)] text-[var(--text-main)] hover:bg-[var(--color-accent)]/10 font-bold rounded-lg shadow-md hover:shadow-[var(--color-accent)]/10 transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Sliders size={14} className="text-[var(--color-accent)]" /> Pusat Kontrol HUD
                  </button>
                </div>

              </div>
            </header>

            {/* BARIS FILTER KATEGORI */}
            <section className="grid grid-cols-5 gap-2 mb-8 p-4 bg-slate-950/5 dark:bg-slate-950/50 rounded-xl border border-[var(--border-deck)]">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(activeFilter === cat.id ? null : cat.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${activeFilter === cat.id
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

            {/* GRID TABEL PERIODIK UTAMA DENGAN DYNAMIC INTERACTIVE GLOW */}
            <div className="relative pt-6 pl-7" onMouseMove={handleMouseMove}>
              {/* Label Sumbu Golongan (Atas) */}
              <div className="absolute top-0 left-12 right-4 flex items-center gap-2 pointer-events-none select-none">
                <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[var(--color-accent)]/20 to-transparent" />
                <span className="text-[8px] font-mono font-black text-[var(--color-accent)]/50 uppercase tracking-widest px-2">
                  Sumbu Golongan (Kolom 1 — 18)
                </span>
                <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[var(--color-accent)]/20 to-transparent" />
              </div>

              {/* Label Sumbu Periode (Kiri) */}
              <div 
                className="absolute left-0 top-12 bottom-4 flex flex-col items-center justify-center gap-2 pointer-events-none select-none" 
                style={{ writingMode: "vertical-lr" }}
              >
                <span className="w-[1px] flex-1 bg-gradient-to-b from-transparent via-[var(--color-accent)]/20 to-transparent" />
                <span className="text-[8px] font-mono font-black text-[var(--color-accent)]/50 uppercase tracking-widest py-2 rotate-180">
                  Sumbu Periode (Baris 1 — 7)
                </span>
                <span className="w-[1px] flex-1 bg-gradient-to-b from-transparent via-[var(--color-accent)]/20 to-transparent" />
              </div>

              <section 
                className={`grid grid-cols-19 gap-1.5 p-4 bg-slate-950/10 dark:bg-slate-950/30 rounded-2xl border border-[var(--border-deck)] shadow-inner transition-all duration-300 ${
                  advancedMode ? "advanced-grid-mode border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)_inset]" : ""
                }`}
              >
                {/* Indikator Arah Koordinat Kuantum */}
                <div
                  style={{ gridColumnStart: 1, gridRowStart: 1 }}
                  className="flex flex-col items-center justify-center text-[7px] font-mono font-black text-[var(--color-accent)]/40 pointer-events-none select-none leading-none gap-0.5 border border-[var(--color-accent)]/10 rounded bg-slate-950/20 m-0.5"
                >
                  <span>GOL→</span>
                  <span>PER↓</span>
                </div>

                {/* 1. Smart Coordinate Labels: Groups (1-18) di Atas */}
                {Array.from({ length: 18 }, (_, i) => {
                  const groupNum = i + 1;
                  const isActive = hoveredElement && hoveredElement.row <= 7 && hoveredElement.col === groupNum && highlightGroup;
                  return (
                    <div
                      key={`group-${groupNum}`}
                      style={{
                        gridColumnStart: groupNum + 1,
                        gridRowStart: 1,
                      }}
                      className={`hud-coord-label ${isActive ? "coordinate-active" : ""}`}
                    >
                      {groupNum}
                    </div>
                  );
                })}

                {/* 2. Smart Coordinate Labels: Periods (1-7) di Kiri */}
                {Array.from({ length: 7 }, (_, i) => {
                  const periodNum = i + 1;
                  const isActive = hoveredElement && (
                    (hoveredElement.row <= 7 && hoveredElement.row === periodNum) ||
                    (hoveredElement.row === 9 && periodNum === 6) ||
                    (hoveredElement.row === 10 && periodNum === 7)
                  ) && highlightPeriod;
                  return (
                    <div
                      key={`period-${periodNum}`}
                      style={{
                        gridColumnStart: 1,
                        gridRowStart: periodNum + 1,
                      }}
                      className={`hud-coord-label ${isActive ? "coordinate-active" : ""}`}
                    >
                      {periodNum}
                    </div>
                  );
                })}

                {/* 3. s/p/d/f Block Background Highlight Overlays */}
                {showBlockOverlay && (
                  <>
                    {/* s-block */}
                    <div
                      style={{ gridColumn: "2 / 4", gridRow: "2 / 9" }}
                      className="block-overlay block-s-glow"
                    >
                      <span>Blok s</span>
                    </div>
                    {/* d-block */}
                    <div
                      style={{ gridColumn: "4 / 14", gridRow: "5 / 9" }}
                      className="block-overlay block-d-glow"
                    >
                      <span>Blok d</span>
                    </div>
                    {/* p-block */}
                    <div
                      style={{ gridColumn: "14 / 20", gridRow: "2 / 9" }}
                      className="block-overlay block-p-glow justify-end"
                    >
                      <span>Blok p</span>
                    </div>
                    {/* f-block */}
                    <div
                      style={{ gridColumn: "4 / 19", gridRow: "11 / 13" }}
                      className="block-overlay block-f-glow animate-pulse"
                    >
                      <span>Blok f</span>
                    </div>
                  </>
                )}

                {/* 4. Minimalist HUD Diagnostic Panel (di Area Kosong Tabel Periodik) */}
                <div
                  style={{ gridColumn: "4 / 14", gridRow: "2 / 5" }}
                  className="hud-diagnostic mx-5 my-3.5 p-4 flex gap-6 items-center justify-between border border-[var(--color-accent)]/15 rounded-2xl bg-slate-950/20 backdrop-blur-md z-10 shadow-lg select-none"
                >
                  {/* Left: Decorative Sci-Fi Pulse Core SVG */}
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center border border-[var(--color-accent)]/10 rounded-xl bg-slate-950/40 shadow-inner">
                    {/* Tech corner tick lines */}
                    <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[var(--color-accent)]/30" />
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[var(--color-accent)]/30" />
                    <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-[var(--color-accent)]/30" />
                    <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-[var(--color-accent)]/30" />

                    {/* Pulsing Quantum Core Ring */}
                    <div className="w-16 h-16 rounded-full border border-dashed border-[var(--color-accent)]/30 animate-hud-spin absolute" />
                    <div className="w-10 h-10 rounded-full border border-[var(--color-accent)]/20 animate-ping absolute duration-1000" />
                    <div className="w-6 h-6 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/40 flex items-center justify-center animate-hud-pulse">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]" />
                    </div>
                    
                    {/* Glowing scanning radar sweep */}
                    <svg className="absolute w-24 h-24 text-[var(--color-accent)]/15" viewBox="0 0 100 100">
                      <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                      <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
                      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    </svg>
                    <span className="absolute bottom-1 text-[7px] font-mono text-[var(--text-muted)] tracking-widest font-black uppercase">Sensor Inti</span>
                  </div>

                  {/* Right: Telemetry Diagnostic Info */}
                  <div className="flex-1 flex flex-col justify-between h-full py-1 text-left min-w-0">
                    {hoveredElement ? (
                      /* --- DETEKSI ATOM HOVER (HUD ATOMIC INSIGHT) --- */
                      <div className="flex flex-col gap-1.5 animate-slide-up">
                        <div className="flex items-center gap-2 border-b border-[var(--color-accent)]/15 pb-1">
                          <span className="text-[8px] font-mono text-[var(--color-accent)] uppercase tracking-widest font-extrabold">Menganalisis Atom...</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="flex justify-between items-baseline gap-2">
                          <h3 className="text-lg font-black text-[var(--text-main)] truncate leading-none">
                            {hoveredElement.name}
                          </h3>
                          <span className="text-xs font-mono font-black text-[var(--color-accent)] shrink-0">
                            [{hoveredElement.symbol}]
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[9px] text-[var(--text-muted)] mt-1">
                          <div className="flex justify-between">
                            <span>Nomor Atom:</span>
                            <span className="font-bold text-[var(--text-main)]">{hoveredElement.number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Massa Atom:</span>
                            <span className="font-bold text-[var(--text-main)]">{hoveredElement.mass} u</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Blok Orbital:</span>
                            <span className="font-bold text-[var(--color-accent)] uppercase">Blok {getElementBlock(hoveredElement)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Kulit Elektron:</span>
                            <span className="font-bold text-[var(--text-main)]">
                              {getShellsForElement(hoveredElement.number).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* --- SYSTEM SCANNING STATE (RADAR TELEMETRY) --- */
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 border-b border-[var(--color-accent)]/15 pb-1">
                          <span className="text-[8px] font-mono text-[var(--color-accent)] uppercase tracking-widest font-extrabold">Telemetri Sistem...</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-ping" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black tracking-wider text-[var(--text-main)] uppercase">
                            Radar Kuantum Edukasi
                          </h3>
                          <p className="text-[9px] text-[var(--text-muted)] leading-relaxed mt-0.5">
                            Arahkan kursor pada kotak unsur untuk menganalisis struktur atom secara real-time. Klik unsur untuk melihat deep detail learning.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[8px] text-[var(--text-muted)] mt-1.5">
                          <div>
                            Filter Kategori: <span className="font-bold text-[var(--text-main)] capitalize">
                              {activeFilter ? getCategoryLabel(activeFilter) : "Semua"}
                            </span>
                          </div>
                          <div>
                            Visualisasi Blok: <span className="font-bold text-[var(--text-main)] uppercase">
                              {showBlockOverlay ? "AKTIF" : "NONAKTIF"}
                            </span>
                          </div>
                          <div>
                            Pencarian Aktif: <span className="font-bold text-[var(--text-main)]">
                              {searchQuery ? elements.filter(matchesSearch).length : "0"} Cocok
                            </span>
                          </div>
                          <div>
                            Mode Tampilan: <span className="font-bold text-amber-500 uppercase">
                              {advancedMode ? "LANJUTAN" : "STANDAR"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Render Unsur / Kotak Tabel Periodik */}
                {elements.map((el) => {
                  const isMatch = (!activeFilter || el.category === activeFilter) && matchesSearch(el);
                  
                  // Evaluasi hover highlight & coordinates
                  const isHovered = hoveredElement && hoveredElement.number === el.number;
                  const isSameGroup = hoveredElement && el.row <= 7 && hoveredElement.col === el.col && highlightGroup;
                  const isSamePeriod = hoveredElement && (
                    (hoveredElement.row <= 7 && el.row <= 7 && hoveredElement.row === el.row) ||
                    (hoveredElement.row === 9 && el.row === 9) ||
                    (hoveredElement.row === 10 && el.row === 10)
                  ) && highlightPeriod;

                  const isHighlighted = isSameGroup || isSamePeriod;

                  // CSS Classes berdasarkan hover state & search match
                  let hoverOpacityClass = "opacity-100 scale-100";
                  let hoverEffectClass = "";

                  if (hoveredElement) {
                    if (isHovered) {
                      hoverEffectClass = "element-hovered shadow-2xl z-30 ring-2 ring-white/20";
                    } else if (isHighlighted && isMatch) {
                      hoverEffectClass = "element-highlight-active z-20 scale-102";
                    } else {
                      hoverOpacityClass = "opacity-25 scale-95 saturate-50 pointer-events-none";
                    }
                  } else {
                    if (!isMatch) {
                      hoverOpacityClass = "opacity-15 scale-95 saturate-50 pointer-events-none";
                    }
                  }

                  // Advanced border colors based on s/p/d/f blocks
                  let borderClass = "border-slate-900/10 dark:border-slate-900/20";
                  if (advancedMode && isMatch) {
                    const block = getElementBlock(el);
                    if (block === "s") borderClass = "border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]";
                    else if (block === "d") borderClass = "border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]";
                    else if (block === "p") borderClass = "border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]";
                    else if (block === "f") borderClass = "border-purple-500/40 shadow-[0_0_8px_rgba(139,92,246,0.2)]";
                  }

                  // Data kulit elektron Bohr
                  const shells = getShellsForElement(el.number);
                  const hasShells = showElectronShell || advancedMode;

                  return (
                    <div
                      key={el.number}
                      onClick={() => setSelectedElement(el)}
                      onMouseEnter={() => setHoveredElement(el)}
                      onMouseLeave={() => setHoveredElement(null)}
                      style={{
                        // Shift columns by 1 to leave room for Period labels, and shift rows based on LAN/ACT placement
                        gridColumnStart: el.col + 1,
                        gridRowStart: el.row <= 7 ? el.row + 1 : el.row + 2,
                        backgroundColor: `var(--cat-${el.category})`
                      }}
                      className={`relative overflow-hidden border rounded-lg flex flex-col items-center justify-between aspect-[1/1.18] transition-all duration-200 cursor-pointer group shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] element-card-wrapper ${borderClass} ${hoverOpacityClass} ${hoverEffectClass} ${hasShells ? "pt-1 pb-1.5 pl-1 pr-3.5" : "p-1.5"}`}
                    >
                      {/* Nomor Atom */}
                      <span className={`text-white/70 self-start font-mono font-bold leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] ${hasShells ? "text-[8px]" : "text-[9px]"}`}>
                        {el.number}
                      </span>
                      
                      {/* Simbol Kimia */}
                      <span className={`font-black text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] transition-all ${hasShells ? "text-[15px]" : "text-lg"}`}>
                        {el.symbol}
                      </span>
                      
                      {/* Nama Unsur & Dynamic Mass Display */}
                      <div className="flex flex-col items-center justify-end w-full leading-none text-center">
                        <span className={`font-bold text-white/95 truncate max-w-full drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] ${hasShells ? "text-[7.5px]" : "text-[8px]"}`}>
                          {el.name}
                        </span>
                        
                        {(showAtomicMass || advancedMode) && (
                          <span className={`font-mono text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] mt-0.5 leading-none ${hasShells ? "text-[6px]" : "text-[6.5px]"}`}>
                            {el.mass} u
                          </span>
                        )}
                      </div>

                      {/* Bohr Shell Vertical Badge */}
                      {hasShells && shells && (
                        <div className="absolute right-0.5 top-0.5 bottom-0.5 flex flex-col justify-center items-center gap-[0.5px] text-[5px] font-mono font-black text-white/95 leading-none bg-black/40 w-3 rounded border border-white/5 z-10 pointer-events-none">
                          {shells.map((sh, idx) => (
                            <span key={idx}>{sh}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>

              {/* 6. Minimal Floating Tooltip (Quick Preview) */}
              {hoveredElement && (
                <div
                  className="fixed pointer-events-none z-50 hud-tooltip flex flex-col gap-1 text-left"
                  style={{
                    left: tooltipPos.x + 15,
                    top: tooltipPos.y + 15,
                  }}
                >
                  {/* Sci-Fi Target corner brackets */}
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-[var(--color-accent)] rounded-tl-sm" />
                  <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-[var(--color-accent)] rounded-tr-sm" />
                  <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-[var(--color-accent)] rounded-bl-sm" />
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-[var(--color-accent)] rounded-br-sm" />

                  <div className="flex items-center gap-2 pr-2">
                    <span className="text-sm font-black text-[var(--text-main)]">{hoveredElement.name}</span>
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                      {hoveredElement.symbol}
                    </span>
                  </div>

                  <div className="text-[9px] font-mono text-[var(--text-muted)] font-medium">
                    {hoveredElement.row <= 7 ? `Golongan ${hoveredElement.col}` : "Golongan -"} • Periode {hoveredElement.row <= 7 ? hoveredElement.row : hoveredElement.row === 9 ? 6 : 7}
                  </div>

                  <div
                    className="text-[9px] font-extrabold uppercase tracking-widest mt-0.5"
                    style={{ color: `var(--cat-${hoveredElement.category})` }}
                  >
                    {getCategoryLabel(hoveredElement.category)}
                  </div>
                </div>
              )}
            </div>

            {/* MODAL DETAIL */}
            <ElementModal
              element={selectedElement}
              onClose={() => setSelectedElement(null)}
            />

            {/* --- SLIDE-OUT HUD CONTROL SIDEBAR DRAWER MODAL --- */}
            {isSidebarOpen && (
              <div 
                className="hud-sidebar-backdrop animate-fade-in" 
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            <div 
              className={`hud-sidebar p-6 flex flex-col justify-between ${
                isSidebarOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div>
                {/* Sidebar Header */}
                <div className="flex justify-between items-center mb-6 border-b border-[var(--color-accent)]/15 pb-4">
                  <div>
                    <span className="text-[9px] tracking-widest font-mono text-[var(--color-accent)] font-extrabold uppercase">
                      Panel Kontrol Sistem
                    </span>
                    <h2 className="text-base font-black text-[var(--text-main)]">Pusat Kontrol HUD</h2>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 rounded-lg border border-[var(--border-deck)] hover:bg-[var(--bg-deck)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    title="Tutup Panel"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Cozy Sepia / Dark Cyber Theme Toggle */}
                <div className="mb-6 p-4 rounded-xl bg-slate-950/20 dark:bg-slate-950/45 border border-[var(--border-deck)]/60 flex items-center justify-between shadow-inner">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-main)]">Ganti Tema Visual</h4>
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Tema Sepia Hangat / Gelap Siber</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--bg-card)] border border-[var(--border-deck)] hover:bg-[var(--bg-deck)] text-amber-600 dark:text-amber-400 font-bold rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="Ganti Tema"
                  >
                    {isLightMode ? (
                      <>
                        <Moon size={13} className="text-indigo-600 dark:text-indigo-400" /> Mode Gelap
                      </>
                    ) : (
                      <>
                        <Sun size={13} /> Mode Hangat
                      </>
                    )}
                  </button>
                </div>

                {/* Tantangan Hafalan Launch Button */}
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setIsGameActive(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-amber-500/10 transition-all scale-100 hover:scale-[1.02] active:scale-97 cursor-pointer"
                  >
                    <Play size={13} className="fill-white" /> Mulai Tantangan Hafalan
                  </button>
                </div>

                {/* Visual Learning Toggles Grid */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[var(--text-muted)] font-mono uppercase tracking-wide">
                    Toggle & Kustomisasi HUD
                  </h4>
                  <div className="flex flex-col gap-2">
                    {/* Highlight Golongan */}
                    <div
                      onClick={() => setHighlightGroup(!highlightGroup)}
                      className={`hud-toggle-label ${highlightGroup ? "hud-toggle-active" : ""}`}
                    >
                      <span className="text-[10px] font-bold text-[var(--text-main)]/90">Highlight Golongan (Kolom)</span>
                      <div className={`w-6 h-3 rounded-full relative transition-all ${highlightGroup ? "bg-[var(--color-accent)]" : "bg-slate-700"}`}>
                        <div className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.25 transition-all ${highlightGroup ? "right-0.5" : "left-0.5"}`} />
                      </div>
                    </div>

                    {/* Highlight Periode */}
                    <div
                      onClick={() => setHighlightPeriod(!highlightPeriod)}
                      className={`hud-toggle-label ${highlightPeriod ? "hud-toggle-active" : ""}`}
                    >
                      <span className="text-[10px] font-bold text-[var(--text-main)]/90">Highlight Periode (Baris)</span>
                      <div className={`w-6 h-3 rounded-full relative transition-all ${highlightPeriod ? "bg-[var(--color-accent)]" : "bg-slate-700"}`}>
                        <div className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.25 transition-all ${highlightPeriod ? "right-0.5" : "left-0.5"}`} />
                      </div>
                    </div>

                    {/* Show Block Overlay */}
                    <div
                      onClick={() => setShowBlockOverlay(!showBlockOverlay)}
                      className={`hud-toggle-label ${showBlockOverlay ? "hud-toggle-active" : ""}`}
                    >
                      <span className="text-[10px] font-bold text-[var(--text-main)]/90">Tampilkan Overlay Blok s/p/d/f</span>
                      <div className={`w-6 h-3 rounded-full relative transition-all ${showBlockOverlay ? "bg-[var(--color-accent)]" : "bg-slate-700"}`}>
                        <div className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.25 transition-all ${showBlockOverlay ? "right-0.5" : "left-0.5"}`} />
                      </div>
                    </div>

                    {/* Show Atomic Mass */}
                    <div
                      onClick={() => setShowAtomicMass(!showAtomicMass)}
                      className={`hud-toggle-label ${showAtomicMass ? "hud-toggle-active" : ""}`}
                    >
                      <span className="text-[10px] font-bold text-[var(--text-main)]/90">Tampilkan Massa Atom (Grid)</span>
                      <div className={`w-6 h-3 rounded-full relative transition-all ${showAtomicMass ? "bg-[var(--color-accent)]" : "bg-slate-700"}`}>
                        <div className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.25 transition-all ${showAtomicMass ? "right-0.5" : "left-0.5"}`} />
                      </div>
                    </div>

                    {/* Show Electron Shell */}
                    <div
                      onClick={() => setShowElectronShell(!showElectronShell)}
                      className={`hud-toggle-label ${showElectronShell ? "hud-toggle-active" : ""}`}
                    >
                      <span className="text-[10px] font-bold text-[var(--text-main)]/90">Tampilkan Kulit Elektron (Grid)</span>
                      <div className={`w-6 h-3 rounded-full relative transition-all ${showElectronShell ? "bg-[var(--color-accent)]" : "bg-slate-700"}`}>
                        <div className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.25 transition-all ${showElectronShell ? "right-0.5" : "left-0.5"}`} />
                      </div>
                    </div>

                    {/* Advanced Mode */}
                    <div
                      onClick={() => setAdvancedMode(!advancedMode)}
                      className={`hud-toggle-label ${advancedMode ? "hud-toggle-active" : ""}`}
                    >
                      <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400">Mode Kimia Lanjutan</span>
                      <div className={`w-6 h-3 rounded-full relative transition-all ${advancedMode ? "bg-amber-500" : "bg-slate-700"}`}>
                        <div className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.25 transition-all ${advancedMode ? "right-0.5" : "left-0.5"}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Diagnostics Info Footer */}
              <div className="border-t border-[var(--border-deck)]/60 pt-4 text-left font-mono">
                <h5 className="text-[10px] font-bold text-[var(--color-accent)] tracking-wider uppercase mb-2">Telemetri Sistem</h5>
                <div className="space-y-1 text-[9px] text-[var(--text-muted)]">
                  <div className="flex justify-between">
                    <span>Unsur Terkumpul:</span>
                    <span className="font-bold text-[var(--text-main)]">118 Unsur</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kategori Aktif:</span>
                    <span className="font-bold text-[var(--text-main)] capitalize">
                      {activeFilter ? getCategoryLabel(activeFilter) : "Semua"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pencarian Kata Kunci:</span>
                    <span className="font-bold text-[var(--text-main)] truncate max-w-[140px]">
                      {searchQuery ? `"${searchQuery}"` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status Inti:</span>
                    <span className="text-[var(--color-accent)] font-bold">AKTIF</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  );
}