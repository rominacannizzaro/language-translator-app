"use client";

import { useTranslate } from "@/hooks";
import { TranslateCard, TranslateRequestForm } from "@/components";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Home() {
  const { isLoading, translations, deleteTranslation, isDeleting } =
    useTranslate();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <main className="flex flex-col h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <div className="flex flex-col bg-gray-900  w-full h-full space-y-2 p-2">
            {translations.map((item) => (
              <TranslateCard key={item.requestId} translateItem={item} />
            ))}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <div className="p-4">
            <TranslateRequestForm />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
