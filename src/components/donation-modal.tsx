import React, { useEffect, useState } from "react";

const DonationModal: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState("");
  const expiryDate = new Date("2025-09-27T23:59:59");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiryDate.getTime() - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft("Expired");
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (distance % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 md:p-8 bg-black/70 rounded-2xl shadow-lg text-gray-200">
      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-4">Alive!</h1>

      {/* Main Donation Message */}
      <p className="text-sm sm:text-base leading-relaxed mb-4 text-center">
        As a student, I've poured my passion into creating{" "}
        <span className="font-semibold">StreamVerse</span> for you. To keep it
        running smoothly, add new features, and cover essential costs, I rely on
        the generosity of our community.
      </p>

      <p className="text-sm sm:text-base leading-relaxed mb-6 text-center">
        Your support, no matter the amount, is vital for the future of{" "}
        <span className="font-semibold">StreamVerse</span>. Please consider a
        contribution if you find value in what we offer. Thank you for helping
        out!
      </p>

      {/* Domain Expiry Warning */}
      <div className="bg-yellow-900/40 border border-yellow-400 text-yellow-200 rounded-lg p-3 sm:p-4 text-center mb-6">
        <p className="font-medium">⚠ The domain is going to expire soon.</p>
        <p className="text-xs sm:text-sm mt-1">
          Please bookmark{" "}
          <a
            href="https://streamverse-vit.netlify.app/home"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            streamverse-vit.netlify.app/home
          </a>{" "}
          and{" "}
          <a
            href="https://streamverse-vit.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            streamverse-vit.vercel.app
          </a>
          .
        </p>
        <p className="text-sm font-semibold mt-2">
          Countdown to Expiry: {timeLeft}
        </p>
      </div>

      {/* Donation Info */}
      <p className="text-xs sm:text-sm text-center mb-2">Donate via UPI:</p>
      <div className="bg-gray-800 text-white rounded-md text-center py-2 px-4 break-all text-xs sm:text-sm">
        anuraagsingh10a@okicici
      </div>
    </div>
  );
};

export default DonationModal;
