'use client'; // Wajib ditulis di paling atas agar kita bisa pakai fitur Interaktif (useState)

import { useState, useEffect } from "react";

export default function HomePage() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null); // Menyimpan data unsur yang diklik
  const [loading, setLoading] = useState(true);

  // Ambil data dari API Backend saat halaman pertama kali dimuat
  useEffect(() => {
    fetch("/api/elements")
      .then((res) => res.json())
      .then((data) => {
        setElements(data);
        setLoading(false);
      })
      .catch((err) => console.error("Gagal memuat API:", err));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center text-[var(--color-accent)] font-mono">
        Memuat Data API...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-8">

      {/* TAMPILAN MOBILE */}
      <div className="block md:hidden text-center my-auto pt-20 px-4">
        <h2 className="text-2xl font-bold text-amber-400 mb-4">Layar Terlalu Kecil</h2>
        <p className="text-[var(--text-muted)]">
          Website Tabel Periodik Interaktif ini membutuhkan layar yang lebih lebar.
          Silakan buka menggunakan Laptop atau Desktop untuk menikmati seluruh fitur.
        </p>
      </div>

      {/* TAMPILAN UTAMA */}
      <div className="hidden md:block">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-accent)] mb-2">
            Tabel Periodik Interaktif
          </h1>
          <p className="text-[var(--text-muted)]">
            Klik pada salah satu unsur untuk melihat informasi detail.
          </p>
        </header>

        {/* TEMPAT GRID TABEL PERIODIK */}
        <section className="max-w-7xl mx-auto grid grid-cols-18 gap-2 p-4 bg-slate-950 rounded-2xl border border-slate-800">
          {elements.map((el) => (
            <div
              key={el.number}
              onClick={() => setSelectedElement(el)} // Fungsi pemicu saat diklik
              style={{
                gridColumnStart: el.col,
                gridRowStart: el.row,
                backgroundColor: `var(--cat-${el.category})`
              }}
              className="border border-slate-800/50 rounded-lg p-1.5 flex flex-col items-center justify-between aspect-square shadow-[inset_0_1px_0_rgba(255,255,255,0.1),_0_4px_6px_-1px_rgba(0,0,0,0.5)] hover:brightness-125 hover:scale-105 transition-all cursor-pointer group"
            >
              <span className="text-[9px] text-slate-300/70 self-start font-mono leading-none">{el.number}</span>
              <span className="text-lg font-bold text-white tracking-wide">{el.symbol}</span>
              <span className="text-[8px] font-medium text-slate-300/80 truncate max-w-full leading-none">{el.name}</span>
            </div>
          ))}
        </section>

        {/* MODAL DETAIL UNSUR (Hanya muncul jika selectedElement tidak kosong) */}
        {selectedElement && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--bg-card)] border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-center">
              <button
                onClick={() => setSelectedElement(null)} // Tutup Modal
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white text-lg font-bold"
              >
                ✕
              </button>

              <div
                style={{ backgroundColor: `var(--cat-${selectedElement.category})` }}
                className="w-20 h-20 rounded-xl mx-auto flex flex-col items-center justify-center shadow-lg mb-4"
              >
                <span className="text-xs text-slate-200/80 font-mono">{selectedElement.number}</span>
                <span className="text-3xl font-bold text-white">{selectedElement.symbol}</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">{selectedElement.name}</h2>
              <p className="text-sm text-[var(--color-accent)] uppercase tracking-wider font-semibold mb-4 text-xs">
                {selectedElement.category.replace("-", " ")}
              </p>

              <div className="border-t border-slate-700 pt-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Massa Atom:</span>
                  <span className="font-mono font-medium">{selectedElement.mass} u</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Golongan (Kolom):</span>
                  <span className="font-mono font-medium">{selectedElement.col}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Periode (Baris):</span>
                  <span className="font-mono font-medium">{selectedElement.row}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}