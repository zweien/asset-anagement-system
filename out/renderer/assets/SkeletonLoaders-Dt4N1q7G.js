import { j as jsxRuntimeExports, a as cn } from "./index-qNrbFx48.js";
import { C as Card, a as CardContent, b as CardHeader } from "./PageInstructions-CytTlGL7.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CVXuarik.js";
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "skeleton",
      className: cn("bg-accent animate-pulse rounded-md", className),
      ...props
    }
  );
}
function StatCardSkeleton({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: cn("animate-pulse", className), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-24" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-16" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-20" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14 w-14 rounded-full" })
  ] }) }) });
}
function TableSkeleton({ rows = 5, columns = 4 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: Array.from({ length: columns }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20" }) }, i)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: Array.from({ length: columns }).map((_2, j) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }) }, j)) }, i)) })
  ] });
}
function CardSkeleton({ showHeader = true, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: cn("animate-pulse", className), children: [
    showHeader && /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-1/3" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/5" })
    ] })
  ] });
}
function DashboardSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatCardSkeleton, {}, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardSkeleton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardSkeleton, {})
    ] })
  ] });
}
export {
  DashboardSkeleton as D,
  TableSkeleton as T
};
