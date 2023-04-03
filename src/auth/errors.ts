enum Error {
  ShopParamMissing = "Expected a valid shop query parameter",
  HostParamMissing = "Expected a valid host query parameter",
  InvalidHmac = "HMAC validation failed",
  AccessTokenFetchFailure = "Could not fetch access token",
  NonceMatchFailed = "Request origin could not be verified"
}

export default Error;

export type ErrorResponse = {
  errorMessage: Error;
  shopOrigin: string;
};
