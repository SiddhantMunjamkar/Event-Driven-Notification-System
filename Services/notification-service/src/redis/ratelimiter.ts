import { redisClient } from "./client";

export async function AllowSend(params: {
  key: string;
  limit: number;
  ttl: number;
}): Promise<boolean> {
  const key = `ratelimit:${params.key}`;

  const current = await redisClient.incr(key);
  if (current === 1) {
    await redisClient.expire(key, params.ttl);
  }

  return current <= params.limit;
}
