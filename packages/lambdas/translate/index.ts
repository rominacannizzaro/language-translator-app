import * as clientTranslate from "@aws-sdk/client-translate";
import * as dynamodb from "@aws-sdk/client-dynamodb";
import * as lambda from "aws-lambda";
import {
  TranslateRequest,
  TranslateResponse,
  TranslateDbObject,
} from "@translator/shared-types";

const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;
console.log(
  "TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY",
  TRANSLATION_TABLE_NAME,
  TRANSLATION_PARTITION_KEY
);

if (!TRANSLATION_TABLE_NAME) {
  throw new Error("TRANSLATION_TABLE_NAME is empty");
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new Error("TRANSLATION_PARTITION_KEY is empty");
}

// Initialize the AWS Translate client
const translateClient = new clientTranslate.TranslateClient({});

// Initialize the DynamoDB service client
const dynamodbClient = new dynamodb.DynamoDBClient({});

export const index: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new Error("body is missing.");
    }
    console.log(event.body);

    const body = JSON.parse(event.body) as TranslateRequest; // the translate object that comes in into the lambda

    if (!body.sourceLang) {
      throw new Error("sourceLang is missing");
    }
    if (!body.targetLang) {
      throw new Error("targetLang is missing");
    }
    if (!body.sourceText) {
      throw new Error("sourceText is missing");
    }

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

    if (!result.TranslatedText) {
      throw new Error("translation is empty");
    }

    // Object for the response
    const rtnData: TranslateResponse = {
      timestamp: now,
      targetText: result.TranslatedText,
    };

    // Prepare to store the translation into the translation table
    // tableObj is the object stored to the database
    const tableObj: TranslateDbObject = {
      requestId: context.awsRequestId, // requestId is the primary key. It must be unique per translation request. context.awsRequestId provides a unique id per lambda call.
      ...body,
      ...rtnData,
    };

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
    };
  }
};
