import { TailwindIndicator } from '@/components/tailwind-indicator';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import { Analytics } from '@/components/analytics';
import { siteConfig } from '@/configs/site';
import { env } from '@/env.mjs';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

export const runtime = 'edge';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

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
    template: `%s - StreamVerse - Watch TV Shows Online, Watch Movies Online`,
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
      <head>
        {/* Popunder Script (Place before </head>) */}
        <Script
          id="popunder"
          strategy="beforeInteractive"
          src="//pl24530115.profitableratecpm.com/23/5a/d6/235ad6b2de46117f95b93785b3b0198b.js"
        />
      </head>
      <body
        className={cn(
          'overlflow-y-auto min-h-screen overflow-x-hidden bg-background font-sans antialiased',
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
          {children}
          <TailwindIndicator />
          <Analytics />
          <SpeedInsights />

          {/* --- Google Analytics --- */}
          {env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
            <>
              <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){window.dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}', {
                      cookie_flags: 'max-age=86400;secure;samesite=none'
                    });`,
                }}
              />
              <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
              />
            </>
          )}

          {/* --- Statcounter --- */}
          <Script
            id="statcounter-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                var sc_project=13061182;
                var sc_invisible=1;
                var sc_security="78c4c774";
              `,
            }}
          />
          <Script
            strategy="afterInteractive"
            src="https://www.statcounter.com/counter/counter.js"
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

          {/* --- Umami --- */}
          <Script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id="f442e6bb-9667-4262-9abd-73a77381c170"
          />

          {/* --- Adsterra and ProfitablerateCPM Ads --- */}

          {/* 728x90 */}
          <Script
            id="ad-728x90"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `atOptions = {
                'key': 'c431e949315893bdf8c48085cfccd7d9',
                'format': 'iframe',
                'height': 90,
                'width': 728,
                'params': {}
              };`,
            }}
          />
          <Script
            strategy="afterInteractive"
            src="//www.highperformanceformat.com/c431e949315893bdf8c48085cfccd7d9/invoke.js"
          />

          {/* 300x250 */}
          <Script
            id="ad-300x250"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `atOptions = {
                'key': '13d1a0e39ca4dfd7819677cdb2911c5b',
                'format': 'iframe',
                'height': 250,
                'width': 300,
                'params': {}
              };`,
            }}
          />
          <Script
            strategy="afterInteractive"
            src="//www.highperformanceformat.com/13d1a0e39ca4dfd7819677cdb2911c5b/invoke.js"
          />

          {/* 160x300 */}
          <Script
            id="ad-160x300"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `atOptions = {
                'key': 'b6513a9958d950e92be16d6245dac830',
                'format': 'iframe',
                'height': 300,
                'width': 160,
                'params': {}
              };`,
            }}
          />
          <Script
            strategy="afterInteractive"
            src="//www.highperformanceformat.com/b6513a9958d950e92be16d6245dac830/invoke.js"
          />

          {/* 468x60 */}
          <Script
            id="ad-468x60"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `atOptions = {
                'key': '3ddbd354710f44e6241ea1b97e47525b',
                'format': 'iframe',
                'height': 60,
                'width': 468,
                'params': {}
              };`,
            }}
          />
          <Script
            strategy="afterInteractive"
            src="//www.highperformanceformat.com/3ddbd354710f44e6241ea1b97e47525b/invoke.js"
          />

          {/* ProfitablerateCPM JS */}
          <Script
            id="profitableratecpm-1"
            strategy="afterInteractive"
            src="//pl24539914.profitableratecpm.com/ec/cb/24/eccb241596f6411c0cb80a81006751df.js"
          />

          {/* Native Banner */}
          <Script
            id="native-banner"
            strategy="afterInteractive"
            src="//pl24530369.profitableratecpm.com/90ed2567d0784fbededf878dd85cad3c/invoke.js"
            async
            data-cfasync="false"
          />
          <div id="container-90ed2567d0784fbededf878dd85cad3c"></div>
        </ThemeProvider>
      </body>
    </html>
  );
}
