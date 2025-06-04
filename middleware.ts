import { NextResponse } from "next/server";

export function middleware(req: Request) {
    const res = NextResponse.next();

    // Inject Clarity script
    const clarityScript = `
        (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "qesjj91p8i");
    `;

    res.headers.set("Content-Security-Policy", "script-src 'self' 'unsafe-inline' https://www.clarity.ms");
    res.headers.set("X-Clarity-Script", clarityScript); // Custom header (for debugging)

    return res;
}
