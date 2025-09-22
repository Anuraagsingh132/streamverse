'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons'; // Assuming you have X, Copy, and Check icons here
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
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
      setTimeout(() => setShowCopyToast(false), 3000); // Hide toast after 3 seconds
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
      }, 300); // Corresponds to the transition duration
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
      document.body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isRendered]);

  if (!isRendered) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/50 backdrop-blur-sm', // Enhanced backdrop for better focus
        'transition-opacity duration-300 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl', // Increased max-width, padding and softer corners
          'dark:bg-gray-900 dark:border dark:border-gray-700',
          'transition-all duration-300 ease-in-out',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Notification */}
        <div
          className={cn(
            'absolute top-5 left-1/2 -translate-x-1/2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900/50 dark:text-green-300',
            'transition-all duration-300 ease-in-out',
            showCopyToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          )}
        >
          UPI ID Copied to Clipboard!
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 h-8 w-8 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          onClick={onClose}
          aria-label="Close donation appeal"
        >
          <Icons.close className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center text-center space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center space-y-2">
            <Icons.logo className="h-8 w-auto text-gray-400" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">
              Support StreamVerse's Future
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 max-w-md">
              As a solo student developer, your support helps cover server costs, domain renewals, and the development of new features.
            </p>
          </div>

          {/* Domain Expiry Warning */}
          <div className="w-full rounded-lg border border-yellow-400/50 bg-yellow-50 dark:bg-yellow-900/30 p-4 text-sm text-yellow-800 dark:text-yellow-300 text-left">
            <p className="font-semibold mb-2">⚠️ Heads up! Our domain is expiring soon.</p>
            <p className="mb-2">Please bookmark these links until we secure a new domain:</p>
            <div className="flex flex-col space-y-1">
              <a href="https://streamverse-vit.netlify.app" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                streamverse-vit.netlify.app
              </a>
              <a href="https://streamverse-vit.vercel.app" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                streamverse-vit.vercel.app
              </a>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Domain Expires In
            </p>
            <p className="text-4xl font-bold text-red-500 dark:text-red-400 mt-1">
              5d : 11h : 44m : 57s
            </p>
          </div>

          <p className="text-base text-gray-500 dark:text-gray-400">
            Every contribution makes a difference. Thank you for your support!
          </p>

          {/* UPI Section */}
          <div className="w-full space-y-3 text-center pt-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Donate via UPI:
            </p>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                <input
                  type="text"
                  value={upiId}
                  readOnly
                  className="w-full select-all rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 text-center font-mono text-lg font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 break-words pr-12"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-500 hover:text-primary dark:text-gray-400"
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
          </div>

          {/* Continue Button */}
          <Button
            onClick={onClose}
            className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-colors"
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
