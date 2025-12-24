import {
  CreateNotification,
  markASFailed,
  markASSent,
} from "../db/notification.repo";
import { NotificationChannel } from "../generated/prisma";
import { sendSMS } from "../service/sms.service";
import { NotificationEventType } from "../shared/kafka/types";

export async function handleSMSNotification(event: NotificationEventType) {
  if (!event.payload.phoneNumber) {
    return;
  }

  const notification = await CreateNotification({
    eventId: event.eventId,
    channel: NotificationChannel.SMS,
    recipient: event.payload.phoneNumber,
    message: event.payload.message,
  });

  try {
    sendSMS(event.payload.phoneNumber, event.payload.message);
    await markASSent({ id: notification.eventId });
  } catch (error) {
    await markASFailed({
      id: notification.eventId,
      error: (error as Error).message,
    });
    throw error;
  }

  // SMS sending logic here
}
