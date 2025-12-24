import { producer } from "../kafka/producer";
import { NotificationEventType } from "../shared/kafka/types";

export const signupEvent = async (
  message: string,
  email?: string,
  phoneNumber?: string
) => {
  const event: NotificationEventType = {
    eventId: crypto.randomUUID(),
    messageType: "USER_SIGNED_UP",
    timestamp: Date.now(),
    payload: {
      email,
      phoneNumber,
      message,
    },
  };
  await producer.send({
    topic: "notifications",
    messages: [{ value: JSON.stringify(event) }],
  });
};
