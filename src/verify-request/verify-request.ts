import { ServerResponse } from "http";

import {loginAgainIfDifferentShop} from './login-again-if-different-shop';
import {verifyToken} from './verify-token';
import {Options, Routes} from './types';

export default async function verifyRequest({
                                        query,
                                        cookies,
                                        res,
                                        options,
                                      }: {
  query: Record<string, string | string[]>;
  cookies: Record<string, string>;
  res?: ServerResponse;
  options: Options;
}) {
  const routes: Routes = {
    authRoute: options.authRoute ?? "/auth",
    fallbackRoute: options.fallbackRoute ?? "/auth",
  };

  const shopFromQuery = Array.isArray(query.shop) ? query.shop[0] : query.shop;
  console.log("lib", cookies)
  console.log("shop", shopFromQuery)
  if (shopFromQuery && cookies.shopOrigin) {
    if (shopFromQuery !== cookies.shopOrigin) {
      // go through login process if different shops
      return loginAgainIfDifferentShop({ shop: shopFromQuery, res, routes });
    }
  }

  const shopifyToken = cookies.shopifyToken;
  const shopOrigin = shopFromQuery ?? cookies.shopOrigin;

  await verifyToken({ shopOrigin, shopifyToken, res, routes, verifyTokenUrl: options.verifyTokenUrl });

}
