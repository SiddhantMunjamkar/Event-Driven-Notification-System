import {
  CreateNotification,
  getRetry,
  markASFailed,
  markASSent,
} from "../db/notification.repo";
import { NotificationChannel } from "../generated/prisma";
import { sendSMS } from "../service/sms.service";
import { NotificationEventType } from "../shared/kafka/types";
import { AllowSend } from "../redis/ratelimiter";
import {
  checkIdempotency,
  markCompleted,
  releaseProcessingLock,
} from "../redis/Idempotency";
import { handleDLQ } from "../retry/dlqhandler";
import { retryHandler } from "../retry/retryhandler";

export async function handleSMSNotification(event: NotificationEventType) {
  if (!event.payload.phoneNumber) {
    return;
  }

  // Idempotency check - acquire processing lock
  const isFirstAttempt = await checkIdempotency({
    eventId: event.eventId,
    channel: "SMS",
  });

  if (!isFirstAttempt) {
    console.log("Duplicate SMS notification event. Skipping processing.");
    return;
  }

  try {
    // Rate limiting check
    const allowed = await AllowSend({
      key: "sms",
      limit: 10,
      ttl: 1,
    });

    if (!allowed) {
      throw new Error("Rate limit exceeded for SMS notifications");
    }

    const notification = await CreateNotification({
      eventId: event.eventId,
      channel: NotificationChannel.SMS,
      recipient: event.payload.phoneNumber,
      message: event.payload.message,
    });

    try {
      await sendSMS(event.payload.phoneNumber, event.payload.message);
      await markASSent({ id: notification.id });

      // Mark as successfully completed - prevents future duplicates
      await markCompleted({
        eventId: event.eventId,
        channel: "SMS",
      });
    } catch (error) {
      await markASFailed({
        id: notification.id,
        error: (error as Error).message,
      });
      const retryCount = await getRetry({ id: notification.id });

      if (retryHandler(retryCount)) {
        // Release lock to allow retry
        await releaseProcessingLock({
          eventId: event.eventId,
          channel: "SMS",
        });
        throw error;
      }

      // Max retries reached - send to DLQ
      await handleDLQ({
        originalEvent: event,
        channel: "SMS",
        errorMessage: (error as Error).message,
      });

      // Mark as completed to prevent further retries
      await markCompleted({
        eventId: event.eventId,
        channel: "SMS",
      });
    }
  } catch (error) {
    // Release processing lock on any error
    await releaseProcessingLock({
      eventId: event.eventId,
      channel: "SMS",
    });
    throw error;
  }
}
