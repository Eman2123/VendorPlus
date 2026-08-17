import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VendorPulse",
  description: "Autonomous voice check-ins for vendor risk detection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white px-6 py-4">
          <h1 className="text-xl font-semibold">VendorPulse</h1>
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
