import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1 pb-20 lg:pb-0 lg:pl-56">{children}</main>
      <BottomNav />
    </>
  );
}
