"use client";

import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslate } from "@/hooks";
import { TranslateRequest } from "@translator/shared-types";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useApp } from "./AppProvider";

export const TranslateRequestForm = () => {
  const { translate, isTranslating } = useTranslate();
  const { selectedTranslation } = useApp();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TranslateRequest>();

  // Whenever the selected translation changes, populate the form fields with its values
  useEffect(() => {
    if (selectedTranslation) {
      setValue("sourceLang", selectedTranslation.sourceLang);
      setValue("sourceText", selectedTranslation.sourceText);
      setValue("targetLang", selectedTranslation.targetLang);
    }
  }, [selectedTranslation]);

  const onSubmit: SubmitHandler<TranslateRequest> = (data, event) => {
    if (event) {
      event.preventDefault();
    }
    translate(data);
  };

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="sourceText">Input text:</Label>
        <Textarea
          id="sourceText"
          className="bg-white"
          {...register("sourceText", { required: true })}
        />
        {errors.sourceText && <span>Field is required</span>}
      </div>

      <div className="my-1">
        <Label htmlFor="sourceLang">Input language:</Label>
        <Input
          id="sourceLang"
          className="bg-white"
          {...register("sourceLang", { required: true })}
        />
        {errors.sourceLang && <span>Field is required</span>}
      </div>

      <div className="my-1">
        <Label htmlFor="targetLang">Output language:</Label>
        <Input
          id="targetLang"
          className="bg-white"
          {...register("targetLang", { required: true })}
        />
        {errors.targetLang && <span>Field is required</span>}
      </div>

      <Button className="font-bold my-5" type="submit">
        {isTranslating ? "Translating..." : "Translate"}
      </Button>

      <div>
        <Label htmlFor="targetText">Translated text:</Label>
        <Textarea
          readOnly
          id="targetText"
          className="bg-white"
          value={selectedTranslation?.targetText}
        />
      </div>
    </form>
  );
};
