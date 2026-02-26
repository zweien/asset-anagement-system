import { j as jsxRuntimeExports, P as Package, C as ChartColumn, F as FileText, a as cn, B as Button } from "./index-qNrbFx48.js";
import { S as Search } from "./search-BF8_zU4S.js";
import { m as motion } from "./proxy-DSWDMqPq.js";
const sizeConfig = {
  sm: {
    iconWrapper: "w-12 h-12",
    icon: "w-6 h-6",
    title: "text-base",
    description: "text-sm",
    padding: "py-8"
  },
  md: {
    iconWrapper: "w-16 h-16",
    icon: "w-8 h-8",
    title: "text-lg",
    description: "text-sm",
    padding: "py-12"
  },
  lg: {
    iconWrapper: "w-20 h-20",
    icon: "w-10 h-10",
    title: "text-xl",
    description: "text-base",
    padding: "py-16"
  }
};
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md"
}) {
  const config = sizeConfig[size];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, ease: "easeOut" },
      className: cn(
        "flex flex-col items-center justify-center text-center px-4",
        config.padding,
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { scale: 0.8, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            transition: { delay: 0.1, duration: 0.3, type: "spring", stiffness: 200 },
            className: cn(
              "rounded-full bg-muted flex items-center justify-center mb-4",
              config.iconWrapper
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("text-muted-foreground", config.icon) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.h3,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.15, duration: 0.2 },
            className: cn("font-semibold text-foreground mb-2", config.title),
            children: title
          }
        ),
        description && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.p,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.2, duration: 0.2 },
            className: cn("text-muted-foreground max-w-sm mb-6", config.description),
            children: description
          }
        ),
        action && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.25, duration: 0.2 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: action.onClick, variant: "default", children: action.label })
          }
        )
      ]
    }
  );
}
function EmptyAssets({ onAction, actionLabel, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    EmptyState,
    {
      icon: Package,
      title: "暂无资产数据",
      description: "开始添加您的第一个资产记录，或从 Excel/数据库导入现有数据",
      action: onAction ? { label: actionLabel || "添加资产", onClick: onAction } : void 0,
      className
    }
  );
}
function EmptySearch({ searchTerm, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    EmptyState,
    {
      icon: Search,
      title: "未找到匹配结果",
      description: searchTerm ? `没有找到与"${searchTerm}"相关的资产` : "没有找到符合条件的资产",
      size: "sm",
      className
    }
  );
}
function EmptyLogs({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    EmptyState,
    {
      icon: FileText,
      title: "暂无操作日志",
      description: "系统操作记录将显示在这里",
      size: "sm",
      className
    }
  );
}
function EmptyReports({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    EmptyState,
    {
      icon: ChartColumn,
      title: "暂无报表数据",
      description: "添加资产后将自动生成统计报表",
      size: "sm",
      className
    }
  );
}
export {
  EmptyLogs as E,
  EmptyReports as a,
  EmptySearch as b,
  EmptyAssets as c
};
