import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://australia-cgt-reform-calculator.setiyaputra.me"),
  title: "CGT Compounding Calculator",
  description:
    "A one-page interactive comparison of Australia's current 50% CGT discount and an illustrative inflation-indexation alternative.",
  icons: {
    icon: "/og-preview.svg",
  },
  openGraph: {
    title: "CGT Compounding Calculator",
    description:
      "Stress-test long-term capital gains outcomes under different tax treatments.",
    type: "website",
    url: "https://australia-cgt-reform-calculator.setiyaputra.me",
    images: [
      {
        url: "/og-preview.png",
        width: 1731,
        height: 909,
        alt: "CGT Compounding Stress Test",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CGT Compounding Calculator",
    description:
      "Stress-test long-term capital gains outcomes under different tax treatments.",
    images: ["/og-preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/json" href="/.well-known/ai-context.json" title="AI context" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs text" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var d = document.documentElement;
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    d.classList.add('dark');
                    d.classList.remove('light');
                  } else if (theme === 'light') {
                    d.classList.add('light');
                    d.classList.remove('dark');
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    d.classList.add('dark');
                    d.classList.remove('light');
                  } else {
                    d.classList.add('light');
                    d.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
