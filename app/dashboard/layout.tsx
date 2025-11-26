import { Navbar } from "@/components/whiteboard/navbar";
import { WhiteboardBackground } from "@/components/whiteboard/whiteboard-background";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center overflow-hidden relative bg-white">
      <Navbar />
      <WhiteboardBackground />
      
      {/* Subtle Grid Pattern - Consistent with Landing Page */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      <main className="flex-1 w-full flex flex-col items-center pt-24 relative z-10">
        {children}
      </main>
    </div>
  );
}
