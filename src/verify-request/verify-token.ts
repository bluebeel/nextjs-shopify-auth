import { Method, Header, StatusCode } from "@shopify/network";
import { ServerResponse } from "http";

import { TEST_COOKIE_NAME, TOP_LEVEL_OAUTH_COOKIE_NAME } from "../auth";

import { Routes } from "./types";
import { redirectToAuth } from "./utilities";
import { destroyCookie, setCookie } from "../helpers/cookies";

export async function verifyToken({
  shopOrigin,
  shopifyToken,
  res,
  routes,
  verifyTokenUrl
}: {
  shopOrigin?: string;
  shopifyToken?: string;
  res?: ServerResponse;
  routes: Routes;
  verifyTokenUrl: string;
}) {
  if (shopOrigin && shopifyToken) {
    destroyCookie({ res, name: TOP_LEVEL_OAUTH_COOKIE_NAME });
    const isServer = typeof res !== "undefined";
    // If a user has installed the store previously on their shop, the accessToken can be stored in session.
    // we need to check if the accessToken is valid, and the only way to do this is by hitting the api.
    const response = isServer
      ? await fetch(`https://${shopOrigin}/admin/metafields.json`, {
          method: Method.Get,
          headers: {
            [Header.ContentType]: "application/json",
            "X-Shopify-Access-Token": shopifyToken
          }
        })
      : await fetch(verifyTokenUrl, {
          method: Method.Get,
          credentials: "include"
        });

    if (response.status === StatusCode.Unauthorized) {
      redirectToAuth({ shop: shopOrigin, res, routes });
      return;
    }

    return;
  }

  setCookie({ res, name: TEST_COOKIE_NAME, value: "1" });

  redirectToAuth({ shop: shopOrigin, res, routes });
}
