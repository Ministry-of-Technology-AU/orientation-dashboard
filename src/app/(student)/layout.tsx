import { Sidebar } from "@/components/sidebar";
import { TourProvider } from "@/components/guided-tour";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider
      autoStart
      ranOnce
      storageKey="orientation-hub-tour-v1"
    >
    <div className="flex h-screen overflow-hidden">
      {/* Floating collapsed sidebar */}
      <div className="m-3 mr-0 shrink-0">
        <div className="bg-blue-tint/80 backdrop-blur-sm rounded-2xl h-full w-15 flex flex-col">
          <Sidebar />
        </div>
      </div>

      {/* Content fills the rest */}
      <div className="flex flex-1 overflow-hidden min-w-0">
        {children}
      </div>
    </div>
    </TourProvider>
  );
}
