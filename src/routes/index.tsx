import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShoppingBag,
  RotateCcw,
  Info,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  CircleCheck,
  CircleAlert,
  Video,
  Images,
  Image,
  Search,
  ChevronRight,
  Activity,
  Wallet,
  ChartNoAxesCombined,
  PackageOpen,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ReviewDrawer } from "@/components/dashboard/review-drawer";
import {
  initialAds,
  aggregate,
  economics,
  money,
  applyAction,
  type Ad,
  type Action,
  type Status,
} from "@/lib/profitability";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Breltz Bags × Hawky.ai — Net Profitability Intelligence" },
      {
        name: "description",
        content:
          "Explore true ad contribution margin, return diagnostics, and budget-preserving creative fixes in the Breltz Bags pilot dashboard.",
      },
      { property: "og:title", content: "Breltz Bags × Hawky.ai — Net Profitability Intelligence" },
      {
        property: "og:description",
        content:
          "An interactive pilot model for true net ROAS, product returns, and contribution margin recovery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
const baseline = aggregate(initialAds);
const statusClass = (s: Status) =>
  s === "Keep / Scale"
    ? "badge-success"
    : s === "Review" || s === "Guardrails Active"
      ? "badge-warning"
      : s === "Revision Sent"
        ? "badge-insight"
        : s === "PDP Fix Applied"
          ? "badge-teal"
          : "badge-muted";
const creativeIcons = { ugc: Video, reel: Video, carousel: Images, static: Image, search: Search };
function Index() {
  const [ads, setAds] = useState<Ad[]>(() => initialAds.map((a) => ({ ...a })));
  const [channel, setChannel] = useState("All");
  const [mode, setMode] = useState<"roas" | "profit">("roas");
  const [review, setReview] = useState<string>();
  const [notice, setNotice] = useState("");
  const visible = ads.filter(
    (a) => channel === "All" || (channel === "Meta" ? a.id !== "google" : a.id === "google"),
  );
  const total = aggregate(ads),
    current = aggregate(visible);
  const selected = ads.find((a) => a.id === review);
  const atRisk = ads.filter((a) => a.status === "Review").reduce((s, a) => s + a.spend, 0);
  const fixed = initialAds
    .filter((a) => a.status === "Review")
    .reduce((s, a) => s + (ads.find((r) => r.id === a.id)?.status !== "Review" ? a.spend : 0), 0);
  const data = visible.map((a) => ({
    name: a.short,
    gross: a.grossRoas,
    net: economics(a).netRoas,
    profit: economics(a).netProfit / 100000,
  }));
  function act(action: Action) {
    if (!selected) return;
    setAds((previous) => applyAction(previous, selected.id, action));
    setNotice(
      `${selected.name}: ${action === "pause" ? "budget reallocated — total spend protected" : action === "creative" ? "revision brief sent" : action === "pdp" ? "PDP fix applied" : "guardrails activated"}.`,
    );
    setReview(undefined);
  }
  function reset() {
    setAds(initialAds.map((a) => ({ ...a })));
    setChannel("All");
    setMode("roas");
    setReview(undefined);
    setNotice("Demo reset. Original pilot assumptions restored.");
  }
  return (
    <TooltipProvider>
      <div>
        <header className="app-topbar">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <ShoppingBag size={22} />
            </div>
            <div>
              <div className="font-bold text-base">
                Breltz Bags <span className="text-muted-foreground font-normal mx-1">×</span>{" "}
                <span className="text-insight">hawky.ai</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Net Profitability & Ad Return Intelligence
              </div>
            </div>
          </div>
          <div className="header-right flex items-center gap-5">
            <span className="badge badge-success">
              <span className="size-1.5 rounded-full bg-success" /> Live pilot workspace
            </span>
            <div className="border-l pl-5 text-[10px] text-muted-foreground">
              BRELTZ BAGS{" "}
              <span className="block text-foreground font-semibold mt-1">Executive overview</span>
            </div>
          </div>
        </header>
        <main className="main-shell">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-5">
            <span>Workspace</span>
            <ChevronRight size={11} />
            <span className="text-foreground">Profitability intelligence</span>
          </div>
          <div className="intro-controls flex justify-between items-center gap-4">
            <div>
              <div className="flex gap-3 items-center flex-wrap">
                <h1 className="page-heading">Beyond the ROAS.</h1>
                <span className="badge badge-warning">
                  <CircleAlert size={11} /> Sample Pilot Data Mode
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label="Assumptions / Pilot Model">
                      <Info size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs leading-6">
                    <strong>Assumptions / Pilot Model</strong>
                    <br />
                    Illustrative unit economics: ₹2,500 AOV · ₹875 COGS per kept order · ₹110
                    forward shipping per placed order · ₹190 reverse + QC per return · ₹120 average
                    seconds markdown loss per return.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                See what your ads actually earn. Fix the expectation gap. Protect your growth.
              </p>
            </div>
            <Button variant="outline" onClick={reset}>
              <RotateCcw /> Reset Demo
            </Button>
          </div>
          <div className="flex justify-between items-center gap-3 mt-6 flex-wrap">
            <div className="segmented" aria-label="Channel filters">
              {(["All", "Meta", "Google"] as const).map((c) => (
                <Button
                  size="sm"
                  variant="ghost"
                  key={c}
                  className={channel === c ? "segment-active" : ""}
                  aria-pressed={channel === c}
                  onClick={() => setChannel(c)}
                >
                  {c === "All" ? "All Channels" : `${c} Ads`}{" "}
                  <span className="text-muted-foreground text-[10px] ml-1">
                    (
                    {money(
                      ads
                        .filter(
                          (a) =>
                            c === "All" || (c === "Meta" ? a.id !== "google" : a.id === "google"),
                        )
                        .reduce((s, a) => s + a.spend, 0),
                    )}
                    )
                  </span>
                </Button>
              ))}
            </div>
            <span className="flex gap-1.5 items-center text-[10px] text-muted-foreground">
              <Activity size={12} />
              <span>Monthly view · Illustrative unit economics</span>
            </span>
          </div>
          <section className="kpi-grid" aria-label="Executive metrics">
            <div className="panel kpi">
              <div className="flex justify-between items-center">
                <span className="kpi-label">Total Monthly Ad Spend</span>
                <Wallet size={15} className="text-muted-foreground" />
              </div>
              <div className="kpi-value mt-4">{money(current.spend)}</div>
              <div className="kpi-note text-success">
                <ShieldCheck size={12} /> Growth Protected — ₹0 Budget Cut
              </div>
            </div>
            <div className="panel kpi">
              <div className="flex justify-between">
                <span className="kpi-label">Gross vs. True Net ROAS</span>
                <ChartNoAxesCombined size={15} className="text-muted-foreground" />
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div>
                  <div className="kpi-value text-muted-foreground">
                    {current.grossRoas.toFixed(2)}
                    <span className="text-lg">x</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1">GROSS DAY-1</div>
                </div>
                <ArrowRight size={17} className="text-muted-foreground" />
                <div>
                  <div className="kpi-value">
                    {current.netRoas.toFixed(2)}
                    <span className="text-lg">x</span>
                  </div>
                  <div className="text-[9px] text-success mt-1">AFTER RETURNS</div>
                </div>
              </div>
            </div>
            <div className="panel kpi">
              <div className="flex justify-between">
                <span className="kpi-label">Blended Return Rate</span>
                <PackageOpen size={15} className="text-muted-foreground" />
              </div>
              <div className="flex gap-3 items-center mt-4">
                <div
                  className={`kpi-value ${current.returnRate < 12 ? "text-success" : "text-danger"}`}
                >
                  {current.returnRate.toFixed(1)}
                  <span className="text-xl">%</span>
                </div>
                <span className="badge badge-muted">Target: &lt;12%</span>
              </div>
              <div className="kpi-note text-muted-foreground">
                Order-weighted · not an average of ads
              </div>
            </div>
            <div className="panel kpi">
              <div className="flex justify-between">
                <span className="kpi-label">True Net Contribution Margin</span>
                <Target size={15} className="text-muted-foreground" />
              </div>
              <div className="flex items-baseline gap-3 mt-4">
                <div
                  className={`kpi-value ${current.margin >= 15 ? "text-success" : "text-danger"}`}
                >
                  {current.margin.toFixed(1)}
                  <span className="text-xl">%</span>
                </div>
                <span className="font-bold text-sm">{money(current.profit)}</span>
              </div>
              <div className="kpi-note text-muted-foreground">
                Was {baseline.margin.toFixed(1)}% before fixes <span>· Target: ≥18%</span>
              </div>
            </div>
          </section>
          <div className="workspace">
            <section className="panel">
              <div className="panel-heading flex justify-between gap-3">
                <div>
                  <h2 className="panel-title">Ad Creative Profitability Breakdown</h2>
                  <p className="panel-subtitle">Day-1 performance is only half the story.</p>
                </div>
                <span className="badge badge-muted self-start">{visible.length} creatives</span>
              </div>
              <div className="table-scroll">
                <table className="ad-table">
                  <colgroup>
                    <col className="w-[29%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                    <col className="w-[13%]" />
                    <col className="w-[9%]" />
                    <col className="w-[13%]" />
                    <col className="w-[16%]" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>AD / CREATIVE</th>
                      <th>
                        MONTHLY
                        <br />
                        SPEND
                      </th>
                      <th>
                        GROSS
                        <br />
                        DAY-1 ROAS
                      </th>
                      <th>RETURN RATE</th>
                      <th>
                        NET
                        <br />
                        ROAS
                      </th>
                      <th>NET MARGIN</th>
                      <th>ACTION / STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((ad) => {
                      const e = economics(ad);
                      const Icon = creativeIcons[ad.kind];
                      return (
                        <tr key={ad.id} className={ad.status === "Paused" ? "opacity-50" : ""}>
                          <td>
                            <div className="flex items-start gap-2">
                              <div className="ad-icon">
                                <Icon
                                  size={15}
                                  className={
                                    ad.id === "google" ? "text-success" : "text-muted-foreground"
                                  }
                                />
                              </div>
                              <div>
                                <div className="ad-title">{ad.name}</div>
                                <span className="badge badge-muted mt-1 text-[8px] py-0.5 px-1">
                                  {ad.channel}
                                </span>
                                <div className="ad-subtitle">{ad.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="numeric font-semibold">{money(ad.spend)}</td>
                          <td className="numeric font-bold">{ad.grossRoas.toFixed(1)}x</td>
                          <td>
                            <span
                              className={`badge ${ad.returnRate > 20 ? "badge-danger" : ad.returnRate < 12 ? "badge-success" : "badge-warning"} numeric`}
                            >
                              {ad.returnRate}%
                            </span>
                            <input
                              type="range"
                              min={5}
                              max={50}
                              value={ad.returnRate}
                              disabled={ad.status === "Paused"}
                              aria-label={`${ad.name} return rate`}
                              className={`rate-slider ${ad.returnRate < 12 ? "healthy" : ""}`}
                              onChange={(event) =>
                                setAds((previous) =>
                                  previous.map((a) =>
                                    a.id === ad.id
                                      ? { ...a, returnRate: Number(event.target.value) }
                                      : a,
                                  ),
                                )
                              }
                            />
                          </td>
                          <td className="numeric font-bold">{e.netRoas.toFixed(2)}x</td>
                          <td>
                            <div
                              className={`font-bold numeric ${e.netMarginPct >= 15 ? "text-success" : e.netMarginPct < 10 ? "text-danger" : "text-warning"}`}
                            >
                              {money(e.netProfit)}
                            </div>
                            <span
                              className={`badge mt-1 numeric ${e.netMarginPct >= 15 ? "badge-success" : e.netMarginPct < 10 ? "badge-danger" : "badge-warning"}`}
                            >
                              {e.netMarginPct.toFixed(1)}%
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${statusClass(ad.status)} text-[8px]`}>
                              {ad.status === "Keep / Scale" && <ArrowUpRight size={10} />}{" "}
                              {ad.status}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-0 gap-1 text-[10px] mt-1"
                              aria-label={`Review ${ad.name}`}
                              onClick={() => setReview(ad.id)}
                            >
                              {ad.status === "Review" ? "Review" : "Inspect"}
                              <ChevronRight size={11} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <Info size={11} /> Net margin includes COGS, shipping, reverse logistics, markdowns
                & ad spend.
              </div>
            </section>
            <section className="panel flex flex-col">
              <div className="panel-heading">
                <h2 className="panel-title">The real performance picture</h2>
                <p className="panel-subtitle">High gross ROAS ≠ high profitability.</p>
                <div className="segmented mt-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`flex-1 text-[10px] ${mode === "roas" ? "segment-active" : ""}`}
                    aria-pressed={mode === "roas"}
                    onClick={() => setMode("roas")}
                  >
                    ROAS (Gross vs. Net)
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`flex-1 text-[10px] ${mode === "profit" ? "segment-active" : ""}`}
                    aria-pressed={mode === "profit"}
                    onClick={() => setMode("profit")}
                  >
                    Net Profit (₹ Lakhs)
                  </Button>
                </div>
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 12, right: 18, bottom: 5, left: -22 }}
                    barGap={4}
                  >
                    <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => (mode === "roas" ? `${v}x` : `₹${v}L`)}
                    />
                    <ChartTooltip
                      cursor={{ fill: "var(--muted)" }}
                      formatter={(v: number, name: string) => [
                        mode === "roas" ? `${v.toFixed(2)}x` : `₹${v.toFixed(2)}L`,
                        name,
                      ]}
                    />
                    {mode === "roas" && (
                      <Bar
                        name="Gross Day-1 ROAS"
                        dataKey="gross"
                        fill="var(--chart-gross)"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={27}
                        isAnimationActive={false}
                      />
                    )}
                    {mode === "roas" && (
                      <Bar
                        name="True Net ROAS"
                        dataKey="net"
                        fill="var(--chart-net)"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={27}
                        isAnimationActive={false}
                      />
                    )}
                    {mode === "profit" && (
                      <Bar
                        name="Net Contribution Profit"
                        dataKey="profit"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={36}
                        isAnimationActive={false}
                      >
                        {data.map((d) => (
                          <Cell
                            key={d.name}
                            fill={d.profit < 0 ? "var(--danger)" : "var(--success)"}
                          />
                        ))}
                      </Bar>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                {mode === "roas" ? (
                  <>
                    <span>
                      <i className="legend-dot" />
                      Gross Day-1 ROAS
                    </span>
                    <span>
                      <i className="legend-dot net" />
                      True Net ROAS
                    </span>
                  </>
                ) : (
                  <span>
                    <i className="legend-dot net" />
                    True Net Contribution Profit
                  </span>
                )}
              </div>
              <div className="insight-band mt-auto">
                <Sparkles size={17} className="text-insight shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-insight text-[10px] mb-1">THE HAWKY INSIGHT</div>
                  <p>
                    {ads.find((a) => a.id === "riya")?.status === "Review"
                      ? "Riya’s 4.5x ROAS masks the cost of 36% returns."
                      : ""}{" "}
                    <strong>Kept orders matter more than checkout revenue.</strong> Fix misleading
                    creative or redirect spend to high-intent ads.
                  </p>
                </div>
              </div>
            </section>
          </div>
          <section className="recovery">
            <div className="recovery-heading">
              <div className="flex gap-2 items-center">
                <TrendingUp size={17} className="text-success" />
                <h2 className="panel-title">Budget protected. Margin recovered.</h2>
              </div>
              <span className="badge badge-success">
                <ShieldCheck size={11} /> Zero Growth Sacrifice
              </span>
            </div>
            <div className="recovery-grid">
              <div className="recovery-cell">
                <div className="kpi-label">Spend Currently At Risk / Unfixed</div>
                <div className="recovery-value text-warning">{money(atRisk)}</div>
                <p className="text-[9px] text-muted-foreground mt-1">
                  Creatives still awaiting action
                </p>
              </div>
              <div className="recovery-cell">
                <div className="kpi-label">Spend Fixed or Reallocated</div>
                <div className="recovery-value text-success">{money(fixed)}</div>
                <p className="text-[9px] text-muted-foreground mt-1">
                  Original at-risk budget addressed
                </p>
              </div>
              <div className="recovery-cell">
                <div className="kpi-label">Projected Return Rate</div>
                <div className="recovery-value flex items-center gap-3">
                  <span className="text-muted-foreground">{baseline.returnRate.toFixed(1)}%</span>
                  <ArrowRight size={16} className="text-muted-foreground" />
                  <span className={total.returnRate < 12 ? "text-success" : "text-foreground"}>
                    {total.returnRate.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">Toward &lt;12% target</p>
              </div>
              <div className="recovery-cell">
                <div className="kpi-label">Projected Contribution Margin</div>
                <div className="recovery-value flex items-center gap-3">
                  <span className="text-muted-foreground">{baseline.margin.toFixed(1)}%</span>
                  <ArrowRight size={16} className="text-muted-foreground" />
                  <span className="text-success">{total.margin.toFixed(1)}%</span>
                </div>
                <progress
                  value={Math.max(0, total.margin)}
                  max={18}
                  aria-label="Contribution margin toward 18% target"
                />
                <p className="text-[9px] text-muted-foreground mt-1">
                  Target: ≥18% net contribution
                </p>
              </div>
            </div>
            <div className="recovery-foot">
              <CircleCheck size={13} />
              <strong>Total Spend Held Constant at {money(total.spend)}</strong>
              <span>— recover profit, not reduce ambition.</span>
            </div>
          </section>
          {notice && (
            <div role="status" className="text-xs text-success mt-4 flex items-center gap-2">
              <CircleCheck size={14} />
              {notice}
            </div>
          )}
          <footer className="footer">
            <span>BRELTZ BAGS × HAWKY.AI · CONFIDENTIAL PILOT WORKSPACE</span>
            <span>Sample Pilot Data Mode — Illustrative Unit Economics</span>
          </footer>
        </main>
        <ReviewDrawer
          ad={selected}
          onClose={() => setReview(undefined)}
          onAction={act}
          canPause={ads.some(
            (a) => a.id !== selected?.id && a.status === "Keep / Scale" && a.spend > 0,
          )}
        />
      </div>
    </TooltipProvider>
  );
}
