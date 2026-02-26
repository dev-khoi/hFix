"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

function ChatContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
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

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">
          Chat {selectedItem.id.slice(0, 8)}
        </h1>
        <p className="text-sm text-gray-500">
          {new Date(selectedItem.createdAt).toLocaleString()}
        </p>
      </div>

      {selectedItem.imageUrl && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <img
            src={selectedItem.imageUrl}
            alt="Uploaded image"
            className="w-full max-w-2xl h-auto"
          />
        </div>
      )}

      {analysis && (
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Analysis</h3>
          <p className="whitespace-pre-wrap text-sm">{analysis}</p>
        </div>
      )}

      <details className="rounded-lg border border-gray-200 p-4">
        <summary className="cursor-pointer font-semibold">Raw Data</summary>
        <pre className="mt-2 text-xs overflow-auto">
          {JSON.stringify(selectedItem, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
