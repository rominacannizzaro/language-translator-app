"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TranslateResult } from "@translator/shared-types";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const TranslateCard = ({
  translateItem,
}: {
  translateItem: TranslateResult;
}) => {
  const router = useRouter();

  return (
    <Card
      className={cn(
        "flex flex-row items-center justify-between px-4 py-2 space-x-1 border-0",
        "bg-gray-50 hover:bg-blue-200 cursor-pointer"
      )}
    >
      <div className={cn("flex flex-col text-gray-900")}>
        <div className="flex flex-row text-base font-semibold">
          <p>{translateItem.sourceLang}</p>
          <ArrowRight />
          <p>{translateItem.targetLang}</p>
        </div>
        <p>{translateItem.sourceText}</p>
        <p>{translateItem.requestId}</p>
      </div>

      {/* <button
            className="btn p-1 bg-red-500 hover:bg-red-300 rounded-md"
            type="button"
            onClick={async () => {
              deleteTranslation(translateItem);
            }}
          >
            {isDeleting ? "..." : "X"}
          </button> */}
    </Card>
  );
};
