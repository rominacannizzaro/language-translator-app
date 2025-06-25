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

const parseTranslateRequest = (requestString: string) => {
  const request = JSON.parse(requestString) as TranslateRequest; // the translate object that comes in into the lambda

  if (!request.sourceLang) {
    throw new exception.MissingParameters("sourceLang");
  }
  if (!request.targetLang) {
    throw new exception.MissingParameters("targetLang");
  }
  if (!request.sourceText) {
    throw new exception.MissingParameters("sourceText");
  }

  return request;
};

const parseDeleteRequest = (requestString: string) => {
  const request = JSON.parse(requestString) as { requestId: string };
  if (!request.requestId) {
    throw new exception.MissingParameters("requestId");
  }

  return request;
};

const getCurrentTime = () => {
  return Date.now();
};

const formatTime = (time: number) => {
  return new Date(time).toString();
};

// Lambda handler for public translation requests without requiring user authentication
export const publicTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent
) {
  try {
    if (!event.body) {
      throw new exception.MissingBodyData();
    }

    const request = parseTranslateRequest(event.body);
    const nowEpoch = getCurrentTime();
    const targetText = await getTranslation(request); // Wait for translation

    // Object for the response
    const response: TranslateResponse = {
      timestamp: formatTime(nowEpoch),
      targetText,
    };

    const result: TranslateResult = {
      requestId: nowEpoch.toString(),
      username: "",
      ...request,
      ...response,
    };

    return gateway.createSuccessJsonResponse(result);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e.toString);
  }
};

export const userTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent
) {
  try {
    if (!event.body) {
      throw new exception.MissingBodyData();
    }

    const username = getUsername(event);
    const request = parseTranslateRequest(event.body);
    const now = new Date(Date.now()).toString();
    const nowEpoch = getCurrentTime();
    const targetText = await getTranslation(request); // Wait for translation

    // Object for the response
    const response: TranslateResponse = {
      timestamp: formatTime(nowEpoch),
      targetText,
    };

    // Prepare to store the translation into the translation table
    // result is the object stored to the database
    const result: TranslateResult = {
      requestId: nowEpoch.toString(),
      username,
      ...request,
      ...response,
    };

    await translateTable.insert(result);

    return gateway.createSuccessJsonResponse(result);
  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse(e.toString());
  }
};

// Function that returns translations
export const getUserTranslations: lambda.APIGatewayProxyHandler =
  async function (event: lambda.APIGatewayProxyEvent, context: lambda.Context) {
    try {
      const username = getUsername(event);
      const rtnData = await translateTable.query({ username, requestId: "" }); // Queries the table using the full primary key object; requestId is empty to query all translations for the username

      return gateway.createSuccessJsonResponse(rtnData);
    } catch (e: any) {
      return gateway.createErrorJsonResponse(e);
    }
  };

// Lambda handler to delete a user's translation
export const deleteUserTranslation: lambda.APIGatewayProxyHandler =
  async function (event: lambda.APIGatewayProxyEvent, context: lambda.Context) {
    try {
      if (!event.body) {
        throw new exception.MissingBodyData();
      }

      const username = getUsername(event);
      const { requestId } = parseDeleteRequest(event.body);
      const rtnData = await translateTable.delete({ username, requestId }); // Delete using username and requestId as parameters

      return gateway.createSuccessJsonResponse(rtnData);
    } catch (e: any) {
      return gateway.createErrorJsonResponse(e);
    }
  };
