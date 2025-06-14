import * as clientTranslate from "@aws-sdk/client-translate";
import { TranslateRequest } from "@translator/shared-types";

export async function getTranslation({
  sourceLang,
  targetLang,
  sourceText,
}: TranslateRequest) {
  // Initialize the AWS Translate client
  const translateClient = new clientTranslate.TranslateClient({});

  // Create translation command
  const translateCommand = new clientTranslate.TranslateTextCommand({
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang,
    Text: sourceText,
  });

  // Send the command and wait for response
  const result = await translateClient.send(translateCommand);

  return result;
}
