import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "event-driven-system",
  brokers: ["localhost:9090"],
});
