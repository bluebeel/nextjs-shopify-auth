import type { NextApiRequest, NextApiResponse } from 'next'

import {OAuthStartOptions} from '../types';

import ShopifyError, { ErrorResponse } from "./errors";
import oAuthQueryString from './oauth-query-string';
import { DEFAULT_ACCESS_MODE, DEFAULT_MYSHOPIFY_DOMAIN, TOP_LEVEL_OAUTH_COOKIE_NAME } from "./index";
import {setCookie} from "../helpers/cookies";

export default function createOAuthStart(
  options: OAuthStartOptions,
  callbackPath: string,
) {
  return function oAuthStart(req: NextApiRequest,res: NextApiResponse) {
    const config: OAuthStartOptions = {
      myShopifyDomain: DEFAULT_MYSHOPIFY_DOMAIN,
      accessMode: DEFAULT_ACCESS_MODE,
      prefix: "",
      scopes: [],
      ...options,
    };
    const { myShopifyDomain } = config;
    const query = req.query as Record<string, string>;
    const {shop} = query;

    const shopRegex = new RegExp(
      `^[a-z0-9][a-z0-9\\-]*[a-z0-9]\\.${myShopifyDomain}$`,
      'i',
    );

    if (shop == null || !shopRegex.test(shop)) {
      const error: ErrorResponse = {
        errorMessage: ShopifyError.ShopParamMissing,
        shopOrigin: shop,
      };
      res.status(400).send(error);
      return;
    }

    setCookie({res,name: TOP_LEVEL_OAUTH_COOKIE_NAME, value: ''});


    const formattedQueryString = oAuthQueryString(req, res, options, callbackPath);

    res.redirect(
      `https://${shop}/admin/oauth/authorize?${formattedQueryString}`,
    );
  };
}
