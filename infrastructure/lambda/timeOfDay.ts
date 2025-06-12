import * as clientTranslate from "@aws-sdk/client-translate";
import * as lambda from "aws-lambda";
import {TranslateRequest, TranslateResponse } from "@translator/shared-types"

// Initialize the AWS Translate client
const translateClient = new clientTranslate.TranslateClient({});

export const index: lambda.APIGatewayProxyHandler = async function (
    event: lambda.APIGatewayProxyEvent
) {
    try {
        if (!event.body){
            throw new Error("body is empty.")
        };
        const body = JSON.parse(event.body) as TranslateRequest; // the translate object that comes in into the lambda
        const { sourceLang, targetLang, sourceText } = body;

        // Get current time in human-readable format
        const now = new Date(Date.now()).toString();

        // Create translation command
        const translateCmd = new clientTranslate.TranslateTextCommand({
            SourceLanguageCode: sourceLang,
            TargetLanguageCode: targetLang,
            Text: sourceText,
        });

        // Send the command and wait for response
        const result = await translateClient.send(translateCmd);

        if(!result.TranslatedText) {
            throw new Error("translation is empty");
        };

        const rtnData: TranslateResponse = {
            timestamp: now,
            targetText: result.TranslatedText,
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // allows requests from any origin
                "Access-Control-Allow-Credentials": true, // required for cookies, authorization headers, etc.
                "Access-Control-Allow-Headers": "*", // allows all standard and custom headers
                "Access-Control-Allow-Methods": "*", // allows all standard and custom headers
            },
            body: JSON.stringify(rtnData),
        };
    } catch (e: any) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "*",
            },
            body: JSON.stringify(e.toString()),
        }
    };
};
