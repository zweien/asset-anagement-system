import { u as useTranslation, r as reactExports, l as logApi, j as jsxRuntimeExports, L as LOG_ACTION_LABELS } from "./index-qNrbFx48.js";
import { E as EmptyLogs } from "./EmptyState-C7jBXoff.js";
import "./search-BF8_zU4S.js";
import "./proxy-DSWDMqPq.js";
function Logs() {
  const { t } = useTranslation();
  const ENTITY_TYPE_LABELS = {
    Asset: t("logs.entityAsset"),
    FieldConfig: t("logs.entityFieldConfig"),
    Category: t("logs.entityCategory"),
    User: t("logs.entityUser")
  };
  const [loading, setLoading] = reactExports.useState(true);
  const [logs, setLogs] = reactExports.useState([]);
  const [total, setTotal] = reactExports.useState(0);
  const [page, setPage] = reactExports.useState(1);
  const [pageSize] = reactExports.useState(20);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [filterAction, setFilterAction] = reactExports.useState("");
  const [filterEntityType, setFilterEntityType] = reactExports.useState("");
  const [filterStartDate, setFilterStartDate] = reactExports.useState("");
  const [filterEndDate, setFilterEndDate] = reactExports.useState("");
  const [selectedLog, setSelectedLog] = reactExports.useState(null);
  reactExports.useEffect(() => {
    loadLogs();
  }, [page, filterAction, filterEntityType, filterStartDate, filterEndDate]);
  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = { page, pageSize };
      if (filterAction) params.action = filterAction;
      if (filterEntityType) params.entityType = filterEntityType;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      const response = await logApi.getAll(params);
      if (response.success) {
        setLogs(response.data.data);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      console.error(t("logs.loadFailed"), err);
    } finally {
      setLoading(false);
    }
  };
  const handleClearFilters = () => {
    setFilterAction("");
    setFilterEntityType("");
    setFilterStartDate("");
    setFilterEndDate("");
    setPage(1);
  };
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };
  const getActionColor = (action) => {
    const colors = {
      CREATE: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
      UPDATE: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
      DELETE: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
      IMPORT: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
      EXPORT: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
      LOGIN: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400",
      LOGOUT: "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400"
    };
    return colors[action] || "";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: t("logs.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-gray-500 dark:text-gray-400", children: t("logs.subtitle") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("logs.action") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filterAction,
            onChange: (e) => {
              setFilterAction(e.target.value);
              setPage(1);
            },
            className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t("common.all") }),
              Object.entries(LOG_ACTION_LABELS).map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value, children: label }, value))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("logs.entity") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filterEntityType,
            onChange: (e) => {
              setFilterEntityType(e.target.value);
              setPage(1);
            },
            className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t("common.all") }),
              Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value, children: label }, value))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("logs.startDate") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: filterStartDate,
            onChange: (e) => {
              setFilterStartDate(e.target.value);
              setPage(1);
            },
            className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("logs.endDate") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: filterEndDate,
            onChange: (e) => {
              setFilterEndDate(e.target.value);
              setPage(1);
            },
            className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleClearFilters,
          className: "w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
          children: t("assets.clearFilters")
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: t("common.loading") }) }) : logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyLogs, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: t("logs.time") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: t("logs.action") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: t("logs.entity") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: t("logs.operator") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: t("logs.ipAddress") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: t("common.actions") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: logs.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap", children: formatDate(log.createdAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                log.action
              )}`,
              children: LOG_ACTION_LABELS[log.action] || log.action
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-gray-900 dark:text-white", children: ENTITY_TYPE_LABELS[log.entityType] || log.entityType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-gray-900 dark:text-white", children: log.userName || "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-gray-500 dark:text-gray-400", children: log.ip || "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setSelectedLog(log),
              className: "text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
              children: t("logs.details")
            }
          ) })
        ] }, log.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: t("logs.totalRecords", { count: total }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setPage(Math.max(1, page - 1)),
              disabled: page === 1,
              className: "px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed",
              children: t("logs.prevPage")
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1 text-sm text-gray-700 dark:text-gray-300", children: [
            page,
            " / ",
            totalPages
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setPage(Math.min(totalPages, page + 1)),
              disabled: page === totalPages,
              className: "px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed",
              children: t("logs.nextPage")
            }
          )
        ] })
      ] })
    ] }) }),
    selectedLog && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: t("logs.detailTitle") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSelectedLog(null),
            className: "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 overflow-y-auto max-h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t("logs.time") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-white", children: formatDate(selectedLog.createdAt) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t("logs.actionType") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                selectedLog.action
              )}`,
              children: LOG_ACTION_LABELS[selectedLog.action] || selectedLog.action
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t("logs.entity") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-white", children: ENTITY_TYPE_LABELS[selectedLog.entityType] || selectedLog.entityType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t("logs.entityId") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-white font-mono", children: selectedLog.entityId || "-" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t("logs.operator") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "mt-1 text-sm text-gray-900 dark:text-white", children: [
            selectedLog.userName || "-",
            " (",
            selectedLog.userId || t("logs.unknown"),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t("logs.ipAddress") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-white", children: selectedLog.ip || "-" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t("logs.userAgent") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-white break-all", children: selectedLog.userAgent || "-" })
        ] }),
        selectedLog.oldValue && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t("logs.oldValue") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-900 dark:text-white overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: JSON.stringify(JSON.parse(selectedLog.oldValue), null, 2) }) })
        ] }),
        selectedLog.newValue && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: t("logs.newValue") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-900 dark:text-white overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: JSON.stringify(JSON.parse(selectedLog.newValue), null, 2) }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end p-4 border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSelectedLog(null),
          className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
          children: t("common.cancel")
        }
      ) })
    ] }) })
  ] });
}
export {
  Logs
};
