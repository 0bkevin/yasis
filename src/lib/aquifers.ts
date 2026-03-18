export type AquiferType = "reserve" | "subscription" | "goal" | "shared" | "charity" | "tax";
export type AquiferStatus = "draft" | "active" | "paused" | "completed" | "locked" | "unlocked";
export type AquiferOverflowMode = "compound" | "general_balance" | "donation";

export type AquiferRecord = {
  id: string;
  name: string;
  type: AquiferType;
  status: AquiferStatus;
  allocationPercent: number;
  balanceUSDC: number;
  requiredPrincipalSnapshotUSDC?: number | null;
  estimatedApyBps?: number | null;
  targetAmountUSDC: number | null;
  targetMonthlyOutflowUSDC: number | null;
  targetDate: Date | string | null;
  unlockAt: Date | string | null;
  overflowMode: AquiferOverflowMode;
  color?: string | null;
  notes?: string | null;
};

export type AquiferEventRecord = {
  id: string;
  aquiferId?: string | null;
  walletAddress: string;
  eventType: "created" | "updated" | "deleted" | "allocation" | "status_changed" | "overflow_changed";
  title: string;
  details?: string | null;
  amountUSDC?: number | null;
  createdAt?: Date | string | null;
};

function roundUSDC(value: number) {
  return Number(value.toFixed(2));
}

function asDate(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

export function getAquiferTypeLabel(type: AquiferType) {
  switch (type) {
    case "subscription":
      return "Subscription";
    case "goal":
      return "Goal";
    case "shared":
      return "Shared";
    case "charity":
      return "Giving";
    case "tax":
      return "Tax Shield";
    default:
      return "Reserve";
  }
}

export function getAquiferOverflowLabel(mode: AquiferOverflowMode) {
  switch (mode) {
    case "compound":
      return "Auto-compound";
    case "donation":
      return "Route to giving";
    default:
      return "Send to general balance";
  }
}

export function getAquiferHealth(aquifer: AquiferRecord) {
  if (aquifer.status === "completed") return "Goal reached";
  if (aquifer.status === "paused") return "Paused";
  if (aquifer.status === "draft") return "Draft";
  if (aquifer.status === "locked") return "Locked";
  if (aquifer.status === "unlocked") return "Unlocked";

  if (aquifer.targetAmountUSDC && aquifer.targetAmountUSDC > 0) {
    const ratio = aquifer.balanceUSDC / aquifer.targetAmountUSDC;
    if (ratio >= 1) return "Goal reached";
    if (ratio >= 0.75) return "On track";
    if (ratio > 0) return "Building";
    return "Empty";
  }

  if (aquifer.targetMonthlyOutflowUSDC && aquifer.targetMonthlyOutflowUSDC > 0) {
    if (aquifer.balanceUSDC >= aquifer.targetMonthlyOutflowUSDC * 3) return "Buffered";
    if (aquifer.balanceUSDC >= aquifer.targetMonthlyOutflowUSDC) return "Funding";
    if (aquifer.balanceUSDC > 0) return "Early";
    return "Empty";
  }

  return aquifer.balanceUSDC > 0 ? "Funded" : "Empty";
}

export function estimateSubscriptionPrincipal(monthlyAmount: number, apyPercent: number, safetyMonths = 12) {
  if (!Number.isFinite(monthlyAmount) || monthlyAmount <= 0) return 0;
  if (!Number.isFinite(apyPercent) || apyPercent <= 0) return 0;

  const annualYieldRate = apyPercent / 100;
  const yearlyTarget = monthlyAmount * safetyMonths;
  return roundUSDC(yearlyTarget / annualYieldRate);
}

export function getSubscriptionCoverageMonths(aquifer: AquiferRecord) {
  if (!aquifer.targetMonthlyOutflowUSDC || aquifer.targetMonthlyOutflowUSDC <= 0) return 0;
  return roundUSDC(aquifer.balanceUSDC / aquifer.targetMonthlyOutflowUSDC);
}

export function getSubscriptionFundingState(aquifer: AquiferRecord, apyPercent: number) {
  if (aquifer.type !== "subscription") {
    return null;
  }

  const monthlyAmount = aquifer.targetMonthlyOutflowUSDC ?? 0;
  const requiredPrincipal = aquifer.requiredPrincipalSnapshotUSDC ?? estimateSubscriptionPrincipal(monthlyAmount, apyPercent);
  const currentBalance = roundUSDC(aquifer.balanceUSDC);
  const targetCoverage = monthlyAmount > 0 ? roundUSDC(currentBalance / monthlyAmount) : 0;

  let status = "Planning";
  if (requiredPrincipal > 0) {
    if (currentBalance >= requiredPrincipal) {
      status = "Sufficient";
    } else if (currentBalance >= requiredPrincipal * 0.7) {
      status = "Near target";
    } else if (currentBalance > 0) {
      status = "Underfunded";
    } else {
      status = "Empty";
    }
  }

  return {
    requiredPrincipal,
    coverageMonths: targetCoverage,
    status,
  };
}

export function formatApyBps(apyBps?: number | null) {
  if (!apyBps || !Number.isFinite(apyBps)) return null;
  return (apyBps / 100).toFixed(2);
}

export function getAquiferProgress(aquifer: AquiferRecord) {
  if (aquifer.targetAmountUSDC && aquifer.targetAmountUSDC > 0) {
    return Math.max(0, Math.min(100, (aquifer.balanceUSDC / aquifer.targetAmountUSDC) * 100));
  }

  if (aquifer.targetMonthlyOutflowUSDC && aquifer.targetMonthlyOutflowUSDC > 0) {
    return Math.max(0, Math.min(100, (aquifer.balanceUSDC / (aquifer.targetMonthlyOutflowUSDC * 3)) * 100));
  }

  return Math.max(5, Math.min(100, aquifer.allocationPercent));
}

export function getAquiferSubtitle(aquifer: AquiferRecord) {
  const targetDate = asDate(aquifer.targetDate);
  const unlockAt = asDate(aquifer.unlockAt);

  if (aquifer.targetAmountUSDC && aquifer.targetAmountUSDC > 0) {
    return targetDate
      ? `Target $${aquifer.targetAmountUSDC.toFixed(2)} by ${targetDate.toLocaleDateString()}`
      : `Target $${aquifer.targetAmountUSDC.toFixed(2)}`;
  }

  if (aquifer.targetMonthlyOutflowUSDC && aquifer.targetMonthlyOutflowUSDC > 0) {
    return `$${aquifer.targetMonthlyOutflowUSDC.toFixed(2)}/mo yield target`;
  }

  if (unlockAt) {
    return `Unlocks ${unlockAt.toLocaleDateString()}`;
  }

  return `${aquifer.allocationPercent}% of new yield`;
}

export function formatAquiferEventType(eventType: AquiferEventRecord["eventType"]) {
  switch (eventType) {
    case "allocation":
      return "Allocation";
    case "status_changed":
      return "Status";
    case "overflow_changed":
      return "Overflow";
    case "updated":
      return "Update";
    case "deleted":
      return "Deleted";
    default:
      return "Created";
  }
}

export function getAquiferBadgeTone(status: AquiferStatus) {
  if (status === "completed" || status === "unlocked") return "bg-green-100 text-green-700";
  if (status === "paused") return "bg-red-100 text-red-700";
  if (status === "locked") return "bg-amber-100 text-amber-700";
  return "bg-misty-rose text-terracotta";
}
