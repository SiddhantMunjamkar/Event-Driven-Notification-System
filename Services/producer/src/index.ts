import { connect } from "./kafka/producer";
import { signupEvent } from "./events/signup.event";
import { paymentEvent } from "./events/payment.event";
import { alertEvent } from "./events/alert.event";

async function main() {
  await connect();

  await signupEvent(
    "Welcome to our platform!",
    "user@example.com",
    "1234567890"
  );

  await paymentEvent(
    "Your payment was successful.",
    "user@example.com",
    "1234567890"
  );

  await alertEvent(
    "This is an important alert!",
    "user@example.com",
    "1234567890"
  );
}
main().catch((error) => {
  console.error("Error in main execution:", error);
});
