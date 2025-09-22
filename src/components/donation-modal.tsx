'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons'; // Assuming you have X and Copy icons here
import { cn } from '@/lib/utils';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  upiId: string;
}

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, upiId }) => {
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

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/30 backdrop-blur-sm',
        'transition-opacity duration-300 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-md rounded-lg bg-background p-6 shadow-xl',
          'border border-border',
          'dark:bg-neutral-900 dark:border-neutral-700',
          'transition-all duration-300 ease-in-out',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-4">
          <Icons.logo className="h-6 w-auto text-muted-foreground" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 h-7 w-7 rounded-full z-10"
          onClick={onClose}
          aria-label="Close donation appeal"
        >
          <Icons.close className="h-5 w-5" />
        </Button>

        {showCopyToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-500/30">
            UPI ID Copied to Clipboard!
          </div>
        )}

        <div className="flex flex-col items-center text-center space-y-5 pt-8">
          <h2 className="text-2xl font-semibold text-foreground mt-2">
            Support StreamVerse&apos;s Future
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            As a solo student developer, your support helps cover server costs, domain renewals, and the development of new features.
          </p>

          <div className="w-full rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400 text-left">
            ⚠️ <span className="font-semibold">Heads up!</span> Our domain is expiring soon.
            <br />
            <br />
            Please save our new homes:
            <br />
            <a href="https://streamverse-vit.netlify.app" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline block mt-1">
              streamverse-vit.netlify.app
            </a>
            <a href="https://streamverse-vit.vercel.app" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline block">
              streamverse-vit.vercel.app
            </a>
          </div>

          <p className="text-sm font-medium text-muted-foreground">
            DOMAIN EXPIRES IN
          </p>
          <p className="text-2xl font-bold text-primary">
            5d : 11h : 44m : 57s
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Every contribution makes a difference. Thank you!
          </p>

          <div className="w-full space-y-3 text-center mt-2">
            <p className="text-xs font-medium text-muted-foreground">
              Donate via UPI:
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="relative flex-grow max-w-xs">
                <input
                  type="text"
                  value={upiId}
                  readOnly
                  className="w-full select-all rounded-md border border-border bg-secondary/20 px-3 py-2.5 text-center font-mono text-base font-semibold text-primary dark:bg-neutral-800/40 focus:outline-none focus:ring-1 focus:ring-primary/50 break-all pr-12"
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
                    <Icons.check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Icons.copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {isCopied && !showCopyToast && (
              <p className="text-xs text-green-600 dark:text-green-500">
                Copied to clipboard!
              </p>
            )}
          </div>

          <Button
            onClick={onClose}
            className="w-full mt-6 hover:bg-primary/90 active:bg-primary/80"
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
