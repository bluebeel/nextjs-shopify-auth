import nookies from "nookies";
import { IncomingMessage, ServerResponse } from "http";

type BaseParams = {
  req?: IncomingMessage | null;
  res?: ServerResponse | null;
  name: string;
};

function buildContext({ req, res }: Pick<BaseParams, "req" | "res">) {
  if (req !== null && req !== undefined) {
    return { req };
  }

  if (res !== null && res !== undefined) {
    return { res };
  }

  return null;
}

type Options = {
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: true | false | "lax" | "strict" | "none";
  path?: string;
};

const defaultOptions: Options = {
  secure: true,
  httpOnly: false,
  sameSite: "none",
  path: "/"
};

type SetCookieParams = BaseParams & {
  value: string;
  options?: Options;
};

export function setCookie(params: SetCookieParams) {
  const { res, name, value } = params;
  const context = buildContext({ res });
  const options = Object.assign({}, defaultOptions, params.options);

  return nookies.set(context, name, value, options);
}

type DestroyCookieParams = BaseParams & {
  options?: Options;
};

export function destroyCookie(params: DestroyCookieParams) {
  const { res, name } = params;
  const context = buildContext({ res });
  const options = Object.assign({}, defaultOptions, params.options);

  return nookies.destroy(context, name, options);
}
