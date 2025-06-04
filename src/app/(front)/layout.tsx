'use client';

import React, { useEffect } from 'react';
import SiteFooter from '@/components/main/site-footer';
import SiteHeader from '@/components/main/site-header';
import DonationModal from '@/components/donation-modal';
import { useDonationModalStore } from '@/stores/useDonationModalStore';
import { cn } from '@/lib/utils';
import {
  getDonationAppealSeen,
  setDonationAppealSeen,
} from '@/lib/localStorageUtils';

const FrontLayout = ({ children }: { children: React.ReactNode }) => {
  const { isDonationModalOpen, openDonationModal, closeDonationModal } = useDonationModalStore();
  const upiIdFromEnv = process.env.NEXT_PUBLIC_UPI_ID || 'your-default-upi-id@example'; // Fallback UPI ID

  useEffect(() => {
    // Always open the donation modal on component mount
    openDonationModal();
  }, [openDonationModal]);

  const handleCloseModal = () => {
    closeDonationModal();
    setDonationAppealSeen(true);
  };
  return (
    <>
      <DonationModal isOpen={isDonationModalOpen} onClose={handleCloseModal} upiId={upiIdFromEnv} />
      <div className={cn('min-h-screen flex flex-col', {
        'blur-sm brightness-75 transition-all duration-300 ease-in-out': isDonationModalOpen,
      })}>
      <SiteHeader />
      <main className="flex-grow">{children}</main>
      <SiteFooter />
    </div>
    </>
  );
};

export default FrontLayout;
