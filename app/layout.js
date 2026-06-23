import "./globals.css";

export const metadata = {
  title: "Tabel Periodik Unsur Kuantum",
  description: "Website edukasi tabel periodik modern dengan visual HUD premium",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
