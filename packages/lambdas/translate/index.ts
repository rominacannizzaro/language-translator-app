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
  TranslateResult,
} from "@translator/shared-types";

const {
  TRANSLATION_TABLE_NAME,
  TRANSLATION_PARTITION_KEY,
  TRANSLATION_SORT_KEY,
} = process.env;

if (!TRANSLATION_TABLE_NAME) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_TABLE_NAME");
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_PARTITION_KEY");
}

if (!TRANSLATION_SORT_KEY) {
  throw new exception.MissingEnvironmentVariable("TRANSLATION_SORT_KEY");
}

// Create instance of TranslationTable
const translateTable = new TranslationTable({
  tableName: TRANSLATION_TABLE_NAME,
  partitionKey: TRANSLATION_PARTITION_KEY,
  sortKey: TRANSLATION_SORT_KEY,
});

const getUsername = (event: lambda.APIGatewayProxyEvent) => {
  const claims = event.requestContext.authorizer?.claims;
  if (!claims) {
    throw new Error("User not authenticated.");
  }

  const username = claims["cognito:username"];
  if (!username) {
    throw new Error("Username does not exist.");
  }

  return username;
};

// Lambda handler for public translation requests without requiring user authentication
export const publicTranslate: lambda.APIGatewayProxyHandler = async function (
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

    return gateway.createSuccessJsonResponse(rtnData);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e);
  }
};

export const userTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    const username = getUsername(event);
    console.log({ username });

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
    const tableObj: TranslateResult = {
      requestId: context.awsRequestId, // requestId is the primary key. It must be unique per translation request. context.awsRequestId provides a unique id per lambda call.
      username,
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
export const getUserTranslations: lambda.APIGatewayProxyHandler =
  async function (event: lambda.APIGatewayProxyEvent, context: lambda.Context) {
    try {
      const username = getUsername(event);
      console.log({ username });

      const rtnData = await translateTable.query({ username }); // Queries the table using username as the partition key and fetches translations for that username

      return gateway.createSuccessJsonResponse(rtnData);
    } catch (e: any) {
      return gateway.createErrorJsonResponse(e);
    }
  };

// Lambda handler to delete a user's translation
export const deleteUserTranslation: lambda.APIGatewayProxyHandler =
  async function (event: lambda.APIGatewayProxyEvent, context: lambda.Context) {
    try {
      const username = getUsername(event);
      console.log({ username });

      if (!event.body) {
        throw new exception.MissingBodyData();
      }

      const body = JSON.parse(event.body) as { requestId: string };
      if (!body.requestId) {
        throw new exception.MissingParameters("requestId");
      }

      let requestId = body.requestId;

      const rtnData = await translateTable.delete({ username, requestId }); // Delete using username and requestId as parameters

      return gateway.createSuccessJsonResponse(rtnData);
    } catch (e: any) {
      return gateway.createErrorJsonResponse(e);
    }
  };
