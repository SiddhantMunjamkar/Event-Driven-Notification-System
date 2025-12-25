import "dotenv/config";
import { StartConsumer } from "./Kafka/consumer";
import { connectRedis } from "./redis/client";

async function startService() {
  try {
    console.log("Connecting to Redis...");
    await connectRedis();
    console.log("Redis connected successfully");

    console.log("Starting Kafka consumers...");
    await StartConsumer();
    console.log("Consumers started successfully");
  } catch (error) {
    console.error("Error starting service:", error);
    process.exit(1);
  }
}

startService();
