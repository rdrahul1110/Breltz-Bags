import { describe, it, expect } from "vitest";
import { initialAds, economics, aggregate, applyAction } from "./profitability";
describe("Pilot unit economics", () => {
  it("uses the specified order, return and cost formula", () => {
    expect(economics({ spend: 1000000, grossRoas: 4.5, returnRate: 36 })).toMatchObject({
      grossRevenue: 4500000,
      totalOrders: 1800,
      returnedOrders: 648,
      keptOrders: 1152,
      netRevenue: 2880000,
      cogsCost: 1008000,
      forwardShipCost: 198000,
      reverseCost: 123120,
      markdownLoss: 77760,
      netProfit: 473120,
      netRoas: 2.88,
    });
  });
  it("starts with ₹37L total, ₹28L Meta and ₹9L Google", () => {
    expect(aggregate(initialAds).spend).toBe(3700000);
    expect(aggregate(initialAds.filter((a) => a.id !== "google")).spend).toBe(2800000);
    expect(aggregate(initialAds.filter((a) => a.id === "google")).spend).toBe(900000);
  });
  it("weights returns by placed orders", () => {
    expect(aggregate(initialAds).returnRate).toBeCloseTo((1535 / 5048) * 100, 2);
  });
  it("reduces creative returns by 14 points, with an 11% floor", () => {
    const fixed = applyAction(initialAds, "riya", "creative");
    expect(fixed.find((a) => a.id === "riya")?.returnRate).toBe(22);
    expect(applyAction(fixed, "riya", "creative").find((a) => a.id === "riya")?.returnRate).toBe(
      11,
    );
    expect(fixed.find((a) => a.id === "riya")?.status).toBe("Revision Sent");
  });
  it("reduces PDP returns by 12 points, with an 11% floor", () => {
    const fixed = applyAction(initialAds, "ananya", "pdp");
    expect(fixed.find((a) => a.id === "ananya")?.returnRate).toBe(30);
    expect(
      applyAction(initialAds, "studio", "pdp").find((a) => a.id === "studio")?.returnRate,
    ).toBe(11);
  });
  it("reduces guardrail returns by 7 points without worsening healthy rows", () => {
    expect(
      applyAction(initialAds, "riya", "guardrails").find((a) => a.id === "riya")?.returnRate,
    ).toBe(29);
    expect(
      applyAction(initialAds, "google", "guardrails").find((a) => a.id === "google")?.returnRate,
    ).toBe(10);
  });
  it("pauses and reallocates proportionally while preserving all ₹37L", () => {
    const next = applyAction(initialAds, "riya", "pause");
    expect(next.find((a) => a.id === "riya")).toMatchObject({ spend: 0, status: "Paused" });
    expect(next.find((a) => a.id === "studio")?.spend).toBeCloseTo(400000 + (1000000 * 4) / 13);
    expect(next.find((a) => a.id === "google")?.spend).toBeCloseTo(900000 + (1000000 * 9) / 13);
    expect(aggregate(next).spend).toBeCloseTo(3700000);
    expect(applyAction(next, "riya", "pause")).toEqual(next);
    expect(aggregate(next).margin).toBeCloseTo(10.0942, 3);
  });
  it("improves contribution when the nearly break-even Goa reel is reallocated", () => {
    expect(aggregate(applyAction(initialAds, "ananya", "pause")).margin).toBeGreaterThan(
      aggregate(initialAds).margin,
    );
  });
  it("handles zero spend and 0–50% live return economics", () => {
    expect(economics({ spend: 0, grossRoas: 4.5, returnRate: 50 }).netMarginPct).toBe(0);
    expect(economics({ spend: 1000000, grossRoas: 4.5, returnRate: 0 }).returnedOrders).toBe(0);
    expect(economics({ spend: 1000000, grossRoas: 4.5, returnRate: 50 }).returnedOrders).toBe(900);
  });
});
