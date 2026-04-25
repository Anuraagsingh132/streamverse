import { siteConfig } from "@/configs/site";
import React, { Suspense } from "react";
import MainNav from "@/components/navigation/main-nav";

const SiteHeader = () => {
  return (
    // <header className="sticky top-0 z-50 border-b bg-background">
    <header className="sticky top-0 z-50">
      <Suspense fallback={<div className="h-12 md:h-16 w-full" />}>
        <MainNav items={siteConfig.mainNav} />
      </Suspense>
      {/* <MobileNav items={siteConfig.mainNav} className="md:hidden" /> */}
    </header>
  );
};

export default SiteHeader;
