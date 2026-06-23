export function verifySubscriptionToken(token: string | null) {
  const expectedToken = process.env.SUBSCRIPTION_ACCESS_TOKEN;
  const devMode = process.env.NEXT_PUBLIC_ENABLE_DEV_SUBSCRIPTION === "true";

  if (expectedToken && token === expectedToken) {
    return true;
  }

  return devMode && token === "dev-subscriber";
}
