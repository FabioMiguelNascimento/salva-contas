import type { Subscription, SubscriptionFrequency } from "@/types/finance";
import { months, weekDays } from "./constants";

export function getFrequencyLabel(frequency: SubscriptionFrequency) {
  switch (frequency) {
    case "weekly":
      return "Semanal";
    case "monthly":
      return "Mensal";
    case "yearly":
      return "Anual";
    default:
      return frequency;
  }
}

export function getScheduleLabel(subscription: Subscription) {
  if (subscription.frequency === "weekly" && subscription.dayOfWeek !== null && subscription.dayOfWeek !== undefined) {
    return weekDays.find((day) => day.value === subscription.dayOfWeek)?.label ?? "Dia não definido";
  }

  if (subscription.frequency === "yearly") {
    const monthLabel = subscription.month ? months.find((item) => item.value === subscription.month)?.label : null;
    return subscription.dayOfMonth && monthLabel
      ? `${subscription.dayOfMonth} de ${monthLabel}`
      : "Periodicidade incompleta";
  }

  if (subscription.frequency === "monthly" && subscription.dayOfMonth) {
    return `Todo dia ${subscription.dayOfMonth}`;
  }

  return "Periodicidade não configurada";
}
