# `@bluebeela/nextjs-shopify-auth`

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Authenticate your [Next.js](https://nextjs.org/) app with [Shopify](https://www.shopify.com/).

Sister module to [`@shopify/shopify-express`](https://www.npmjs.com/package/@shopify/shopify-express) and [`@shopify/koa-shopify-auth`](https://www.npmjs.com/package/@shopify/koa-shopify-auth), but for nextjs.

### Missing features
- Registering webhook
- Listening to webhook

A example app without the webhook for the [Build a Shopify app with Node and React](https://developers.shopify.com/tutorials/build-a-shopify-app-with-node-and-react) tutorial is available [here](https://github.com/bluebeel/nextjs-shopify)



## Installation

```bash
$ npm install @bluebeela/nextjs-shopify-auth
```

## Usage

This package exposes `createShopifyAuth` by default, `authenticateShopifyPage`, `authenticateShopifyAPI`, and `NextShopifyApiRequest`, as a named export.

```js
import createShopifyAuth, {authenticateShopifyPage, authenticateShopifyAPI, NextShopifyApiRequest} from '@bluebeela/nextjs-shopify-auth';
```

### createShopifyAuth

Returns a set of helpers that you will need to use in 4 different routes explained below.

```js
const shopifyAuthOptions = {
  // your shopify app api key
  apiKey: process.env.SHOPIFY_API_KEY,
  // your shopify app secret
  secret: process.env.SHOPIFY_API_SECRET,
  // your app url
  appUrl: process.env.HOST,
  // if specified, mounts the routes off of the given path
  // eg. /api/shopify/auth, /api/shopify/auth/callback
  // defaults to ""
  prefix: "/api/shopify",
  // scopes to request on the merchants store
  scopes: ["read_products", "write_products"],
  // set access mode, default is "online"
  accessMode: "online",
  // callback for when auth is completed
  async afterAuth({
    shopOrigin,
    shopifyToken,
    shopifyAssociatedUser,
    req,
    res,
  }) {
    console.log(
      `We're authenticated on shop ${shopOrigin}: ${shopifyToken} with user ${JSON.stringify(
        shopifyAssociatedUser
      )}`
    );
    res.writeHead(302, { Location: `/` });
    res.end();
  },
};

const shopify = createShopifyAuth(shopifyAuthOptions);
```

#### in pages/api/example-api-route-you-want-to-protect.js
Simply add the authenticateShopifyAPI middleware to your route to verify that the request is secure.

```js
import { authenticateShopifyAPI } from "@bluebeela/nextjs-shopify-auth";

export default authenticateShopifyAPI(async function helloWorld(req, res) {
  return await res.json({ hello: "world" });
});
```

#### in pages/protected-page.js
Simply add the authenticateShopifyPage middleware to your route to verify that the request is secure.

```js
// random page
import { authenticateShopifyPage } from "@bluebeela/nextjs-shopify-auth";

export const getServerSideProps = authenticateShopifyPage(async (ctx) => {
  return { props: { hello: "world"}}
});
```

### Required API routes

In a Next.js app, you will need to create these 5 routes:
 - /api/shopify/auth/callback
 - /api/shopify/auth/enable_cookies
 - /api/shopify/auth/index
 - /api/shopify/auth/inline
 - /api/shopify/verify-token

Theses files will need the following content for the authentication and verification processes to work as expected

#### /api/shopify/auth/callback

```js
import shopify from "../../../../lib/shopify"; // lib is on the root dir

export default async function shopifyAuthCallback(req, res) {
	const { oAuthCallback } = shopify;

	await oAuthCallback(req, res);
}
```

#### /api/shopify/auth/enable-cookies

```js
import shopify from "../../../../lib/shopify"; // lib is on the root dir

export default async function shopifyAuthEnableCookies(req, res) {
	const { enableCookies } = shopify;

	await enableCookies(req, res);
}
```

#### /api/shopify/auth/index

```js
import {
  hasCookieAccess,
  shouldPerformInlineOAuth,
  grantedStorageAccess,
} from "@bluebeela/nextjs-shopify-auth";
import shopify from "../../../../lib/shopify"; // lib is on the root dir

export default async function shopifyAuthIndex(req, res) {
  const {
    enableCookiesRedirect,
    oAuthStart,
    topLevelOAuthRedirect,
    requestStorageAccess,
  } = shopify;

  if (!hasCookieAccess(req.cookies)) {
    await enableCookiesRedirect(req, res);
    return;
  }

  if (!grantedStorageAccess(req.cookies)) {
    await requestStorageAccess(req, res);
    return;
  }

  if (shouldPerformInlineOAuth(req.cookies)) {
    await oAuthStart(req, res);
    return;
  }

  await topLevelOAuthRedirect(req, res);
}

```

#### /api/shopify/auth/inline

```js
import shopify from "../../../../lib/shopify"; // lib is on the root dir

export default async function shopifyAuthInline(req, res) {
  const { oAuthStart } = shopify;

  await oAuthStart(req, res);
}

```

#### /api/shopify/verify-token

This is a simple proxy route to avoid CORS issues we would face by hitting Shopify API from a different domain

```js
export default async function verifyToken(req, res) {
  const { shopOrigin, shopifyToken } = req.cookies;

  const response = await fetch(
      `https://${shopOrigin}/admin/metafields.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": shopifyToken,
        },
      },
  );
  res.status(response.status).end();
}
```
