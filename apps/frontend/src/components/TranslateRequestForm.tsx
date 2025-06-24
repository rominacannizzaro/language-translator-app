import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslate } from "@/hooks";
import { TranslateRequest } from "@translator/shared-types";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

export const TranslateRequestForm = () => {
  const { translate, isTranslating } = useTranslate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TranslateRequest>();

  const onSubmit: SubmitHandler<TranslateRequest> = (data, event) => {
    event && event.preventDefault();
    translate(data);
  };

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="sourceText">Input text</Label>
        <Textarea
          id="sourceText"
          className="bg-white"
          {...register("sourceText", { required: true })}
        />
        {errors.sourceText && <span>Field is required</span>}
      </div>

      <div className="my-1">
        <Label htmlFor="sourceLang">Input language</Label>
        <Input
          id="sourceLang"
          className="bg-white"
          {...register("sourceLang", { required: true })}
        />
        {errors.sourceLang && <span>Field is required</span>}
      </div>

      <div className="my-1">
        <Label htmlFor="targetLang">Output language</Label>
        <Input
          id="targetLang"
          className="bg-white"
          {...register("targetLang", { required: true })}
        />
        {errors.targetLang && <span>Field is required</span>}
      </div>

      <Button className="font-bold" type="submit">
        {isTranslating ? "Translating..." : "Translate"}
      </Button>
    </form>
  );
};
