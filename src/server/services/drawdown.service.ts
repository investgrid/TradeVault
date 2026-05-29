export type DrawdownType = "static" | "trailing" | "eod_trailing";

export interface DrawdownResult {
  usedAmount: number;
  usedPercent: number;
  remainingAmount: number;
  remainingPercent: number;
  breachPrice: number;
  zone: "safe" | "warning" | "danger";
  breached: boolean;
}

export function calculateDrawdown(params: {
  type: DrawdownType;
  currentBalance: number;
  initialBalance: number;
  highWaterMark: number;
  maxDrawdownPct?: number;
  maxDrawdownAbs?: number;
}): DrawdownResult {
  const { type, currentBalance, initialBalance, highWaterMark, maxDrawdownPct, maxDrawdownAbs } = params;

  let maxDrawdown: number;
  let breachPrice: number;
  let usedAmount: number;

  switch (type) {
    case "static": {
      maxDrawdown = maxDrawdownAbs ?? initialBalance * (maxDrawdownPct ?? 10) / 100;
      breachPrice = initialBalance - maxDrawdown;
      usedAmount = Math.max(0, initialBalance - currentBalance);
      break;
    }
    case "trailing": {
      const hwm = Math.max(highWaterMark, currentBalance);
      maxDrawdown = maxDrawdownAbs ?? hwm * (maxDrawdownPct ?? 10) / 100;
      breachPrice = hwm - maxDrawdown;
      usedAmount = Math.max(0, hwm - currentBalance);
      break;
    }
    case "eod_trailing": {
      maxDrawdown = maxDrawdownAbs ?? highWaterMark * (maxDrawdownPct ?? 10) / 100;
      breachPrice = highWaterMark - maxDrawdown;
      usedAmount = Math.max(0, highWaterMark - currentBalance);
      break;
    }
  }

  const usedPercent = maxDrawdown > 0 ? (usedAmount / maxDrawdown) * 100 : 0;
  const remainingAmount = Math.max(0, maxDrawdown - usedAmount);
  const remainingPercent = 100 - usedPercent;
  const breached = currentBalance <= breachPrice;

  let zone: "safe" | "warning" | "danger";
  if (usedPercent >= 90) zone = "danger";
  else if (usedPercent >= 70) zone = "warning";
  else zone = "safe";

  return {
    usedAmount,
    usedPercent,
    remainingAmount,
    remainingPercent,
    breachPrice,
    zone,
    breached,
  };
}
