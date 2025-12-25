import { TOPICS } from "../Kafka/topic";
import { kafkaClient } from "../shared/kafka/client";
import { NotificationEventType } from "../shared/kafka/types";

const producer = kafkaClient.producer();
let connectedProducer = false;

async function getProducer() {
  if (!connectedProducer) {
    await producer.connect();
    connectedProducer = true;
  }
  return producer;
}

export async function handleDLQ(params: {
  originalEvent: NotificationEventType;
  channel: "EMAIL" | "SMS";
  errorMessage: string;
}) {
  const producer = await getProducer();
  await producer.send({
    topic: TOPICS.NOTIFICATIONS_DLQ,
    messages: [
      {
        value: JSON.stringify({
          originalEvent: params.originalEvent,
          channel: params.channel,
          errorMessage: params.errorMessage,
          failedAt: Date.now(),
        }),
      },
    ],
  });
}
    