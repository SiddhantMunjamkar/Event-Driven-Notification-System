import { prismaClient } from "./prisma";
import { NotificationChannel, NotificationStatus } from "../generated/prisma";

export async function CreateNotification(params: {
  eventId: string;
  channel: NotificationChannel;
  recipient: string;
  message: string;
}) {
  return prismaClient.notification.create({
    data: {
      eventId: params.eventId,
      channel: params.channel,
      recipient: params.recipient,
      message: params.message,
      status: NotificationStatus.PENDING,
    },
  });
}

export async function markASSent(params: { id: string }) {
  return prismaClient.notification.update({
    where: { id: params.id },
    data: {
      status: NotificationStatus.SENT,
    },
  });
}

export async function markASFailed(params: { id: string; error: string }) {
  return prismaClient.notification.update({
    where: { id: params.id },
    data: {
      status: NotificationStatus.FAILED,
      lastError: params.error,
      retryCount: { increment: 1 },
    },
  });
}

export async function getRetry(params: { id: string }) {
  const record = await prismaClient.notification.findUnique({
    where: { id: params.id },
    select: { retryCount: true },
  });
  return record?.retryCount ?? 0;
}
