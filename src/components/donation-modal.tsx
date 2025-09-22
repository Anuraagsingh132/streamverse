import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const DonationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [copyText, setCopyText] = useState("Copy");

  // --- Countdown Logic ---
  useEffect(() => {
    const targetDate = new Date("2025-09-27T23:59:59").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft("Expired");
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Copy-to-Clipboard ---
  const handleCopy = () => {
    navigator.clipboard.writeText("anuraagsingh10a@okicici");
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy"), 2000);
  };

  return (
    // --- Backdrop ---
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 px-4"
      onClick={onClose} // Close when clicking backdrop
    >
      {/* --- Modal Content --- */}
      <div
        className="bg-zinc-900 text-white rounded-xl shadow-2xl w-full max-w-md border border-zinc-700/50 relative p-6 sm:p-8 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* --- Close Button --- */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-zinc-700 rounded-full p-1 transition-colors"
        >
          <X size={20} />
        </button>

        {/* --- Header Section --- */}
        <div className="text-center">
          <div className="text-3xl mb-2">💖</div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Support StreamVerse&apos;s Future
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mt-2">
            As a solo student developer, your support helps cover server costs,
            domain renewals, and the development of new features.
          </p>
        </div>

        {/* --- Domain Expiry Warning --- */}
        <div className="bg-yellow-500/10 text-yellow-300 text-sm p-4 rounded-lg border border-yellow-500/30">
          <p className="font-semibold mb-2">⚠️ Heads up! Our domain is expiring soon.</p>
          <p className="text-yellow-400/80 mb-2">Please save our new homes:</p>
          <div className="flex flex-col gap-2">
            <a
              href="https://streamverse-vit.netlify.app/home"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-400 hover:text-blue-300 break-all transition-colors"
            >
              streamverse-vit.netlify.app
            </a>
            <a
              href="https://streamverse-vit.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-400 hover:text-blue-300 break-all transition-colors"
            >
              streamverse-vit.vercel.app
            </a>
          </div>
        </div>

        {/* --- Countdown Timer --- */}
        <div className="text-center bg-zinc-800/50 py-3 px-4 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
            Domain Expires In
          </p>
          <p className="text-2xl font-bold text-yellow-400 tracking-tight mt-1">
            {timeLeft}
          </p>
        </div>

        {/* --- Donation Section --- */}
        <div className="text-center">
          <p className="text-gray-300 text-sm mb-2">
            Every contribution makes a difference. Thank you!
          </p>
          <div className="flex items-center justify-between bg-zinc-800 p-2 rounded-lg">
            <span className="text-gray-200 pl-2 truncate font-mono text-sm">
              anuraagsingh10a@okicici
            </span>
            <button
              onClick={handleCopy}
              className={`ml-3 px-4 py-2 rounded-md text-white text-sm font-semibold transition-all duration-200 ${
                copyText === "Copied!"
                  ? "bg-green-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              style={{ width: "90px" }}
            >
              {copyText}
            </button>
          </div>
        </div>

        {/* --- Continue Button --- */}
        <button
          onClick={onClose}
          className="w-full bg-white/90 text-zinc-900 font-bold py-3 rounded-lg hover:bg-white transition-colors"
        >
          Continue to Website
        </button>
      </div>
    </div>
  );
};

export default DonationModal;
