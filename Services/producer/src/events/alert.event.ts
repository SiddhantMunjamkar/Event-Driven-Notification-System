import { producer } from "../kafka/producer";
import { NotificationEventType } from "../shared/kafka/types";

export const alertEvent = async (
  message: string,
  email?: string,
  phoneNumber?: string
) => {
  const event: NotificationEventType = {
    eventId: crypto.randomUUID(),
    messageType: "ALERT_RAISED",
    timestamp: Date.now(),
    payload: {
      email,
      phoneNumber,
      message,
    },
  };

  await producer.send({
    topic: "notification",
    messages: [{ value: JSON.stringify(event) }],
  });
};
