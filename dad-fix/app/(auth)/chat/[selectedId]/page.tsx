"use client";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import PictureUpload from "@/components/pictureUpload/pictureUpload";
import { VoiceChat } from "@/components/VoiceChat";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Chat</h2>
          <p>Select a chat from the sidebar or start a new one</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Record not found</p>
      </div>
    );
  }
  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">image analysis not found</p>
      </div>
    );
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="app-container">
          <header className="app-header">
            <div className="app-brand">
              <h1>Nova Sonic 2</h1>
              <span className="app-subtitle">AI Voice Assistant</span>
            </div>
            <div className="user-info">
              <span>{user?.signInDetails?.loginId}</span>
              <button onClick={signOut} className="sign-out-btn">
                Sign out
              </button>
            </div>
          </header>
          <main className="app-main">
            <PictureUpload />
            <VoiceChat context={analysis} />
          </main>
        </div>
      )}
    </Authenticator>
  );
}

export default Home;
