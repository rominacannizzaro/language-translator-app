import * as clientTranslate from "@aws-sdk/client-translate";

// Initialize the AWS Translate client
const translateClient = new clientTranslate.TranslateClient({});

export async function index () {
    try {
        // Get current time in human-readable format
        const now = new Date(Date.now()).toString();
        console.log(now);

        // Create translation command
        const translateCmd = new clientTranslate.TranslateTextCommand({
            SourceLanguageCode: "en",
            TargetLanguageCode: "es",
            Text: "Hello world! Testing translation",
        });

        // Send the command and wait for response
        const result = await translateClient.send(translateCmd);
        console.log(result);

        return {
            statusCode: 200,
            body: result.TranslatedText,
        };
    } catch (e) {
        console.log(e);
    };
};
