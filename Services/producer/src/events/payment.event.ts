import { producer } from "../kafka/producer";
import { NotificationEventType } from "../shared/kafka/types";

export const paymentEvent = async (
  message: string,
  email?: string,
  phoneNumber?: string
) => {
  const event: NotificationEventType = {
    eventId: crypto.randomUUID(),
    messageType: "PAYMENT_SUCCESSFUL",
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
