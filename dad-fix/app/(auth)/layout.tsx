import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          {/* Sidebar */}
          <AppSidebar />

          {/* Main content area */}
          <div className="flex flex-col flex-1">
            <SidebarTrigger />

            {/* Page content */}
            <main className="flex-1 w-full">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
