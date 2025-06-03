'use client';

import Script from 'next/script';

export default function Ads() {
  return (
    <div className="ads-container space-y-6">
      {/* Adsterra: 728x90 */}
      <Script
        id="adsterra-728x90"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            atOptions = {
              'key': 'c431e949315893bdf8c48085cfccd7d9',
              'format': 'iframe',
              'height': 90,
              'width': 728,
              'params': {}
            };
          `,
        }}
      />
      <Script
        strategy="afterInteractive"
        src="//www.highperformanceformat.com/c431e949315893bdf8c48085cfccd7d9/invoke.js"
      />

      {/* Adsterra: 300x250 */}
      <Script
        id="adsterra-300x250"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            atOptions = {
              'key': '13d1a0e39ca4dfd7819677cdb2911c5b',
              'format': 'iframe',
              'height': 250,
              'width': 300,
              'params': {}
            };
          `,
        }}
      />
      <Script
        strategy="afterInteractive"
        src="//www.highperformanceformat.com/13d1a0e39ca4dfd7819677cdb2911c5b/invoke.js"
      />

      {/* Adsterra: 160x300 */}
      <Script
        id="adsterra-160x300"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            atOptions = {
              'key': 'b6513a9958d950e92be16d6245dac830',
              'format': 'iframe',
              'height': 300,
              'width': 160,
              'params': {}
            };
          `,
        }}
      />
      <Script
        strategy="afterInteractive"
        src="//www.highperformanceformat.com/b6513a9958d950e92be16d6245dac830/invoke.js"
      />

      {/* Adsterra: 468x60 */}
      <Script
        id="adsterra-468x60"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            atOptions = {
              'key': '3ddbd354710f44e6241ea1b97e47525b',
              'format': 'iframe',
              'height': 60,
              'width': 468,
              'params': {}
            };
          `,
        }}
      />
      <Script
        strategy="afterInteractive"
        src="//www.highperformanceformat.com/3ddbd354710f44e6241ea1b97e47525b/invoke.js"
      />

      {/* ProfitablerateCPM Script 1 */}
      <Script
        id="profitableratecpm-js1"
        strategy="afterInteractive"
        src="//pl24539914.profitableratecpm.com/ec/cb/24/eccb241596f6411c0cb80a81006751df.js"
      />

      {/* ProfitablerateCPM Native Banner */}
      <Script
        id="native-banner-script"
        strategy="afterInteractive"
        src="//pl24530369.profitableratecpm.com/90ed2567d0784fbededf878dd85cad3c/invoke.js"
        async
        data-cfasync="false"
      />
      <div id="container-90ed2567d0784fbededf878dd85cad3c"></div>
    </div>
  );
}
