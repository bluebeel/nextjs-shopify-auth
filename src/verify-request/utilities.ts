import { Routes } from "./types";
import { ServerResponse } from "http";
import { destroyCookie } from "../helpers/cookies";

export function redirectToAuth({
  shop,
  res,
  routes: { fallbackRoute, authRoute }
}: {
  shop?: string;
  res?: ServerResponse;
  routes: Routes;
}) {
  const routeForRedirect = shop ? `${authRoute}?shop=${shop}` : fallbackRoute;
  if (res) {
    res.writeHead(307, { Location: routeForRedirect });
    return res.end();
  }
}

export function clearSession({ res }: { res?: ServerResponse }) {
  destroyCookie({ res, name: "shopSettingsId" });
	destroyCookie({ res, name: "shopOrigin" });
	destroyCookie({ res, name: "shopifyToken" });
}
