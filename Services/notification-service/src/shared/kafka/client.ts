import { Kafka, logLevel} from "kafkajs";  

export const kafkaClient = new Kafka({
  clientId: "notification-service", 
  brokers: ["localhost:9092"],
  logLevel: logLevel.ERROR,
});