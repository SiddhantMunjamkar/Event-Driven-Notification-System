export function sendSMS(recipient: string, message: string) {
  // Logic to send SMS
  console.log(`Sending SMS to ${recipient} - message: ${message}`);

  if (recipient.length < 10) {
    throw new Error("Invalid phone number");
  }
}
