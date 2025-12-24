import {
  CreateNotification,
  markASFailed,
  markASSent,
} from "../db/notification.repo";
import { NotificationChannel } from "../generated/prisma";
import { sendEmail } from "../service/email.service";
import { NotificationEventType } from "../shared/kafka/types";

export async function handleEmailNotification(event: NotificationEventType) {
  if (!event.payload.email) {
    return;
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

    await markASSent({ id: notification.eventId });
  } catch (error) {
    await markASFailed({
      id: notification.eventId,
      error: (error as Error).message,
    });
    throw error;
  }
  //  Email sending logic here
}
