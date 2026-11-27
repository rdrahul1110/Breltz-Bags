export type Status =
  "Review" | "Keep / Scale" | "Revision Sent" | "PDP Fix Applied" | "Guardrails Active" | "Paused";
export type Ad = {
  id: string;
  name: string;
  short: string;
  channel: string;
  sku: string;
  spend: number;
  grossRoas: number;
  returnRate: number;
  status: Status;
  qc: number;
  complaints: [string, number][];
  flag: string;
  brief: string;
  kind: "ugc" | "reel" | "carousel" | "static" | "search";
};
export const initialAds: Ad[] = [
  {
    id: "riya",
    name: "Riya’s UGC Video",
    short: "Riya UGC",
    channel: "Meta · UGC Video",
    sku: "Commuter 28L · Black",
    spend: 1000000,
    grossRoas: 4.5,
    returnRate: 36,
    status: "Review",
    qc: 78,
    kind: "ugc",
    complaints: [
      ["Laptop & lunchbox didn’t fit like video", 62],
      ["Bag smaller than expected", 24],
      ["Other / Didn’t like", 14],
    ],
    flag: "Wide-angle lens + ~13-inch laptop creates a roominess illusion; the official spec is 15.6-inch.",
    brief:
      "Add “Fits 15.6-inch laptop (13-inch shown)” caption, show true capacity, and require a 2-minute Product Team sign-off.",
  },
  {
    id: "ananya",
    name: "Ananya’s Goa Sunset Reel",
    short: "Goa Reel",
    channel: "Meta · Partnership",
    sku: "Commuter 28L · Dusty Rose & Sage",
    spend: 800000,
    grossRoas: 3.6,
    returnRate: 42,
    status: "Review",
    qc: 80,
    kind: "reel",
    complaints: [
      ["Colour looked brown/grey vs. reel", 68],
      ["Ordered 2 colours to compare", 18],
      ["Size/fit issue", 14],
    ],
    flag: "Golden-hour sunset filter distorts Dusty Rose & Sage Green; high Grade-A unused returns.",
    brief:
      "Remove the golden-hour filter. Re-shoot Sage and Dusty Rose in neutral daylight, with an unedited colour comparison.",
  },
  {
    id: "agency",
    name: "Agency Fit-Claim Carousel",
    short: "Carousel",
    channel: "Meta · Carousel",
    sku: "Commuter 28L · All Colours",
    spend: 600000,
    grossRoas: 3.3,
    returnRate: 34,
    status: "Review",
    qc: 76,
    kind: "carousel",
    complaints: [
      ["16-inch laptop too tight / zip strains", 65],
      ["No scale reference on product page", 23],
      ["Other", 12],
    ],
    flag: "Agency changed copy to “16-inch” in March without product team sign-off (true spec: 15.6-inch).",
    brief:
      "Replace “Fits up to 16-inch” with “Fits 15.6-inch” immediately. Add a true-size fit graphic and Product Team approval.",
  },
  {
    id: "studio",
    name: "Studio Daylight Catalogue",
    short: "Studio",
    channel: "Meta · Static",
    sku: "Commuter 28L & School Bags",
    spend: 400000,
    grossRoas: 2.3,
    returnRate: 11,
    status: "Keep / Scale",
    qc: 75,
    kind: "static",
    complaints: [
      ["Changed mind / bracketing", 55],
      ["Size expectation", 30],
      ["Transit damage", 15],
    ],
    flag: "Colour-accurate studio assets set realistic expectations and deliver strong net margin.",
    brief:
      "Retain neutral daylight photography. Add person-scale capacity shots and clear 15.6-inch fit labels.",
  },
  {
    id: "google",
    name: "Google Search + PMax",
    short: "Google",
    channel: "Google Ads · High Intent",
    sku: "Commuter 28L & School Bags",
    spend: 900000,
    grossRoas: 2.6,
    returnRate: 10,
    status: "Keep / Scale",
    qc: 74,
    kind: "search",
    complaints: [
      ["Minor fit questions", 50],
      ["Delivery delay", 30],
      ["Other", 20],
    ],
    flag: "High-intent shoppers with lower return rates generate higher net rupee profit than hyped Meta reels.",
    brief:
      "Keep product specs consistent across Shopping feeds and search landing pages. Clarify fit and delivery expectations.",
  },
];
export function economics(ad: Pick<Ad, "spend" | "grossRoas" | "returnRate">) {
  const grossRevenue = ad.spend * ad.grossRoas;
  const totalOrders = Math.round(grossRevenue / 2500);
  const returnedOrders = Math.round((totalOrders * ad.returnRate) / 100);
  const keptOrders = totalOrders - returnedOrders;
  const netRevenue = keptOrders * 2500;
  const cogsCost = keptOrders * 875;
  const forwardShipCost = totalOrders * 110;
  const reverseCost = returnedOrders * 190;
  const markdownLoss = returnedOrders * 120;
  const netProfit = netRevenue - cogsCost - forwardShipCost - reverseCost - markdownLoss - ad.spend;
  return {
    grossRevenue,
    totalOrders,
    returnedOrders,
    keptOrders,
    netRevenue,
    cogsCost,
    forwardShipCost,
    reverseCost,
    markdownLoss,
    netProfit,
    netRoas: ad.spend ? netRevenue / ad.spend : 0,
    netMarginPct: netRevenue ? (netProfit / netRevenue) * 100 : 0,
  };
}
export function aggregate(ads: Ad[]) {
  const sums = ads.reduce(
    (s, a) => {
      const e = economics(a);
      return {
        spend: s.spend + a.spend,
        gross: s.gross + e.grossRevenue,
        net: s.net + e.netRevenue,
        profit: s.profit + e.netProfit,
        orders: s.orders + e.totalOrders,
        returns: s.returns + e.returnedOrders,
      };
    },
    { spend: 0, gross: 0, net: 0, profit: 0, orders: 0, returns: 0 },
  );
  return {
    ...sums,
    grossRoas: sums.spend ? sums.gross / sums.spend : 0,
    netRoas: sums.spend ? sums.net / sums.spend : 0,
    returnRate: sums.orders ? (sums.returns / sums.orders) * 100 : 0,
    margin: sums.net ? (sums.profit / sums.net) * 100 : 0,
  };
}
export type Action = "creative" | "pdp" | "guardrails" | "pause";
export function applyAction(ads: Ad[], id: string, action: Action): Ad[] {
  const selected = ads.find((a) => a.id === id);
  if (!selected || selected.status === "Paused") return ads;
  if (action === "pause") {
    const recipients = ads.filter((a) => a.status === "Keep / Scale" && a.id !== id && a.spend > 0);
    const total = recipients.reduce((s, a) => s + a.spend, 0);
    if (!total) return ads;
    return ads.map((a) =>
      a.id === id
        ? { ...a, spend: 0, status: "Paused" }
        : recipients.some((r) => r.id === a.id)
          ? { ...a, spend: a.spend + (selected.spend * a.spend) / total }
          : a,
    );
  }
  const rules = {
    creative: { reduction: 14, min: 11, status: "Revision Sent" as Status },
    pdp: { reduction: 12, min: 11, status: "PDP Fix Applied" as Status },
    guardrails: { reduction: 7, min: 12, status: "Guardrails Active" as Status },
  };
  const rule = rules[action];
  return ads.map((a) =>
    a.id === id
      ? {
          ...a,
          returnRate: Math.min(a.returnRate, Math.max(rule.min, a.returnRate - rule.reduction)),
          status: rule.status,
        }
      : a,
  );
}
export const money = (n: number) => `${n < 0 ? "−" : ""}₹${(Math.abs(n) / 100000).toFixed(1)}L`;
export const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
