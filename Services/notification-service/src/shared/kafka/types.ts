export type MessageType =
  | "USER_SIGNED_UP"
  | "PAYMENT_SUCCESSFUL"
  | "ALERT_RAISED";

export interface NotificationEventType {
  eventId: string;
  messageType: MessageType;
  timestamp: number;
  payload: {
    email?: string;
    phoneNumber?: string;
    message: string;
  };
}

