'use client';

import { useState } from "react";

// API Gateway URL (add the actual URL below)
const URL="https://your-api-id.execute-api.region.amazonaws.com/prod"

// Function to make HTTP call to our server, make a translation request and receive it
export const translateText = async ({
  inputLang,
  outputLang,
  inputText
} : { 
  inputLang: string;
  outputLang: string;
  inputText: string;
}) => {
  return fetch(URL, { 
    method: "POST",
    body: JSON.stringify(
      {
        sourceLang: inputLang,
        targetLang: outputLang,
        text: inputText
      }
    )
  })
  .then(result => result.json())
  .catch(e => e.toString());
}

export default function Home() {
  const [ inputText, setInputText ] = useState<string>("")
  const [ inputLang, setInputLang ] = useState<string>("")
  const [ outputLang, setOutputLang ] = useState<string>("")
  const [ outputText, setOutputText ] = useState<any>(null)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form onSubmit={async (event) => {
        event.preventDefault();
        // console.log({inputText, inputLang, outputLang});
        const result = await translateText({inputText, inputLang, outputLang});
        setOutputText(result);
      }}>
        <div>
          <label htmlFor="inputText">Input text</label>
          <textarea id="inputText" className="bg-white" value={inputText} onChange={event => setInputText(event.target.value)} />
        </div>

        <div>
          <label htmlFor="inputLang">Input language</label>
          <textarea id="inputLang" className="bg-white" value={inputLang} onChange={event => setInputLang(event.target.value)} />
        </div>

        <div>
          <label htmlFor="outputLang">Output language</label>
          <textarea id="outputLang" className="bg-white" value={outputLang} onChange={event => setOutputLang(event.target.value)} />
        </div>

        <button className="btn bg-blue-500 p-2 mt-2 rounded-xl" type="submit">Translate</button>
      </form>
      <pre className="whitespace-pre-wrap w-full">{JSON.stringify(outputText)}</pre>
    </main>
  );
}
