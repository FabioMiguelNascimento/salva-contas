import { useUsage as useUsageContext } from "@/context/usage-context";

export function useUsage() {
  const context = useUsageContext();
  
  const getAiRemaining = () => {
    if (!context.usageData) return 0;
    return context.usageData.limits.aiInteractions - context.usageData.usage.aiInteractions;
  };

  const getReceiptsRemaining = () => {
    if (!context.usageData) return 0;
    return context.usageData.limits.receipts - context.usageData.usage.receipts;
  };

  const isAiLimitReached = () => {
    if (!context.usageData) return false;
    return context.usageData.usage.aiInteractions >= context.usageData.limits.aiInteractions;
  };

  const isReceiptsLimitReached = () => {
    if (!context.usageData) return false;
    return context.usageData.usage.receipts >= context.usageData.limits.receipts;
  };

  return {
    ...context,
    getAiRemaining,
    getReceiptsRemaining,
    isAiLimitReached,
    isReceiptsLimitReached,
  };
}
