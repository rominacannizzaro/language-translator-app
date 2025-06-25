"use client";

import { useTranslate } from "@/hooks";
import { TranslateCard, TranslateRequestForm, useApp } from "@/components";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { createRef, useEffect } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { LoadingPage } from "@/components/ui/loading";

export default function Home() {
  const { isLoading, translations } = useTranslate();
  const { user, selectedTranslation, setSelectedTranslation } = useApp();
  const leftPanelRef = createRef<ImperativePanelHandle>();

  useEffect(() => {
    // If leftPanelRef has not mounted yet, ignore this call and exit
    if (!leftPanelRef.current) {
      return;
    }

    // If there is a user logged in, expand the left panel. Else, collapse it.
    if (user) {
      leftPanelRef.current?.expand();
    } else {
      leftPanelRef.current?.collapse();
    }
  }, [user]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <main className="flex flex-col h-screen">
      <ResizablePanelGroup direction="horizontal">
        {/* Left panel displaying translation history */}
        <ResizablePanel collapsible ref={leftPanelRef}>
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
