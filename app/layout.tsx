import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
    "Interactive comparison of Australia's current 50% CGT discount, the proposed indexation alternative, and the 18 Jun 2026 small-business/startup carve-out update.",
  icons: {
    icon: "/og-preview.svg",
  },
  openGraph: {
    title: "CGT Compounding Calculator",
    description:
      "Stress-test long-term capital gains outcomes, including the latest small-business and startup carve-out signals.",
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
      "Stress-test long-term capital gains outcomes, including the latest small-business and startup carve-out signals.",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LYEQ3C7J0X"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LYEQ3C7J0X');
          `}
        </Script>
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
