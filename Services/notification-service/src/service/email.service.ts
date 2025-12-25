import { MessageType } from "../shared/kafka/types";


export function sendEmail(
  recipient: string,
  message: string,
  MessageType: MessageType
) {
 

  if (!recipient.includes("@")) {
    throw new Error("Invalid email address");
  }


   // Logic to send email
  console.log(`Sending email to ${recipient} with message: ${message} and type: ${MessageType}`);

 
}
