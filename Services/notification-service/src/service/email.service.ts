import { MessageType } from "../shared/kafka/types";

export function sendEmail(
  recipient: string,
  message: string,
  MessageType: MessageType
) {
  // Logic to send email

  if (!recipient.includes("@")) {
    throw new Error("Invalid email address");
  }
  console.log(`${recipient} subject: ${MessageType} - message: ${message}`);
}
