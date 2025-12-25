export function sendSMS(recipient: string, message: string) {
  if (recipient.length < 10) {
    throw new Error("Invalid phone number");
  }

  console.log(`Sending SMS to ${recipient}: ${message}`);

  // Logic to send SMS
}
