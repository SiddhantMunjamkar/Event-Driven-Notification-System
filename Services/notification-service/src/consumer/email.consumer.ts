import {
  CreateNotification,
  getRetry,
  markASFailed,
  markASSent,
} from "../db/notification.repo";
import { NotificationChannel } from "../generated/prisma";
import {
  checkIdempotency,
  markCompleted,
  releaseProcessingLock,
} from "../redis/Idempotency";
import { AllowSend } from "../redis/ratelimiter";
import { handleDLQ } from "../retry/dlqhandler";
import { retryHandler } from "../retry/retryhandler";

import { sendEmail } from "../service/email.service";
import { NotificationEventType } from "../shared/kafka/types";

export async function handleEmailNotification(event: NotificationEventType) {
  if (!event.payload.email) {
    return;
  }

  // Idempotency check - acquire processing lock
  const isFirstAttempt = await checkIdempotency({
    eventId: event.eventId,
    channel: "EMAIL",
  });

  if (!isFirstAttempt) {
    console.log("Duplicate email notification event. Skipping processing.");
    return;
  }

  try {
    // Rate limiting
    const allowed = await AllowSend({
      key: "email",
      limit: 10,
      ttl: 1,
    });

    if (!allowed) {
      throw new Error("Rate limit exceeded for email notifications");
    }

    const notification = await CreateNotification({
      eventId: event.eventId,
      channel: NotificationChannel.EMAIL,
      recipient: event.payload.email,
      message: event.payload.message,
    });

    try {
      await sendEmail(
        event.payload.email,
        event.payload.message,
        event.messageType
      );

      await markASSent({ id: notification.id });

      // Mark as successfully completed - prevents future duplicates
      await markCompleted({
        eventId: event.eventId,
        channel: "EMAIL",
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
          channel: "EMAIL",
        });
        throw error;
      }

      // Max retries reached - send to DLQ
      await handleDLQ({
        originalEvent: event,
        channel: "EMAIL",
        errorMessage: (error as Error).message,
      });

      // Mark as completed to prevent further retries
      await markCompleted({
        eventId: event.eventId,
        channel: "EMAIL",
      });
    }
  } catch (error) {
    // Release processing lock on any error
    await releaseProcessingLock({
      eventId: event.eventId,
      channel: "EMAIL",
    });
    throw error;
  }
}
