import {
  Sparkles,
  Image,
  PanelsTopLeft,
  ShieldCheck,
  ArrowRightLeft,
  CircleCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { economics, money, type Ad, type Action } from "@/lib/profitability";
export function ReviewDrawer({
  ad,
  onClose,
  onAction,
  canPause,
}: {
  ad: Ad | undefined;
  onClose: () => void;
  onAction: (action: Action) => void;
  canPause: boolean;
}) {
  const e = ad ? economics(ad) : undefined;
  const actions = [
    {
      id: "creative" as const,
      title: "Fix Creative & Re-Test",
      icon: Image,
      copy: ad?.brief,
      estimate: "−14 pp · minimum 11%",
    },
    {
      id: "pdp" as const,
      title: "Fix Landing Page / Colour Pairing",
      icon: PanelsTopLeft,
      copy: "Route traffic to an updated PDP: person-scale photo, 15.6-inch fit graphic, and unedited daylight swatches for Sage / Dusty Rose. Pause sunset filter boosting.",
      estimate: "−12 pp · minimum 11%",
    },
    {
      id: "guardrails" as const,
      title: "Hold Spend & Apply Guardrails",
      icon: ShieldCheck,
      copy: "Cap scaling above 20% returns, exclude high-RTO pincodes, and send Refund CAPI events to Meta so Advantage+ optimizes for kept orders.",
      estimate: "−7 pp · minimum 12%",
    },
    {
      id: "pause" as const,
      title: "Pause & Reallocate Budget",
      icon: ArrowRightLeft,
      copy: `Shift ${money(ad?.spend ?? 0)} proportionally into existing Keep / Scale ads. Total monthly spend stays at ₹37.0L.`,
      estimate: "Zero budget cut",
    },
  ];
  return (
    <Sheet
      open={Boolean(ad)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="drawer-content">
        <SheetHeader>
          <div className="eyebrow text-insight flex gap-2 items-center">
            <Sparkles size={14} /> Creative intelligence
          </div>
          <SheetTitle className="pr-7 text-xl">{ad?.name}</SheetTitle>
          <SheetDescription>
            {ad?.channel} · {ad?.sku}
          </SheetDescription>
        </SheetHeader>
        {ad && e && (
          <>
            <section className="drawer-section">
              <h2 className="drawer-label">01 / Why is this ad flagged?</h2>
              <div className="bg-success-soft text-success p-3 rounded-md text-xs leading-relaxed flex items-start gap-2">
                <CircleCheck size={17} className="shrink-0" />
                <span>
                  <strong>{ad.qc}% Grade A (Unused)</strong>
                  <br />
                  Expectation Gap Confirmed, Not Factory Quality
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed my-4">{ad.flag}</p>
              <h3 className="text-xs font-bold mb-2">Unit-Economics Profitability Waterfall</h3>
              {[
                ["Gross Checkout Revenue", e.grossRevenue],
                ["Refunds Lost to Returns", -(e.grossRevenue - e.netRevenue)],
                ["Forward Shipping · All Orders", -e.forwardShipCost],
                ["Reverse Pickup & QC/Repack · ₹190/return", -e.reverseCost],
                ["Seconds Markdown · 40% off on 12%", -e.markdownLoss],
                ["Product COGS & Ad Spend", -(e.cogsCost + ad.spend)],
              ].map(([label, value]) => (
                <div key={label} className="waterfall-row">
                  <span className="text-muted-foreground">{label}</span>
                  <strong className="numeric">{money(Number(value))}</strong>
                </div>
              ))}
              <div className="flex justify-between items-center py-3">
                <strong className="text-xs">True Net Contribution Profit</strong>
                <strong className={e.netMarginPct >= 15 ? "text-success" : "text-danger"}>
                  {money(e.netProfit)}{" "}
                  <span className="text-xs">({e.netMarginPct.toFixed(1)}%)</span>
                </strong>
              </div>
              <h3 className="text-xs font-bold mt-5 mb-1">Top Customer Complaints</h3>
              <p className="text-[10px] text-muted-foreground mb-4">
                Freshdesk + Return Portal · Illustrative diagnostic data
              </p>
              {ad.complaints.map(([reason, pct]) => (
                <div key={reason} className="mb-3">
                  <div className="flex justify-between text-[11px] mb-1 gap-3">
                    <span>{reason}</span>
                    <strong>{pct}%</strong>
                  </div>
                  <progress className="complaint" max={100} value={pct} />
                </div>
              ))}
            </section>
            <section className="drawer-section">
              <h2 className="drawer-label">02 / Choose plan of action</h2>
              <div className="flex items-center gap-2 text-[10px] text-insight mb-3">
                <Sparkles size={13} /> Hawky-generated brief · Estimated pilot impact
              </div>
              <div className="space-y-3">
                {actions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="action-option"
                    disabled={ad.status === "Paused" || (action.id === "pause" && !canPause)}
                    onClick={() => onAction(action.id)}
                  >
                    <action.icon className="text-insight mt-0.5" />
                    <div>
                      <div className="action-title">{action.title}</div>
                      <p className="action-copy">{action.copy}</p>
                      <span className="badge badge-muted mt-2">{action.estimate}</span>
                    </div>
                  </Button>
                ))}
              </div>
              {!canPause && ad.status !== "Paused" && (
                <p className="text-xs text-warning mt-3">
                  No other Keep / Scale ad is available to receive this budget.
                </p>
              )}
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-4">
                Actions simulate estimated results only. No campaigns, creative briefs, or website
                pages are changed externally.
              </p>
            </section>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
