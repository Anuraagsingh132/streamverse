'use client';

import React from 'react';

interface EmbedPlayerProps {
  url: string;
}

function EmbedPlayer({ url }: EmbedPlayerProps) {
  const ref = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.src = url;
    }

    const iframe = ref.current;
    const handleIframeLoaded = () => {
      if (iframe) iframe.style.opacity = '1';
    };

    iframe?.addEventListener('load', handleIframeLoaded);
    return () => {
      iframe?.removeEventListener('load', handleIframeLoaded);
    };
  }, [url]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: '#000',
      }}>
      <iframe
        ref={ref}
        width="100%"
        height="100%"
        allowFullScreen
        style={{ opacity: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default EmbedPlayer;
