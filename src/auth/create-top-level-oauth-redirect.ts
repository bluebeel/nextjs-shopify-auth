import type { NextApiRequest, NextApiResponse } from 'next'

import createTopLevelRedirect from './create-top-level-redirect';

import {TOP_LEVEL_OAUTH_COOKIE_NAME} from './index';
import {setCookie} from "../helpers/cookies";

export default function createTopLevelOAuthRedirect(
  apiKey: string,
  path: string,
  appUrl: string
) {
  const redirect = createTopLevelRedirect(apiKey, path, appUrl);

  return function topLevelOAuthRedirect(req: NextApiRequest,res: NextApiResponse) {
    setCookie({res, name: TOP_LEVEL_OAUTH_COOKIE_NAME, value: "1"});
    redirect(req, res);
  };
}
