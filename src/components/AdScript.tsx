import React from "react";
import Script from "next/script"; // Ensure this is installed for Next.js

const AdScript: React.FC = () => {
  return (
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
  );
};

export default AdScript;
