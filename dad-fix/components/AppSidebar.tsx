"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { get } from "aws-amplify/api";
import { useRefresh } from "./RefreshContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";

type RecordItem = {
  id: string;
  createdAt: string;
  imageKey: string;
  analysisKey: string;
  imageUrl?: string;
  analysisUrl?: string;
  userId?: string | null;
};

export function AppSidebar() {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { selectedId } = useParams<{ selectedId: string }>();
  const { refreshTrigger } = useRefresh();

  useEffect(() => {
    async function fetchRecords() {
      try {
        const response = await get({
          apiName: "myExistingApi",
          path: "/records",
        }).response;

        const data = (await response.body.json()) as RecordItem[];
        const sortedData = Array.isArray(data)
          ? data.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
          : [];
        setItems(sortedData);
      } catch (err) {
        console.error("Failed to load records:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecords();
  }, [refreshTrigger]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime() + 7000;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat History</h2>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          {isLoading ? (
            <div className="p-4 text-sm text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No chats yet</div>
          ) : (
            <div className="space-y-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/chat/${item.id}`)}
                  className={[
                    "w-full text-left px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-gray-100 group flex items-start gap-2",
                    selectedId === item.id ? "bg-gray-100" : "",
                  ].join(" ")}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      Chat {item.id.slice(0, 8)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <button
          onClick={() => router.push("/chat")}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          New Chat
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
