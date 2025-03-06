import SiteFooter from '@/components/main/site-footer';
import SiteHeader from '@/components/main/site-header';
import ShowModal from '@/components/shows-modal';

const FrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <ShowModal />
    </div>
  );
};

export default FrontLayout;
