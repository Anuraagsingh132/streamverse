// src/DonationModal.js (or your component file)

'use client';

import React, 'useState', 'useEffect' from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

// --- PROPS INTERFACE (Unchanged) ---
interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  upiId: string;
}

// --- COMPONENT (UI and Content Improved) ---
const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, upiId }) => {
  // --- STATE AND LOGIC (Unchanged) ---
  const [isCopied, setIsCopied] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setIsCopied(true);
      setShowCopyToast(true);
      setTimeout(() => setIsCopied(false), 2000);
      setTimeout(() => setShowCopyToast(false), 3000);
    } catch (err) {
      console.error('Failed to copy UPI ID: ', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const rafId = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(rafId);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRendered) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isRendered]);

  if (!isRendered) {
    return null;
  }

  // --- JSX (UI and Content Improved) ---
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/60 backdrop-blur-sm',
        'transition-opacity duration-300 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-md rounded-xl bg-background p-6 shadow-2xl',
          'border border-border/50',
          'dark:bg-neutral-900 dark:border-neutral-800',
          'transition-all duration-300 ease-in-out',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 h-8 w-8 rounded-full z-10 text-muted-foreground hover:bg-secondary"
          onClick={onClose}
          aria-label="Close donation appeal"
        >
          <Icons.close className="h-5 w-5" />
        </Button>
        
        {showCopyToast && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 rounded-full bg-green-500/10 px-4 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-500/30 animate-fade-in-down">
            Copied to Clipboard!
          </div>
        )}

        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="p-3 bg-secondary rounded-full">
            <Icons.logo className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground">
            Support StreamVerse's Future
          </h2>

          <div className="text-sm text-muted-foreground leading-relaxed w-full px-2">
            <p className="mb-3">
              StreamVerse is a passion project by a solo student developer. Your contribution directly supports:
            </p>
            <ul className="list-disc list-inside text-left mx-auto max-w-xs space-y-1">
              <li>Server & Hosting Costs</li>
              <li>Domain Renewals</li>
              <li>Future Feature Development</li>
            </ul>
          </div>
          
          {/* Enhanced Donation Section */}
          <div className="w-full space-y-3 text-center bg-secondary/50 dark:bg-neutral-800/40 p-4 rounded-lg border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground tracking-wide">
              SUPPORT WITH A SMALL DONATION
            </p>
            <div className="relative flex-grow">
              <input
                type="text"
                value={upiId}
                readOnly
                className="w-full select-all rounded-md border border-border bg-background/50 px-3 py-2.5 text-center font-mono text-base font-semibold text-primary dark:bg-neutral-900/50 focus:outline-none focus:ring-2 focus:ring-primary/50 break-all pr-12"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary"
                aria-label="Copy UPI ID"
              >
                {isCopied ? (
                  <Icons.check className="h-5 w-5 text-green-500" />
                ) : (
                  <Icons.copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-base mt-2 hover:opacity-90 transition-opacity"
            size="lg"
          >
            Continue to Website
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;

