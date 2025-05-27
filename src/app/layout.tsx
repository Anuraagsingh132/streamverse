import { TailwindIndicator } from '@/components/tailwind-indicator';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
// import { TrpcProvider } from '@/client/trpc-provider';
import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import { Analytics } from '@/components/analytics';
import { siteConfig } from '@/configs/site';
import { env } from '@/env.mjs';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script'; // Ensure this is imported

export const runtime = 'edge';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Font files can be colocated inside of pages
const fontHeading = localFont({
  src: '../assets/fonts/CalSans-SemiBold.woff2',
  variable: '--font-heading',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: 'StreamVerse - Watch TV Shows Online, Watch Movies Online',
    template: '%s - StreamVerse - Watch TV Shows Online, Watch Movies Online',
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: siteConfig.author,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.author,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    images: siteConfig.ogImage,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.author,
  },
  icons: {
    icon: '/favicon.ico',
  },
  other: { referrer: 'no-referrer-when-downgrade' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Adcash Step 1: Include Adcash library */}
      {/* This script is placed in the <head> and loaded/executed before the page is interactive */}
      {/* due to the 'beforeInteractive' strategy. */}
      <Script
        id="aclib" // ID from Adcash instructions
        type="text/javascript" // Type from Adcash instructions
        src="//acscdn.com/script/aclib.js"
        strategy="beforeInteractive"
      />
      {/* Adcash Step 2: Put the tag script on the page */}
      {/* This script will also be placed in <head> after aclib.js (due to 'beforeInteractive' */}
      {/* strategy and its order of definition here) and executed. */}
      <Script
        id="aclib-runAutoTag" // Unique ID for this Next.js Script component
        type="text/javascript" // Type from Adcash instructions
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
  aclib.runAutoTag({
      zoneId: '3wxrn4xx94',
  });
`,
        }}
      />

      <body
        className={cn(
          'overflow-y-auto min-h-screen overflow-x-hidden bg-background font-sans antialiased', // Corrected typo: overlflow -> overflow
          fontSans.variable,
          fontHeading.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* <TrpcProvider> */}
          {children}
          <TailwindIndicator />
          <Analytics />
          <SpeedInsights />
          {/* </TrpcProvider> */}

          {/* Google Analytics */}
          {env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
            <>
              <Script
                id="_next-ga-init"
                dangerouslySetInnerHTML={{
                  __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', '${env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}', { cookie_flags: 'max-age=86400;secure;samesite=none' });`,
                }}
              />
              <Script
                id="_next-ga"
                src={`https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
              />
            </>
          )}

          {/* Statcounter Code Integration */}
          <Script
            id="statcounter"
            dangerouslySetInnerHTML={{
              __html: `
var sc_project=13061182;
var sc_invisible=1;
var sc_security="78c4c774";
`,
            }}
          />
          <Script
            src="https://www.statcounter.com/counter/counter.js"
            async
          />
          <noscript>
            <div className="statcounter">
              <a
                title="Web Analytics"
                href="https://statcounter.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="statcounter"
                  src="https://c.statcounter.com/13061182/0/78c4c774/1/"
                  alt="Web Analytics"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </a>
            </div>
          </noscript>

          {/* Umami Analytics */}
          <script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id="f442e6bb-9667-4262-9abd-73a77381c170"
          ></script>
        </ThemeProvider>
      </body>
    </html>
  );
}
