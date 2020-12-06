import { IncomingMessage, ServerResponse } from "http";

export interface AssociatedUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified: boolean;
  account_owner: boolean;
  locale: string;
  collaborator: boolean;
}

export type AccessMode = "online" | "offline";

export interface AuthConfig {
  secret: string;
  apiKey: string;
  myShopifyDomain?: string;
  accessMode?: "online" | "offline";
  afterAuth?(params: {
    shopOrigin: string;
    shopifyToken: string;
    shopifyScope: string;
    shopifyAssociatedUser: AssociatedUser;
    req: IncomingMessage;
    res: ServerResponse;
  }): void;
}

export interface OAuthStartOptions extends AuthConfig {
  prefix?: string;
  scopes?: string[];
  appUrl: string;
}
