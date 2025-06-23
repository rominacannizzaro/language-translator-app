import {
  TranslateRequest,
  TranslateResponse,
  TranslatePrimaryKey,
  TranslateResultList,
  TranslateResult,
} from "@translator/shared-types";
import { fetchAuthSession } from "aws-amplify/auth";

// API Gateway URL (add the actual URL below)
// const URL = "https://your-api-id.execute-api.region.amazonaws.com/prod";

// Available-to-all function to make HTTP call to our server, make a translation request and receive it
export const translatePublicText = async (request: TranslateRequest) => {
  try {
    const result = await fetch(`${URL}/public`, {
      method: "POST",
      body: JSON.stringify(request),
    });

    const rtnValue = (await result.json()) as TranslateResult;
    return rtnValue;
  } catch (e: unknown) {
    console.error(e);
    throw e;
  }
};

export const translateUsersText = async (request: TranslateRequest) => {
  try {
    // Get the logged-in user's ID token from Cognito - required in the Authorization header to authenticate API requests
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

    const result = await fetch(`${URL}/user`, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const rtnValue = (await result.json()) as TranslateResult;
    return rtnValue;
  } catch (e: unknown) {
    console.error(e);
    throw e;
  }
};

export const getUsersTranslations = async () => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    const result = await fetch(`${URL}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const rtnValue = (await result.json()) as TranslateResultList;
    return rtnValue;
  } catch (e: unknown) {
    console.error(e);
    throw e;
  }
};

export const deleteUserTranslation = async (item: TranslatePrimaryKey) => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    const result = await fetch(`${URL}/user`, {
      method: "DELETE",
      body: JSON.stringify(item),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const rtnValue = (await result.json()) as TranslatePrimaryKey;
    return rtnValue;
  } catch (e: unknown) {
    console.error(e);
    throw e;
  }
};
