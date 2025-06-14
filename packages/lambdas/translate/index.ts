import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import * as lambda from "aws-lambda";
import { gateway, getTranslation } from "/opt/nodejs/utils-lambda-layer";
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

// Initialize the DynamoDB service client
const dynamodbClient = new dynamodb.DynamoDBClient({});

export const translate: lambda.APIGatewayProxyHandler = async function (
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

    // Wait for translation
    const result = await getTranslation(body);

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

    // Put Item Command Input
    const tableInsertCommand: dynamodb.PutItemCommandInput = {
      TableName: TRANSLATION_TABLE_NAME,
      Item: marshall(tableObj), // marshall converts the original 'tableObj' into a format that is suitable to be stored into DynamoDB
    };

    // Execute Put Item Command Input
    await dynamodbClient.send(new dynamodb.PutItemCommand(tableInsertCommand));

    return gateway.createSuccessJsonResponse(rtnData);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e);
  }
};

// Function that returns translations
export const getTranslations: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    // Scan Command Input
    const scanCommand: dynamodb.ScanCommandInput = {
      TableName: TRANSLATION_TABLE_NAME,
    };

    // Execute Scan Command Input
    // This variable is of type dynamo.ScanCommandOutput. The property needed from is 'Items'.
    const { Items } = await dynamodbClient.send(
      new dynamodb.ScanCommand(scanCommand)
    );

    if (!Items) {
      throw new Error("no items found");
    }

    const rtnData = Items.map((item) => unmarshall(item) as TranslateDbObject);
    return gateway.createSuccessJsonResponse(rtnData);
  } catch (e: any) {
    return gateway.createErrorJsonResponse(e);
  }
};
