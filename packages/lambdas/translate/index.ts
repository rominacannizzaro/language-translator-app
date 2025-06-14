import * as lambda from "aws-lambda";
import {
  gateway,
  getTranslation,
  exception,
  TranslationTable,
} from "/opt/nodejs/utils-lambda-layer";
import {
  TranslateRequest,
  TranslateResponse,
  TranslateDbObject,
} from "@translator/shared-types";

const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;

if (!TRANSLATION_TABLE_NAME) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_TABLE_NAME");
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_PARTITION_KEY");
}

// Create instance of TranslationTable
const translateTable = new TranslationTable({
  tableName: TRANSLATION_TABLE_NAME,
  partitionKey: TRANSLATION_PARTITION_KEY,
});

export const translate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new exception.MissingBodyData();
    }

    const body = JSON.parse(event.body) as TranslateRequest; // the translate object that comes in into the lambda

    if (!body.sourceLang) {
      throw new exception.MissingParameters("sourceLang");
    }
    if (!body.targetLang) {
      throw new exception.MissingParameters("targetLang");
    }
    if (!body.sourceText) {
      throw new exception.MissingParameters("sourceText");
    }

    // Get current time in human-readable format
    const now = new Date(Date.now()).toString();

    // Wait for translation
    const result = await getTranslation(body);

    if (!result.TranslatedText) {
      throw new exception.MissingParameters("TranslationText");
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

    await translateTable.insert(tableObj);

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
    const rtnData = await translateTable.getAll();
    return gateway.createSuccessJsonResponse(rtnData);
  } catch (e: any) {
    return gateway.createErrorJsonResponse(e);
  }
};
