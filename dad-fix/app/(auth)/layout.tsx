"use client";

import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticator className="flex flex-col justify-center items-center min-h-screen">
      {({ signOut, user }) => (
        <div className="flex flex-col justify-center items-center min-h-screen w-full  bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <div className="min-h-screen w-full">
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                {/* Sidebar */}
                <AppSidebar />

                {/* Main content area */}
                <div className="flex flex-col flex-1">
                  <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 backdrop-blur supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-slate-950/75 sticky top-0 z-10 shadow-sm">
                    <div className="flex flex-row align-middle justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
                      <div className="flex flex-col gap-0.5">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                          Dad-AI
                        </h1>
                        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
                          AI Voice Assistant
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-3 sm:gap-4">
                        <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:inline">
                          {user?.signInDetails?.loginId}
                        </span>
                        <Button
                          onClick={signOut}
                          variant="outline"
                          size="sm"
                          className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 dark:border-orange-500 dark:text-orange-400">
                          Sign out
                        </Button>
                      </div>
                    </div>
                  </header>

                  {/* side bar trigger */}
                  <SidebarTrigger />

                  {/* Page content */}
                  <main className="flex-1 w-full">{children}</main>
                </div>
              </div>
            </SidebarProvider>
          </div>
        </div>
      )}
    </Authenticator>
  );
}
