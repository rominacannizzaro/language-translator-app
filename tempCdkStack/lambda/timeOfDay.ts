import * as clientTranslate from "@aws-sdk/client-translate";
import * as lambda from "aws-lambda";

// Initialize the AWS Translate client
const translateClient = new clientTranslate.TranslateClient({});

export const index: lambda.APIGatewayProxyHandler = async function (
    event: lambda.APIGatewayProxyEvent
) {
    try {
        if (!event.body){
            throw new Error("body is empty.")
        };

        const body = JSON.parse(event.body);
        const { sourceLang, targetLang, text } = body;

        // Get current time in human-readable format
        const now = new Date(Date.now()).toString();
        console.log(now);

        // Create translation command
        const translateCmd = new clientTranslate.TranslateTextCommand({
            SourceLanguageCode: sourceLang,
            TargetLanguageCode: targetLang,
            Text: text,
        });

        // Send the command and wait for response
        const result = await translateClient.send(translateCmd);
        console.log(result);

        const rtnData = {
            timestamp: now,
            text: result.TranslatedText,
        }

        return {
            statusCode: 200,
            body: JSON.stringify(rtnData),
        };
    } catch (e: any) {
        console.log(e);
        return {
            statusCode: 500,
            body: e.toString(),
        }
    };
};
