"use client";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import PictureUpload from "@/components/pictureUpload/pictureUpload";
import { VoiceChat } from "@/components/VoiceChat";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { get } from "aws-amplify/api";
import Image from "next/image";

type RecordItem = {
  id: string;
  createdAt: string;
  imageKey: string;
  analysisKey: string;
  imageUrl?: string;
  analysisUrl?: string;
  userId?: string | null;
};

function Home() {
  const { selectedId } = useParams<{ selectedId: string }>();
  const [selectedItem, setSelectedItem] = useState<RecordItem | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) {
      setSelectedItem(null);
      setAnalysis(null);
      return;
    }

    async function fetchRecord() {
      setIsLoading(true);
      setError(null);

      try {
        // Use the new /records/{id} endpoint

        const response = await get({
          apiName: "myExistingApi",
          path: `/records/${selectedId}`,
        }).response;

        const item = (await response.body.json()) as RecordItem;
        setSelectedItem(item);

        // Fetch the analysis text if available
        if (item.analysisUrl) {
          const textResponse = await fetch(item.analysisUrl);
          const text = await textResponse.text();
          setAnalysis(text);
        }
        if (item.imageUrl) {
          setImageUrl(item.imageUrl);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load record");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecord();
  }, [selectedId]);

  if (!selectedId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Welcome to Chat
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Select a chat from the sidebar or start a new one
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="space-y-4 text-center">
          <div className="inline-block">
            <div className="h-12 w-12 border-4 border-slate-300 dark:border-slate-700 border-t-orange-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Record not found
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Image analysis not found
        </p>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Image cannot be found
          </p>
        </div>
      </div>
    );
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          {/* Header */}
          <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 backdrop-blur supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-slate-950/75 sticky top-0 z-10 shadow-sm">
            <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col gap-0.5">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Nova Sonic 2
                </h1>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
                  AI Voice Assistant
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
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

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
              {/* Image Section */}
              <section className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Uploaded Image
                </h2>
                {imageUrl && (
                  <div className="relative w-full h-auto rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Uploaded image"
                      className="w-full h-auto object-contain max-h-[60vh]"
                    />
                  </div>
                )}
              </section>

              {/* Voice Chat Section */}
              <section className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Chat with AI Assistant
                </h2>
                <VoiceChat context={analysis} />
              </section>
            </div>
          </main>
        </div>
      )}
    </Authenticator>
  );
}

export default Home;
