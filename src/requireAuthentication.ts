import { GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import verifyRequest from "./verify-request/verify-request";
import type { NextApiRequest, NextApiResponse } from 'next';

// Overwrite ServerResponse to allow `shopOrigin` & `shopHost`
interface GetServerSideShopifyPropsContext extends GetServerSidePropsContext {
  shopOrigin?: string;
  shopHost?: string;
}

export function authenticateShopifyPage(getServerSidePropsFunc?: Function) {
  return async (ctx: GetServerSideShopifyPropsContext) => {
    const authRoute = "/api/shopify/auth";
    const fallbackRoute = "/login";
    const verifyTokenUrl = `${process.env.HOST}/api/shopify/verify-token`;
    const cookies = parseCookies(ctx);
    const shopOrigin = ctx.query.shop ?? cookies.shopOrigin;
    const shopHost = ctx.query.host ?? cookies.shopHost;

    if (ctx.resolvedUrl !== fallbackRoute) {
      await verifyRequest({
        query: ctx.query,
        cookies,
        res: ctx.res,
        options: { authRoute, fallbackRoute, verifyTokenUrl },
      });
    }

    ctx.shopOrigin = shopOrigin as string;
    ctx.shopHost = shopHost as string;

    if (getServerSidePropsFunc) {
      const result = await getServerSidePropsFunc(ctx);

      return {
        props: {
          shopOrigin,
          shopHost,
          ...result.props,
        },
      };
    }
    return { props: { shopOrigin, shopHost } };
  };
}

export type NextShopifyApiRequest = NextApiRequest & {
  shopOrigin?: string;
  shopHost?: string;
  shopifyToken?: string;
  shopifyAssociatedUser?: string;
}

export const authenticateShopifyAPI = (handler: (req: NextShopifyApiRequest, res: NextApiResponse) => Promise<void>) => async (req: NextShopifyApiRequest, res: NextApiResponse) => {
  if (!req) {
    throw new Error('Request is not available');
  }

  if (!res) {
    throw new Error('Response is not available');
  }

  const authRoute = "/api/shopify/auth";
  const fallbackRoute = "/login";
  const verifyTokenUrl = `${process.env.HOST}/api/shopify/verify-token`;
  await verifyRequest({ query: req.query, cookies: req.cookies, res, options: { authRoute, fallbackRoute, verifyTokenUrl } });

  req.shopOrigin = req.cookies.shopOrigin;
  req.shopHost = req.cookies.shopHost;
  req.shopifyToken = req.cookies.shopifyToken;
  req.shopifyAssociatedUser = req.cookies.shopifyAssociatedUser;

  return handler(req, res);
};

