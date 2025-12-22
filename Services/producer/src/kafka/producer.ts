import { kafka } from "../shared/kafka/client";

export const producer = kafka.producer();

export async function connect() {
  await producer.connect();
  console.log("Producer connected");
}

export async function disconnect() {
  await producer.disconnect();
  console.log("Producer disconnected");
}
