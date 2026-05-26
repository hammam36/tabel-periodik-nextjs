'use client';

import { useState, useEffect } from "react";
import { 
  Play, Square, Trophy, Sparkles, Clock, 
  Target, HelpCircle, Search, ArrowLeft, X 
} from "lucide-react";

// Kategori unsur kimia untuk filter deck
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

export default function PeriodicGame({ elements, onExit }) {
  // Sub-state game: 
  // 'memorize' (Fase Hafalan) 
  // 'falling' (Fase Hancur Berjatuhan) 
  // 'playing' (Fase Bermain Aktif) 
  // 'finished' (Fase Kemenangan)
  const [gameSubState, setGameSubState] = useState('memorize');
  
  const [gameDeck, setGameDeck] = useState([]);        // Deck unsur tersisa
  const [placedElements, setPlacedElements] = useState({}); // Unsur yang sukses terpasang ({ [number]: elementObj })
  const [selectedDeckElement, setSelectedDeckElement] = useState(null); // Unsur terpilih di deck (untuk drag fallback & highlight)
  
  const [gameTimer, setGameTimer] = useState(0);       // Waktu bermain (detik)
  const [wrongAttempts, setWrongAttempts] = useState(0); // Hitung kesalahan
  const [cluesLeft, setCluesLeft] = useState(10);      // Sisa kuota clue helper (maksimal 10)
  
  const [deckFilter, setDeckFilter] = useState(null);  // Filter kategori di deck
  const [deckSearch, setDeckSearch] = useState("");    // Pencarian text di deck
  const [wrongSlotId, setWrongSlotId] = useState(null); // ID slot grid yang salah (getar merah)
  
  // Pengaturan variabel jatuh acak untuk 118 unsur (dibuat saat transisi ke 'falling')
  const [fallSettings, setFallSettings] = useState({});

  // Fisher-Yates Shuffle Algorithm
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Timer Effect saat bermain
  useEffect(() => {
    let interval = null;
    if (gameSubState === 'playing') {
      interval = setInterval(() => {
        setGameTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [gameSubState]);

  // Handler Klik Mulai Permainan (Memicu ledakan/jatuh)
  const handleStartGameClick = () => {
    // Bangun setelan jatuh acak untuk setiap nomor atom (1-118)
    const settings = {};
    elements.forEach((el) => {
      const rot = Math.floor(Math.random() * 180) - 90;
      const delay = Math.random() * 0.15; // Diperkecil agar rontok lebih cepat dan padat
      settings[el.number] = { rot, delay };
    });
    setFallSettings(settings);

    // Pindah ke fase jatuh
    setGameSubState('falling');

    // Inisialisasi deck & state game
    const shuffled = shuffleArray(elements);
    setGameDeck(shuffled);
    setPlacedElements({});
    setSelectedDeckElement(null);
    setWrongAttempts(0);
    setCluesLeft(10);
    setGameTimer(0);
    setDeckFilter(null);
    setDeckSearch("");

    // Setelah animasi jatuh selesai (1.0 detik), masuk ke bermain aktif
    setTimeout(() => {
      setGameSubState('playing');
    }, 1000);
  };

  // Menangani penempatan unsur di slot target
  const handlePlaceElement = (targetNumber, element) => {
    if (element.number === targetNumber) {
      // PENEMPATAN BENAR
      setPlacedElements((prev) => ({
        ...prev,
        [targetNumber]: { ...element, animateType: 'success' }
      }));
      
      const newDeck = gameDeck.filter((item) => item.number !== targetNumber);
      setGameDeck(newDeck);
      setSelectedDeckElement(null);

      // Cek menang
      if (newDeck.length === 0) {
        setGameSubState('finished');
      }
    } else {
      // PENEMPATAN SALAH (Kembali ke deck secara visual)
      setWrongAttempts((prev) => prev + 1);
      setWrongSlotId(targetNumber);
      
      // Matikan status salah setelah animasi getaran getar selesai
      setTimeout(() => {
        setWrongSlotId(null);
      }, 300);
    }
  };

  // Clue Helper: Susun otomatis 5 unsur, memotong kuota 10
  const useClue = () => {
    if (gameSubState !== 'playing' || gameDeck.length === 0 || cluesLeft <= 0) return;

    // Kurangi kuota clue
    setCluesLeft((prev) => prev - 1);

    // Ambil 5 unsur acak dari sisa deck
    const shuffled = shuffleArray(gameDeck);
    const selectedClues = shuffled.slice(0, Math.min(5, gameDeck.length));

    const newPlaced = { ...placedElements };
    selectedClues.forEach((el) => {
      newPlaced[el.number] = { ...el, animateType: 'clue' };
    });

    setPlacedElements(newPlaced);

    const clueNumbers = selectedClues.map((el) => el.number);
    const newDeck = gameDeck.filter((item) => !clueNumbers.includes(item.number));
    setGameDeck(newDeck);
    setSelectedDeckElement(null);

    // Cek kemenangan
    if (newDeck.length === 0) {
      setGameSubState('finished');
    }
  };

  // Drag Handlers (HTML5 Native Drag and Drop)
  const handleDragStart = (e, el) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(el));
    e.dataTransfer.effectAllowed = "move";
    setSelectedDeckElement(el);
  };

  const handleDragEnd = () => {
    setSelectedDeckElement(null);
  };

  // Formatter Waktu detik -> mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filter & Search Deck
  const filteredDeck = gameDeck.filter((el) => {
    const matchesCategory = !deckFilter || el.category === deckFilter;
    const matchesSearch = 
      el.symbol.toLowerCase().includes(deckSearch.toLowerCase()) || 
      el.name.toLowerCase().includes(deckSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Kalkulasi Akurasi
  const currentAccuracy = 
    Object.keys(placedElements).length > 0 
      ? Math.round((Object.keys(placedElements).length / (Object.keys(placedElements).length + wrongAttempts)) * 100) 
      : 100;

  return (
    <div className="w-full animate-slide-up">
      {/* 1. HEADER KONTROL PERMAINAN */}
      {gameSubState === 'memorize' ? (
        <header className="flex justify-between items-center mb-6 border-b border-slate-800/40 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="p-1.5 bg-[var(--bg-card)] border border-[var(--border-deck)] hover:bg-[var(--bg-main)] text-[var(--text-main)] rounded-lg transition-colors shadow-sm"
              title="Kembali ke Eksplorasi"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-amber-600">
                FASE HAFALAN & PERSIAPAN
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Perhatikan baik-baik posisi seluruh atom di bawah ini sebelum Anda memulai tantangan!
              </p>
            </div>
          </div>

          <button
            onClick={handleStartGameClick}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg hover:shadow-amber-500/10 transition-all scale-100 hover:scale-105 active:scale-95 animate-pulse"
          >
            <Play size={14} className="fill-white" /> Mulai Permainan
          </button>
        </header>
      ) : (
        /* KONTROL AKTIF BERMAIN GAME */
        <header className="mb-6 bg-[var(--bg-deck)] border border-[var(--border-deck)] text-[var(--text-main)] rounded-2xl p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="text-amber-600 animate-pulse" size={22} />
              <span className="font-black text-sm tracking-widest text-[var(--text-main)] uppercase">MODE TANTANGAN</span>
            </div>

            {gameSubState === 'playing' && (
              <div className="flex items-center gap-6 border-l border-[var(--border-deck)] pl-6 text-sm">
                <div className="flex items-center gap-2 text-[var(--text-main)]">
                  <Clock size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="font-mono font-bold text-lg w-12">{formatTime(gameTimer)}</span>
                </div>

                <div className="flex items-center gap-2 text-[var(--text-main)]">
                  <Target size={16} className="text-[var(--color-accent)]" />
                  <span>Progres: <strong className="font-mono text-base text-[var(--color-accent)]">{Object.keys(placedElements).length}</strong> / 118</span>
                </div>

                <div className="flex items-center gap-2 text-[var(--text-main)]">
                  <HelpCircle size={16} className="text-rose-600 dark:text-rose-400" />
                  <span>Salah: <strong className="font-mono text-base text-rose-600 dark:text-rose-400">{wrongAttempts}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-[var(--text-main)]">
                  <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
                  <span>Akurasi: <strong className="font-mono text-base text-amber-600 dark:text-amber-400">{currentAccuracy}%</strong></span>
                </div>
              </div>
            )}
          </div>

          {gameSubState === 'playing' && (
            <div className="flex items-center gap-2">
              <button
                onClick={useClue}
                disabled={cluesLeft <= 0 || gameDeck.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-600/10 border border-amber-500/40 hover:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-bold rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                title={`Bantu tempatkan 5 unsur secara benar (Sisa kuota: ${cluesLeft})`}
              >
                <Sparkles size={13} /> Clue Helper (Sisa: {cluesLeft})
              </button>

              <button
                onClick={onExit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md hover:shadow-rose-600/10 transition-all scale-100 hover:scale-105 active:scale-95"
              >
                <Square size={13} className="fill-white" /> Menyerah
              </button>
            </div>
          )}
        </header>
      )}

      {/* 2. SPANDUK PANDUAN KONDISIONAL (FASE MEMORIZE) - KONTRAS DINAMIS 100% SUKSES */}
      {gameSubState === 'memorize' && (
        <section className="mb-6 p-4 bg-[var(--bg-alert)] border border-[var(--border-alert)] rounded-2xl flex items-start gap-3 shadow-inner">
          <span className="text-xl mt-0.5">💡</span>
          <div>
            <h3 className="font-bold text-[var(--text-alert-title)] text-sm">Petunjuk Fase Hafalan</h3>
            <p className="text-xs text-[var(--text-alert-desc)] leading-relaxed mt-0.5">
              Anda boleh menghafalkan seluruh struktur dan tata letak seluruh atom di bawah ini. Silakan pencet tombol <strong className="text-[var(--text-alert-bold)] font-bold">Mulai Permainan</strong> di sudut kanan atas ketika Anda sudah merasa siap menghadapi tantangan!
            </p>
          </div>
        </section>
      )}

      {/* 3. GRID TABEL PERIODIK GAME */}
      <section className="grid grid-cols-18 gap-1.5 p-4 bg-slate-950/10 dark:bg-slate-950/30 rounded-2xl border border-[var(--border-deck)] shadow-inner relative">
        {elements.map((el) => {
          // --- FASE 1: MEMORIZE (MENGHAFAL) ---
          if (gameSubState === 'memorize') {
            return (
              <div
                key={`memorize-${el.number}`}
                style={{
                  gridColumnStart: el.col,
                  gridRowStart: el.row,
                  backgroundColor: `var(--cat-${el.category})`
                }}
                className="border border-slate-900/10 dark:border-slate-900/30 rounded-lg p-1.5 flex flex-col items-center justify-between aspect-square transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] shadow-md"
              >
                <span className="text-[9px] text-white/70 self-start font-mono font-bold leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{el.number}</span>
                <span className="text-lg font-black text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{el.symbol}</span>
                <span className="text-[8px] font-bold text-white/90 truncate max-w-full leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{el.name}</span>
              </div>
            );
          }

          // --- FASE 2: FALLING (HANCUR & JATUH) ---
          if (gameSubState === 'falling') {
            const settings = fallSettings[el.number] || { rot: 45, delay: 0 };
            return (
              <div
                key={`falling-${el.number}`}
                style={{
                  gridColumnStart: el.col,
                  gridRowStart: el.row,
                  backgroundColor: `var(--cat-${el.category})`,
                  '--fall-rot': `${settings.rot}deg`,
                  animationDelay: `${settings.delay}s`
                }}
                className="border border-slate-900/10 rounded-lg p-1.5 flex flex-col items-center justify-between aspect-square shadow-md animate-fall z-20 pointer-events-none"
              >
                <span className="text-[9px] text-white/70 self-start font-mono font-bold leading-none">{el.number}</span>
                <span className="text-lg font-black text-white tracking-wide">{el.symbol}</span>
                <span className="text-[8px] font-bold text-white/90 truncate max-w-full leading-none">{el.name}</span>
              </div>
            );
          }

          // --- FASE 3: PLAYING (BERMAIN AKTIF) ---
          const placedItem = placedElements[el.number];
          const isWrongSlot = wrongSlotId === el.number;

          if (placedItem) {
            const animClass = 
              placedItem.animateType === 'success' 
                ? 'animate-success-pop' 
                : placedItem.animateType === 'clue' 
                ? 'animate-pulse-gold border-amber-500' 
                : '';

            return (
              <div
                key={`playing-placed-${el.number}`}
                style={{
                  gridColumnStart: el.col,
                  gridRowStart: el.row,
                  backgroundColor: `var(--cat-${el.category})`
                }}
                className={`border border-slate-900/10 rounded-lg p-1.5 flex flex-col items-center justify-between aspect-square shadow-md ${animClass}`}
              >
                <span className="text-[9px] text-white/70 self-start font-mono font-bold leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{el.number}</span>
                <span className="text-lg font-black text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{el.symbol}</span>
                <span className="text-[8px] font-bold text-white/90 truncate max-w-full leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{el.name}</span>
              </div>
            );
          }

          // SLOT GRID KOSONG (KONTRAS HANGAT PREMIUM)
          return (
            <div
              key={`playing-empty-${el.number}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                try {
                  const dataStr = e.dataTransfer.getData("text/plain");
                  const element = dataStr ? JSON.parse(dataStr) : selectedDeckElement;
                  if (!element) return;
                  handlePlaceElement(el.number, element);
                } catch (err) {
                  if (selectedDeckElement) {
                    handlePlaceElement(el.number, selectedDeckElement);
                  }
                }
              }}
              style={{
                gridColumnStart: el.col,
                gridRowStart: el.row
              }}
              className={`border border-dashed rounded-lg p-1.5 flex flex-col items-start justify-start aspect-square transition-all duration-200 ${
                isWrongSlot 
                  ? "border-rose-600 bg-rose-500/20 animate-shake" 
                  : selectedDeckElement
                  ? "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/5 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 hover:scale-102"
                  : "border-[var(--border-slot)] bg-[var(--bg-slot)]"
              }`}
            >
              <span className="text-[10px] text-[var(--text-slot-num)] font-mono font-bold leading-none">{el.number}</span>
            </div>
          );
        })}
      </section>

      {/* 4. PANEL DECK ATOM JATUH */}
      {gameSubState === 'playing' && (
        <section className="bg-[var(--bg-deck)] border border-[var(--border-deck)] rounded-2xl p-5 mt-6 animate-slide-up shadow-xl">
          
          {/* Header Deck: Kontrol Filter & Pencarian */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-[var(--border-deck)]/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-deck-title)] uppercase tracking-widest">Deck Atom Tersisa ({filteredDeck.length})</span>
              {deckFilter && (
                <button 
                  onClick={() => setDeckFilter(null)}
                  className="text-[10px] bg-[var(--bg-card)] border border-[var(--border-deck)] hover:bg-[var(--bg-main)] text-[var(--text-main)] px-2 py-0.5 rounded-full"
                >
                  Atur Ulang
                </button>
              )}
            </div>

            {/* Deck Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full md:w-60">
                <span className="absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Cari simbol atau nama..."
                  value={deckSearch}
                  onChange={(e) => setDeckSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-main)] border border-[var(--border-deck)] rounded-lg text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                {deckSearch && (
                  <button 
                    onClick={() => setDeckSearch("")}
                    className="absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dropdown Kategori */}
              <select
                value={deckFilter || ""}
                onChange={(e) => setDeckFilter(e.target.value || null)}
                className="bg-[var(--bg-main)] border border-[var(--border-deck)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List Atom di Deck (Mendukung HTML5 Drag & Drop) */}
          {filteredDeck.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--text-muted)] font-mono">
              Tidak ada unsur yang cocok dalam pencarian/filter deck.
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-3 pt-1 custom-scrollbar scroll-smooth">
              {filteredDeck.map((el) => {
                const isSelected = selectedDeckElement?.number === el.number;
                return (
                  <div
                    key={el.number}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, el)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedDeckElement(isSelected ? null : el)}
                    style={{ 
                      backgroundColor: isSelected ? 'transparent' : `var(--cat-${el.category})`,
                    }}
                    className={`w-14 h-14 shrink-0 rounded-xl p-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 shadow-md ${
                      isSelected 
                        ? "border-2 border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/10 scale-105 animate-pulse-gold" 
                        : "border border-white/5 hover:scale-105 hover:brightness-110"
                    }`}
                    title="Seret unsur ini ke grid!"
                  >
                    <span className="text-base font-black text-white tracking-wide leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{el.symbol}</span>
                    <span className="text-[7px] text-white/95 truncate max-w-full font-bold leading-none mt-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{el.name}</span>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3 text-[10px] text-[var(--text-muted)] italic">
            <span>💡 Petunjuk: Seret (Drag & Drop) atom dari deck di atas menuju kotak grid tujuan yang tepat!</span>
            <span className="text-amber-800 dark:text-amber-400 font-semibold">Nomor atom disembunyikan di deck agar lebih menantang!</span>
          </div>
        </section>
      )}

      {/* 5. OVERLAY SELEBRASI KEMENANGAN (WIN SCREEN - HANGAT PREMIUM) */}
      {gameSubState === 'finished' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-deck)] rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-center animate-success-pop">
            
            <div className="absolute top-6 left-6 text-[var(--color-accent)]/20 animate-pulse">
              <Sparkles size={32} />
            </div>
            <div className="absolute bottom-6 right-6 text-[var(--color-accent)]/20 animate-pulse">
              <Sparkles size={32} />
            </div>

            <div className="w-20 h-20 bg-[var(--bg-main)] border border-[var(--border-deck)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
              <Trophy size={48} className="text-amber-500 fill-amber-500/10" />
            </div>

            <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight mb-2">Tantangan Selesai!</h2>
            <p className="text-xs text-[var(--color-accent)] font-bold uppercase tracking-widest mb-6">
              Seluruh Atom Berhasil Disusun Kembali
            </p>

            {/* STATISTIK AKHIR */}
            <div className="bg-[var(--bg-main)] border border-[var(--border-deck)] rounded-2xl p-5 mb-8 text-left space-y-3.5 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-[var(--border-deck)]/60">
                <span className="text-[var(--text-muted)] flex items-center gap-2">
                  <Clock size={16} className="text-indigo-600 dark:text-indigo-400" /> Waktu Tempuh
                </span>
                <span className="font-mono font-bold text-[var(--text-main)] text-base">{formatTime(gameTimer)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[var(--border-deck)]/60">
                <span className="text-[var(--text-muted)] flex items-center gap-2">
                  <HelpCircle size={16} className="text-rose-600 dark:text-rose-400" /> Tebakan Salah
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-base">{wrongAttempts} kali</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[var(--text-muted)] flex items-center gap-2">
                  <Target size={16} className="text-amber-600 dark:text-amber-400" /> Akurasi Akhir
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-base">
                  {Math.round((118 / (118 + wrongAttempts)) * 100)}%
                </span>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="space-y-3">
              <button
                onClick={handleStartGameClick}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg transition-all scale-100 hover:scale-102 active:scale-98"
              >
                Bermain Lagi
              </button>
              <button
                onClick={onExit}
                className="w-full py-3 bg-[var(--bg-main)] border border-[var(--border-deck)] hover:bg-[var(--bg-deck)] text-[var(--text-main)] font-bold rounded-xl transition-all scale-100 hover:scale-102 active:scale-98"
              >
                Kembali ke Eksplorasi
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
