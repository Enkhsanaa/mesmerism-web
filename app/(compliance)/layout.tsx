import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
