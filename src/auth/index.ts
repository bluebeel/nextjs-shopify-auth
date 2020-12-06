import { OAuthStartOptions, AccessMode } from "../types";

import createOAuthStart from "./create-oauth-start";
import createOAuthCallback from "./create-oauth-callback";
import createEnableCookies from "./create-enable-cookies";
import createTopLevelOAuthRedirect from "./create-top-level-oauth-redirect";
import createRequestStorageAccess from "./create-request-storage-access";
import createEnableCookiesRedirect from "./create-enable-cookies-redirect";

export const DEFAULT_MYSHOPIFY_DOMAIN = "myshopify.com";
export const DEFAULT_ACCESS_MODE: AccessMode = "online";

export const TOP_LEVEL_OAUTH_COOKIE_NAME = "shopifyTopLevelOAuth";
export const TEST_COOKIE_NAME = "shopifyTestCookie";
export const GRANTED_STORAGE_ACCESS_COOKIE_NAME =
  "shopify.granted_storage_access";

function hasCookieAccess(cookies: Record<string, string>) {
  return Boolean(cookies[TEST_COOKIE_NAME]);
}

function grantedStorageAccess(cookies: Record<string, string>) {
  return Boolean(cookies[GRANTED_STORAGE_ACCESS_COOKIE_NAME]);
}

function shouldPerformInlineOAuth(cookies: Record<string, string>) {
  return Boolean(cookies[TOP_LEVEL_OAUTH_COOKIE_NAME]);
}

export default function createShopifyAuth(options: OAuthStartOptions) {
  const config = {
    scopes: [],
    prefix: "",
    myShopifyDomain: DEFAULT_MYSHOPIFY_DOMAIN,
    accessMode: DEFAULT_ACCESS_MODE,
    ...options
  };

  return {
    enableCookiesRedirect: createEnableCookiesRedirect(
      config.apiKey,
      `${config.prefix}/auth/enable_cookies`,
      options.appUrl
    ),
    oAuthStart: createOAuthStart(config, `${config.prefix}/auth/callback`),
    topLevelOAuthRedirect: createTopLevelOAuthRedirect(
      config.apiKey,
      `${config.prefix}/auth/inline`,
      options.appUrl
    ),
    oAuthCallback: createOAuthCallback(options),
    enableCookies: createEnableCookies(options),
    requestStorageAccess: createRequestStorageAccess(config)
  };
}

export { default as Error } from "./errors";
export { default as validateHMAC } from "./validate-hmac";
