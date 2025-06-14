import * as lambda from "aws-lambda";

const createGatewayResponse = ({
  statusCode,
  body,
}: {
  statusCode: number;
  body: string;
}): lambda.APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*", // allows requests from any origin
      "Access-Control-Allow-Credentials": true, // required for cookies, authorization headers, etc.
      "Access-Control-Allow-Headers": "*", // allows all standard and custom headers
      "Access-Control-Allow-Methods": "*", // allows all standard and custom headers
    },
    body,
  };
};

export const createSuccessJsonResponse = (body: object) => {
  return createGatewayResponse({
    statusCode: 200,
    body: JSON.stringify(body),
  });
};

export const createErrorJsonResponse = (body: object) => {
  return createGatewayResponse({
    statusCode: 500,
    body: JSON.stringify(body),
  });
};
