import { TailwindIndicator } from '@/components/tailwind-indicator';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
// import { TrpcProvider } from '@/client/trpc-provider';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import { Analytics } from '@/components/analytics';
import { siteConfig } from '@/configs/site';
import { env } from '@/env.mjs';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import { Toaster } from 'sonner';
import dynamic from 'next/dynamic';

// Import client-only components dynamically
const ClientOnly = dynamic(() => import('@/components/client-only'), { ssr: false });

export const runtime = 'edge';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Font files can be colocated inside of `pages`
const fontHeading = localFont({
  src: '../assets/fonts/CalSans-SemiBold.woff2',
  variable: '--font-heading',
});

// Define viewport for Next.js app
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'overlflow-y-auto min-h-screen overflow-x-hidden bg-background font-sans antialiased',
          fontSans.variable,
          fontHeading.variable,
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          {/* <TrpcProvider> */}
          <ClientOnly>
            {children}
            <TailwindIndicator />
            <Analytics />
            <SpeedInsights />
            <Toaster position="top-center" richColors />
          </ClientOnly>
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

          {/* Ad Script */}
          <Script
            id="ad-script"
            dangerouslySetInnerHTML={{
              __html: `
          /*<![CDATA[*/
          (function(){
            var h=window,i="c45fdd13b81808e704f8cec79d2fdcd7",
            o=[["siteId",25*424*374+1190413],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","auto"]],
            y=["d3d3LmRpc3BsYXl2ZXJ0aXNpbmcuY29tL2tqcy15YW1sLm1pbi5jc3M=","ZDNtem9rdHk5NTFjNXcuY2xvdWRmcm9udC5uZXQveGpLQ0YvZ1VQTkcubWluLmpz"],
            r=-1,e,p,x=function(){
              clearTimeout(p);
              r++;
              if(y[r]&&!(1758997146000<(new Date).getTime()&&1<r)){
                e=h.document.createElement("script");
                e.type="text/javascript";
                e.async=!0;
                var t=h.document.getElementsByTagName("script")[0];
                e.src="https://"+atob(y[r]);
                e.crossOrigin="anonymous";
                e.onerror=x;
                e.onload=function(){
                  clearTimeout(p);
                  h[i.slice(0,16)+i.slice(0,16)]||x()
                };
                p=setTimeout(x,5E3);
                t.parentNode.insertBefore(e,t)
              }
            };
            if(!h[i]){
              try{
                Object.freeze(h[i]=o)
              }catch(e){}
              x()
            }
          })();
          /*]]>*/
          `,
            }}
          />

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
