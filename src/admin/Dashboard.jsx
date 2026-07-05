import { useMemo } from "react";
import { getScannedOrders } from "../utils/orderUtils";
import {
  ShoppingBag,
  TrendingUp,
  Euro,
  Users,
  Clock,
  Star,
} from "lucide-react";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const allOrders = getScannedOrders();

  const stats = useMemo(() => {
    const today = allOrders.filter(
      (o) => (o.scannedAt || o.timestamp || "").slice(0, 10) === todayStr()
    );
    const todayRevenue = today.reduce((s, o) => s + o.total, 0);
    const allRevenue = allOrders.reduce((s, o) => s + o.total, 0);
    const avgOrder = allOrders.length ? allRevenue / allOrders.length : 0;

    // Item popularity across all orders
    const itemCounts = {};
    allOrders.forEach((o) =>
      o.items?.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
      })
    );
    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Orders by hour (today)
    const byHour = Array(24).fill(0);
    today.forEach((o) => {
      const h = new Date(o.scannedAt || o.timestamp).getHours();
      byHour[h]++;
    });
    const peakHours = byHour
      .map((count, h) => ({ h, count }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count);

    // Busy hours range for chart display (17-22 most relevant for food truck)
    const chartHours = Array.from({ length: 8 }, (_, i) => i + 15); // 15h-22h
    const maxCount = Math.max(...chartHours.map((h) => byHour[h]), 1);

    return {
      today,
      todayCount: today.length,
      todayRevenue,
      allCount: allOrders.length,
      allRevenue,
      avgOrder,
      topItems,
      byHour,
      chartHours,
      maxCount,
      peakHour: peakHours[0]?.h,
    };
  }, [allOrders]);

  const StatCard = ({ icon: Icon, label, value, sub, color = "text-marigold" }) => (
    <div className="bg-char-soft rounded-2xl p-5 border border-cream/5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-mute/60 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-char flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-mute/50 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="text-cream max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-marigold text-xs font-semibold uppercase tracking-widest mb-1">
          Aujourd'hui · {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-display text-3xl font-bold">Tableau de bord</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* <StatCard
          icon={ShoppingBag}
          label="Commandes aujourd'hui"
          value={stats.todayCount}
          sub={`${stats.allCount} au total`}
          color="text-marigold"
        />
        <StatCard
          icon={Euro}
          label="Recettes aujourd'hui"
          value={`${stats.todayRevenue.toFixed(2)}€`}
          sub={`${stats.allRevenue.toFixed(2)}€ au total`}
          color="text-herb"
        />
        <StatCard
          icon={TrendingUp}
          label="Panier moyen"
          value={`${stats.avgOrder.toFixed(2)}€`}
          sub="toutes commandes"
          color="text-marigold-light"
        />
        <StatCard
          icon={Clock}
          label="Heure de pointe"
          value={stats.peakHour !== undefined ? `${stats.peakHour}h` : "—"}
          sub="aujourd'hui"
          color="text-chili"
        /> */}

        <StatCard 
        icon={ShoppingBag} 
        label="Commandes aujourd'hui" 
        value={stats.todayCount} sub={`${stats.allCount} au total`} color="text-marigold" 
        />
        <StatCard 
        icon={TrendingUp} 
        label="Recettes aujourd'hui" 
        value={`${stats.todayRevenue.toFixed(2)}€`} 
        sub={`${stats.allRevenue.toFixed(2)}€ au total`} color="text-herb" 
        /> 
        <StatCard 
        icon={ShoppingBag} 
        label="Panier moyen" 
        value={`${stats.avgOrder.toFixed(2)}€`} 
        sub="toutes commandes" 
        color="text-marigold-light" 
        />
        <StatCard 
        icon={Clock} 
        label="Heure de pointe" 
        value={stats.peakHour !== undefined ? `${stats.peakHour}h` : "—"} sub="aujourd'hui" color="text-chili" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Orders by hour chart */}
        <div className="bg-char-soft rounded-2xl p-5 border border-cream/5">
          <h2 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
            <Clock size={16} className="text-marigold" />
            Commandes par heure
          </h2>
          {stats.todayCount === 0 ? (
            <div className="flex items-center justify-center h-32 text-mute/40 text-sm">
              Aucune commande aujourd'hui
            </div>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {stats.chartHours.map((h) => {
                const count = stats.byHour[h];
                const heightPct = (count / stats.maxCount) * 100;
                return (
                  <div key={h} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-mute/50 font-mono">
                      {count > 0 ? count : ""}
                    </span>
                    <div className="w-full flex flex-col justify-end" style={{ height: "80px" }}>
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          h === stats.peakHour ? "bg-chili" : "bg-marigold/60"
                        }`}
                        style={{ height: `${Math.max(heightPct, count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-mute/40 font-mono">{h}h</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top items */}
        <div className="bg-char-soft rounded-2xl p-5 border border-cream/5">
          <h2 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
            <Star size={16} className="text-marigold" />
            Articles les plus commandés
          </h2>
          {stats.topItems.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-mute/40 text-sm">
              Aucune donnée disponible
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topItems.map(([name, count], i) => {
                const max = stats.topItems[0][1];
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-cream truncate max-w-[75%]">{name}</span>
                      <span className="font-mono text-xs text-marigold font-semibold">{count}×</span>
                    </div>
                    <div className="h-1.5 bg-char rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          i === 0 ? "bg-marigold" : "bg-marigold/40"
                        }`}
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-char-soft rounded-2xl p-5 border border-cream/5">
        <h2 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
          <ShoppingBag size={16} className="text-marigold" />
          Commandes récentes
        </h2>
        {allOrders.length === 0 ? (
          <p className="text-mute/40 text-sm text-center py-8">
            Aucune commande scannée pour le moment.
          </p>
        ) : (
          <div className="space-y-2">
            {allOrders.slice(0, 8).map((order) => (
              <div
                key={order.orderId}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-char/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      order.status === "done" ? "bg-herb" : "bg-marigold animate-pulse"
                    }`}
                  />
                  <div>
                    <p className="font-mono text-xs text-mute/50">{order.orderId}</p>
                    <p className="text-sm text-cream">
                      {order.items?.length} article{order.items?.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-marigold">
                    {order.total.toFixed(2)}€
                  </p>
                  <p className="text-[10px] text-mute/40">
                    {new Date(order.scannedAt || order.timestamp).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
