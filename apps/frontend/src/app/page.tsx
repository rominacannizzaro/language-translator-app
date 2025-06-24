"use client";

import { useTranslate } from "@/hooks";
import { TranslateRequestForm } from "@/components";
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
          <div className="flex flex-col bg-gray-900  w-full h-full space-y-1 p-1">
            {translations.map((item) => (
              <div
                className="flex flex-row justify-between p-1 space-x-1 bg-slate-400"
                key={item.requestId}
              >
                <p>
                  {item.sourceLang} / {item.sourceText}
                </p>
                <p>
                  {item.targetLang} / {item.targetText}
                </p>
                <button
                  className="btn p-1 bg-red-500 hover:bg-red-300 rounded-md"
                  type="button"
                  onClick={async () => {
                    deleteTranslation(item);
                  }}
                >
                  {isDeleting ? "..." : "X"}
                </button>
              </div>
            ))}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <TranslateRequestForm />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
