import { c as createLucideIcon, u as useTranslation, r as reactExports, g as assetApi, l as logApi, P as Package, D as Database, j as jsxRuntimeExports, B as Button, e as Link } from "./index-qNrbFx48.js";
import { P as PageInstructions, C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./PageInstructions-CytTlGL7.js";
import { D as DashboardSkeleton } from "./SkeletonLoaders-Dt4N1q7G.js";
import { C as CircleAlert } from "./circle-alert-G27zpDpf.js";
import { m as motion } from "./proxy-DSWDMqPq.js";
import "./table-CVXuarik.js";
const __iconNode = [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode);
function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = reactExports.useState({
    totalAssets: 0,
    monthlyNew: 0,
    importRecords: 0,
    pending: 0
  });
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    loadStats();
  }, []);
  const loadStats = async () => {
    try {
      setLoading(true);
      const assetsRes = await assetApi.getAll({ pageSize: 1 });
      const totalAssets = assetsRes.data?.total || 0;
      const now = /* @__PURE__ */ new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRes = await assetApi.getAll({
        pageSize: 1,
        filters: JSON.stringify({
          createdAt: {
            operator: "gte",
            value: firstDayOfMonth.toISOString()
          }
        })
      });
      const monthlyNew = monthlyRes.data?.total || 0;
      const logsRes = await logApi.getAll({ action: "IMPORT", pageSize: 1 });
      const importRecords = logsRes.data?.total || 0;
      const idleRes = await assetApi.getAll({ status: "IDLE", pageSize: 1 });
      const pending = idleRes.data?.total || 0;
      setStats({
        totalAssets,
        monthlyNew,
        importRecords,
        pending
      });
    } catch (err) {
      console.error("加载统计数据失败:", err);
    } finally {
      setLoading(false);
    }
  };
  const statItems = [
    { label: t("dashboard.totalAssets"), value: stats.totalAssets, icon: Package, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { label: t("dashboard.monthlyNew"), value: stats.monthlyNew, icon: TrendingUp, color: "text-green-500", bgColor: "bg-green-500/10" },
    { label: t("dashboard.importRecords"), value: stats.importRecords, icon: Database, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { label: t("dashboard.idleAssets"), value: stats.pending, icon: CircleAlert, color: "text-orange-500", bgColor: "bg-orange-500/10" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground", children: t("dashboard.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: t("dashboard.subtitle") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageInstructions,
      {
        title: t("dashboard.instructions.title"),
        instructions: [
          t("dashboard.instructions.1"),
          t("dashboard.instructions.2"),
          t("dashboard.instructions.3")
        ]
      }
    ),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardSkeleton, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: statItems.map((stat) => {
      const Icon = stat.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          whileHover: { y: -2, transition: { duration: 0.15 } },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "transition-shadow hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-3 rounded-lg ${stat.bgColor}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `w-6 h-6 ${stat.color}` }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: stat.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-foreground", children: stat.value })
            ] })
          ] }) }) })
        },
        stat.label
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: t("dashboard.quickActions") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        { to: "/assets", icon: Package, label: t("dashboard.manageAssets") },
        { to: "/import", icon: Database, label: t("dashboard.importData") },
        { to: "/settings", icon: TrendingUp, label: t("dashboard.configureFields") }
      ].map((action) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              asChild: true,
              className: "w-full h-auto py-4 justify-start",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: action.to, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(action.icon, { className: "w-5 h-5 mr-3 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: action.label })
              ] })
            }
          )
        },
        action.to
      )) }) })
    ] })
  ] });
}
export {
  Dashboard
};
