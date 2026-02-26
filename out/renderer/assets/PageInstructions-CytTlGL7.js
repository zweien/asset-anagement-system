import { c as createLucideIcon, j as jsxRuntimeExports, a as cn, r as reactExports, B as Button, X } from "./index-qNrbFx48.js";
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
];
const Info = createLucideIcon("info", __iconNode);
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      ),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn("leading-none font-semibold", className),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6", className),
      ...props
    }
  );
}
function PageInstructions({ title, instructions, storageKey }) {
  const key = storageKey || `page-instructions-${title}`;
  const [isVisible, setIsVisible] = reactExports.useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(key);
    return stored === null ? true : stored === "true";
  });
  const handleToggle = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    localStorage.setItem(key, String(newValue));
  };
  if (!isVisible) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: handleToggle,
        className: "text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 mr-1" }),
          "显示使用说明"
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-6 border-border/50 bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-foreground", children: title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-sm text-muted-foreground space-y-1", children: instructions.map((instruction, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary mt-0.5", children: "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: instruction })
      ] }, index)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "ghost",
        size: "icon-xs",
        onClick: handleToggle,
        className: "text-muted-foreground hover:text-foreground shrink-0",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
      }
    )
  ] }) }) });
}
export {
  Card as C,
  PageInstructions as P,
  CardContent as a,
  CardHeader as b,
  CardTitle as c
};
