import { StartConsumer } from "./Kafka/consumer";

StartConsumer().catch((error) => {
  console.error("Error starting consumers:", error);
});
