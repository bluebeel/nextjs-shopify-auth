import querystring from 'querystring';
// @ts-ignore
import nonce from 'nonce';
import type { NextApiRequest, NextApiResponse } from 'next'

import {OAuthStartOptions} from '../types';

import {setCookie} from "../helpers/cookies";

const createNonce = nonce();

export default function oAuthQueryString(
    req: NextApiRequest,
    res: NextApiResponse,
  options: OAuthStartOptions,
  callbackPath: string,
) {
  const {scopes = [], apiKey, accessMode, appUrl} = options;

  const requestNonce = createNonce();
  setCookie({res, name: 'shopifyNonce', value: requestNonce.toString()});

  const redirectParams: Record<string, string> = {
    state: requestNonce,
    scope: scopes.join(', '),
    client_id: apiKey,
    redirect_uri: `https://${appUrl}${callbackPath}`,
  };

  if (accessMode === 'online') {
    redirectParams['grant_options[]'] = 'per-user';
  }

  return querystring.stringify(redirectParams);
}
