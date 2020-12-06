import querystring from 'querystring';
import type { NextApiRequest, NextApiResponse } from 'next'

import redirectionPage from './redirection-page';

export default function createTopLevelRedirect(apiKey: string, path: string, appUrl: string) {
  return function topLevelRedirect(req: NextApiRequest,res: NextApiResponse) {
    const query = req.query as Record<string, string>;
    const params = { shop: query.shop };
    const queryString = querystring.stringify(params);

    res.send(redirectionPage({
      origin: query.shop,
      redirectTo: `https://${appUrl}${path}?${queryString}`,
      apiKey,
    }));
  };
}
