import {
  Sparkles,
  Image,
  PanelsTopLeft,
  ShieldCheck,
  ArrowRightLeft,
  CircleCheck,
  TriangleAlert,
  ArrowLeft,
  Copy,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { economics, money, type Ad, type Action } from "@/lib/profitability";
type Props = {
  ad: Ad | undefined;
  onClose: () => void;
  onAction: (action: Action) => void;
  onApprove: () => void;
  onReject: () => void;
  onRevise: (brief: string) => void;
  canPause: boolean;
};
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
export function ReviewDrawer(props: Props) {
  const { ad, onClose } = props;
  return (
    <Sheet
      open={Boolean(ad)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="drawer-content">
        {ad &&
          (ad.isDraft ? (
            <SpecGate key={ad.id} {...props} ad={ad} />
          ) : (
            <LiveReview key={ad.id} {...props} ad={ad} />
          ))}
      </SheetContent>
    </Sheet>
  );
}
function SpecGate({ ad, onApprove, onReject }: Props & { ad: Ad }) {
  const items = ad.specChecklist ?? [];
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const count = checked.filter(Boolean).length;
  const findings = ad.autoScanFindings ?? [];
  const open = ad.status === "Pending Product Check" || ad.status === "Changes Requested";
  return (
    <>
      <SheetHeader>
        <div className="eyebrow text-insight flex gap-2 items-center">
          <ShieldCheck size={14} /> Pre-Launch Spec Gate
        </div>
        <SheetTitle className="pr-7 text-xl">{ad.name}</SheetTitle>
        <SheetDescription>
          {ad.channel} · {ad.sku} · {ad.status}
        </SheetDescription>
      </SheetHeader>
      <section className="drawer-section">
        <h2 className="drawer-label">01 / Hawky Auto-Scan vs. Shopify SKU Truth</h2>
        {findings.length ? (
          <div
            role="alert"
            className="bg-warning-soft text-warning p-3 rounded-md text-xs leading-relaxed"
          >
            <div className="flex items-center gap-2 font-bold mb-2">
              <TriangleAlert size={15} /> {findings.length} spec conflicts found
            </div>
            <ul className="list-disc pl-5 space-y-1.5">
              {findings.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-success-soft text-success p-3 rounded-md text-xs flex items-center gap-2">
            <CircleCheck size={15} /> <strong>Hawky Auto-Scan Passed</strong>
          </div>
        )}
      </section>
      <section className="drawer-section">
        <div className="flex justify-between items-center gap-3 mb-3">
          <h2 className="drawer-label mb-0">02 / 2-Minute Product Team Sign-Off</h2>
          <span className={`badge ${count === items.length ? "badge-success" : "badge-muted"}`}>
            {count} of {items.length} verified
          </span>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <label
              key={item}
              className="flex items-start gap-3 text-xs leading-relaxed cursor-pointer"
            >
              <Checkbox
                className="mt-0.5"
                checked={checked[i] === true}
                disabled={!open}
                onCheckedChange={(v) =>
                  setChecked((c) => c.map((x, j) => (j === i ? v === true : x)))
                }
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        {open ? (
          <div className="flex flex-col gap-2 mt-5">
            <Button disabled={count < items.length} onClick={onApprove}>
              <CircleCheck /> Approve for Launch
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await copyText(ad.whatsappRejectNote ?? "");
                onReject();
              }}
            >
              <X /> Reject & Copy WhatsApp Fix Note
            </Button>
          </div>
        ) : (
          <p className="text-xs text-success mt-4">
            Approved — this creative is live in an A/B test.
          </p>
        )}
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-4">
          Simulation only. No ads are launched and no messages are sent externally.
        </p>
      </section>
    </>
  );
}
function LiveReview({ ad, onAction, onRevise, canPause }: Props & { ad: Ad }) {
  const [step, setStep] = useState<"actions" | "revise">("actions");
  const [brief, setBrief] = useState(ad.brief);
  const [copied, setCopied] = useState(false);
  const e = economics(ad);
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
  const top = ad.complaints[0];
  return (
    <>
      <SheetHeader>
        <div className="eyebrow text-insight flex gap-2 items-center">
          <Sparkles size={14} /> Creative intelligence
        </div>
        <SheetTitle className="pr-7 text-xl">{ad?.name}</SheetTitle>
        <SheetDescription>
          {ad?.channel} · {ad?.sku}
        </SheetDescription>
      </SheetHeader>
      {
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
                {money(e.netProfit)} <span className="text-xs">({e.netMarginPct.toFixed(1)}%)</span>
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
          {step === "revise" ? (
            <section className="drawer-section">
              <Button
                variant="ghost"
                size="sm"
                className="px-0 mb-2"
                onClick={() => setStep("actions")}
              >
                <ArrowLeft /> Back to all actions
              </Button>
              <h2 className="drawer-label">Confirm Creative Revision & 14-Day Test</h2>
              {top && (
                <div className="bg-insight-soft text-insight p-3 rounded-md text-xs mb-4">
                  <strong>{top[1]}%</strong> — {top[0]}
                </div>
              )}
              <label className="text-xs font-bold block mb-2" htmlFor="revision-brief">
                Revision brief
              </label>
              <Textarea
                id="revision-brief"
                rows={5}
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
              />
              <div className="flex flex-wrap gap-2 my-4">
                {[
                  "50/50 Split Test (v1 vs. v2)",
                  "14-Day Return Window",
                  "Queues v2 to Product Gate",
                ].map((p) => (
                  <span key={p} className="badge badge-muted">
                    {p}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    await copyText(
                      `*Creative revision: ${ad.name}*\nTop complaint: ${top ? `${top[1]}% — ${top[0]}` : "n/a"}\n\n${brief}\n\nTest: 50/50 split (v1 vs. v2), 14-day return window. v2 goes to Product Gate before spend.`,
                    );
                    setCopied(true);
                  }}
                >
                  <Copy /> {copied ? "Copied Brief for WhatsApp" : "Copy for WhatsApp"}
                </Button>
                <Button onClick={() => onRevise(brief)}>
                  <Send /> Send Brief & Queue v2 for Product Check
                </Button>
              </div>
            </section>
          ) : (
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
                    onClick={() =>
                      action.id === "creative" ? setStep("revise") : onAction(action.id)
                    }
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
          )}
        </>
      }
    </>
  );
}
