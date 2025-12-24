import { kafkaClient } from "../shared/kafka/client";
import { TOPICS } from "./topic";
import { handleEmailNotification } from "../consumer/email.consumer";
import { handleSMSNotification } from "../consumer/sms.consumer";
import { NotificationEventType } from "../shared/kafka/types";

async function startEmailConsumer() {
  const consumer = kafkaClient.consumer({
    groupId: "email-notification-service",
  });
  await consumer.connect();
  await consumer.subscribe({
    topic: TOPICS.NOTIFICATIONS,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }
      const payload = JSON.parse(message.value.toString()) as NotificationEventType;
      await handleEmailNotification(payload);
    },
  });
}

async function StartSMSConsumer() {
  const consumer = kafkaClient.consumer({
    groupId: "sms-notification-service",
  });

  await consumer.connect();

  await consumer.subscribe({
    topic: TOPICS.NOTIFICATIONS,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }
      const payload = JSON.parse(message.value.toString()) as NotificationEventType;
      await handleSMSNotification(payload);
    },
  });
}

export async function StartConsumer(){
  await Promise.all([startEmailConsumer(), StartSMSConsumer()]);
}