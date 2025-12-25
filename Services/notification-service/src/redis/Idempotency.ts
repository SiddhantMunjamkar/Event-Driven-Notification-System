import { redisClient } from "./client";


export async function checkIdempotency(params: {
  eventId: string;
  channel: "EMAIL" | "SMS";
}): Promise<boolean> {
  const completedKey = `idempotency:completed:${params.eventId}:${params.channel}`;
  const processingKey = `idempotency:processing:${params.eventId}:${params.channel}`;

  // Check if already completed
  const isCompleted = await redisClient.exists(completedKey);
  if (isCompleted) {
    return false; // Already processed successfully
  }

  // Try to acquire processing lock
  const result = await redisClient.set(processingKey, "processing", {
    NX: true, // only set if not exists
    EX: 300, // 5 minutes - short TTL for in-progress
  });

  return result === "OK"; // true if acquired lock, false if already processing
}

/**
 * Mark message as successfully completed
 * Sets a long-lived completion marker
 */
export async function markCompleted(params: {
  eventId: string;
  channel: "EMAIL" | "SMS";
  ttl?: number;
}): Promise<void> {
  const completedKey = `idempotency:completed:${params.eventId}:${params.channel}`;
  const processingKey = `idempotency:processing:${params.eventId}:${params.channel}`;

  // Set completed marker with long TTL
  await redisClient.set(completedKey, "completed", {
    EX: params.ttl ?? 86400, // 24 hours default
  });

  // Remove processing lock
  await redisClient.del(processingKey);
}

/**
 * Release processing lock on failure
 * Allows the message to be retried
 */
export async function releaseProcessingLock(params: {
  eventId: string;
  channel: "EMAIL" | "SMS";
}): Promise<void> {
  const processingKey = `idempotency:processing:${params.eventId}:${params.channel}`;
  await redisClient.del(processingKey);
}
