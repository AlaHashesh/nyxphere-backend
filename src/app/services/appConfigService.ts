import { db } from "@/lib/firebase/serverApp";
import { BadRequestError } from "@/errors/BadRequestError";
import { cache } from "@/lib/cache";

export const getSubscriptionCodes = async () => {
  const cacheKey = "appConfigs.subscriptionCodes";
  const cachedResponse = await cache.get(cacheKey);
  if (cachedResponse) {
    try {
      const data: string[] = JSON.parse(cachedResponse as string);
      return data;
    } catch {
    }
  }

  const configSnapshot = await db.collection("app_configs")
    .where("config_key", "==", "subscriptionCodes")
    .limit(1)
    .get();

  if (configSnapshot.empty) {
    throw new BadRequestError("Subscription codes are not configured");
  }

  const configValue = configSnapshot.docs[0].data().config_value;
  const allowedCodes: string[] = Array.isArray(configValue) ? configValue : [];
  const cachedValue = allowedCodes.map(code => code.trim().toLowerCase());
  await cache.set(cacheKey, JSON.stringify(cachedValue));
  return cachedValue;
};
