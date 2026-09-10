import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "VendorPulse",
  description: "Autonomous voice check-ins for vendor risk detection",
};

// Applies the saved theme before paint, so there's no light-flash on load.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <Script
          src="https://cdn.staticfile.net/translate.js/3.18.66/translate.js"
          strategy="afterInteractive"
        />
        <Script id="translate-init" strategy="afterInteractive">
          {`
            if (window.translate) {
              translate.service.use('client.edge');
              translate.listener.start();
              translate.execute();
            }
          `}
        </Script>
      </body>
    </html>
  );
}