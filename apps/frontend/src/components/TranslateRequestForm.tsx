import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslate } from "@/hooks";
import { TranslateRequest } from "@translator/shared-types";

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
    <form className="flex flex-col space y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="sourceText">Input text</label>
        <textarea
          id="sourceText"
          className="bg-white"
          {...register("sourceText", { required: true })}
        />
        {errors.sourceText && <span>Field is required</span>}
      </div>

      <div className="my-1">
        <label htmlFor="sourceLang">Input language</label>
        <input
          id="sourceLang"
          className="bg-white"
          {...register("sourceLang", { required: true })}
        />
        {errors.sourceLang && <span>Field is required</span>}
      </div>

      <div className="my-1">
        <label htmlFor="targetLang">Output language</label>
        <input
          id="targetLang"
          className="bg-white"
          {...register("targetLang", { required: true })}
        />
        {errors.targetLang && <span>Field is required</span>}
      </div>

      <button className="btn bg-blue-500 p-2 mt-2 rounded-xl" type="submit">
        {isTranslating ? "Translating..." : "Translate"}
      </button>
    </form>
  );
};
