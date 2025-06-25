"use client";

import { useTranslate } from "@/hooks";
import { TranslateCard, TranslateRequestForm, useApp } from "@/components";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Home() {
  const { isLoading, translations, deleteTranslation, isDeleting } =
    useTranslate();

  const { selectedTranslation, setSelectedTranslation } = useApp();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <main className="flex flex-col h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <div className="flex flex-col bg-gray-900  w-full h-full space-y-2 p-2">
            {translations.map((item) => (
              <TranslateCard
                translateItem={item}
                isSelected={item.requestId === selectedTranslation?.requestId}
                onSelected={setSelectedTranslation}
                key={item.requestId}
              />
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
