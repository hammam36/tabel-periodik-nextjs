export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-8">

      {/* 1. TAMPILAN MOBILE (Hanya muncul di layar HP / di bawah ukuran 'md') */}
      <div className="block md:hidden text-center my-auto pt-20 px-4">
        <h2 className="text-2xl font-bold text-amber-400 mb-4">Layar Terlalu Kecil</h2>
        <p className="text-[var(--text-muted)]">
          Website Tabel Periodik Interaktif ini membutuhkan layar yang lebih lebar.
          Silakan buka menggunakan Laptop atau Desktop untuk menikmati seluruh fitur.
        </p>
      </div>

      {/* 2. TAMPILAN UTAMA (Hanya muncul di Laptop/Tablet ke atas) */}
      <div className="hidden md:block">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-accent)] mb-2">
            Tabel Periodik Interaktif
          </h1>
          <p className="text-[var(--text-muted)]">
            Eksplorasi unsur kimia dengan performa Next.js dan API modern.
          </p>
        </header>

        <section className="max-w-6xl mx-auto border border-dashed border-slate-700 rounded-xl p-12 text-center text-[var(--text-muted)]">
          [ Tempat Grid Tabel Periodik Akan Muncul ]
        </section>
      </div>

    </main>
  );
}