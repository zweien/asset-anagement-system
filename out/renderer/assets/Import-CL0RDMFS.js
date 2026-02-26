import { c as createLucideIcon, u as useTranslation, r as reactExports, j as jsxRuntimeExports, D as Database, A as API_BASE_URL, s as CircleX, t as api, v as dbImportApi, p as fieldApi } from "./index-qNrbFx48.js";
import { P as PageInstructions } from "./PageInstructions-CytTlGL7.js";
import { C as CircleAlert } from "./circle-alert-G27zpDpf.js";
import { D as Download } from "./download-J3QrLKzy.js";
import { U as Upload } from "./upload-E5mF9rXr.js";
const __iconNode$3 = [
  ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const CircleCheckBig = createLucideIcon("circle-check-big", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M8 13h2", key: "yr2amv" }],
  ["path", { d: "M14 13h2", key: "un5t4a" }],
  ["path", { d: "M8 17h2", key: "2yhykz" }],
  ["path", { d: "M14 17h2", key: "10kma7" }]
];
const FileSpreadsheet = createLucideIcon("file-spreadsheet", __iconNode$2);
const __iconNode$1 = [
  ["rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2", key: "ngkwjq" }],
  ["rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2", key: "iecqi9" }],
  ["line", { x1: "6", x2: "6.01", y1: "6", y2: "6", key: "16zg32" }],
  ["line", { x1: "6", x2: "6.01", y1: "18", y2: "18", key: "nzw8ys" }]
];
const Server = createLucideIcon("server", __iconNode$1);
const __iconNode = [
  ["path", { d: "M12 3v18", key: "108xh3" }],
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M3 9h18", key: "1pudct" }],
  ["path", { d: "M3 15h18", key: "5xshup" }]
];
const Table = createLucideIcon("table", __iconNode);
function Import() {
  const { t } = useTranslation();
  const [importType, setImportType] = reactExports.useState("excel");
  const [step, setStep] = reactExports.useState(1);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [fields, setFields] = reactExports.useState([]);
  const [parsedData, setParsedData] = reactExports.useState(null);
  const [mapping, setMapping] = reactExports.useState([]);
  const [importResult, setImportResult] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  const [dbConfig, setDbConfig] = reactExports.useState({
    type: "mysql",
    host: "localhost",
    port: 3306,
    database: "",
    username: "",
    password: ""
  });
  const [dbConnected, setDbConnected] = reactExports.useState(false);
  const [tables, setTables] = reactExports.useState([]);
  const [selectedTable, setSelectedTable] = reactExports.useState("");
  const [tablePreview, setTablePreview] = reactExports.useState([]);
  const [dbMapping, setDbMapping] = reactExports.useState([]);
  const [dbImportResult, setDbImportResult] = reactExports.useState(null);
  const loadFields = async () => {
    const result = await fieldApi.getAll();
    if (result.success) {
      setFields(result.data);
    }
  };
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/import/parse", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.success) {
        setParsedData(response.data);
        await loadFields();
        setStep(2);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("import.parseFailed"));
    } finally {
      setLoading(false);
    }
  };
  const updateMapping = (excelColumn, fieldId, fieldName) => {
    setMapping((prev) => {
      const filtered = prev.filter((m) => m.excelColumn !== excelColumn);
      if (fieldId) {
        return [...filtered, { excelColumn, fieldId, fieldName }];
      }
      return filtered;
    });
  };
  const executeImport = async () => {
    if (!parsedData || mapping.length === 0) {
      setError(t("import.configureMapping"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/import/execute", {
        rows: parsedData.preview,
        mapping
      });
      if (response.success) {
        setImportResult(response.data);
        setStep(3);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("import.importError"));
    } finally {
      setLoading(false);
    }
  };
  const reset = () => {
    setStep(1);
    setParsedData(null);
    setMapping([]);
    setImportResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const testDbConnection = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await dbImportApi.testConnection(dbConfig);
      if (result.success) {
        setDbConnected(true);
        const tablesResult = await dbImportApi.getTables(dbConfig);
        if (tablesResult.success && tablesResult.data) {
          setTables(tablesResult.data);
        }
        await loadFields();
      } else {
        setError(result.error || t("import.connectionFailed"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("import.connectionFailed"));
    } finally {
      setLoading(false);
    }
  };
  const loadTablePreview = async (tableName) => {
    setLoading(true);
    try {
      const result = await dbImportApi.previewData(dbConfig, tableName);
      if (result.success && result.data) {
        setTablePreview(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("import.previewFailed"));
    } finally {
      setLoading(false);
    }
  };
  const executeDbImport = async () => {
    if (!selectedTable || dbMapping.length === 0) {
      setError(t("import.selectTableAndMapping"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await dbImportApi.importData(dbConfig, selectedTable, dbMapping);
      if (result.success && result.data) {
        setDbImportResult(result.data);
      } else {
        setError(result.error || t("import.importError"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("import.importError"));
    } finally {
      setLoading(false);
    }
  };
  const resetDb = () => {
    setDbConnected(false);
    setTables([]);
    setSelectedTable("");
    setTablePreview([]);
    setDbMapping([]);
    setDbImportResult(null);
    setError("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground", children: t("import.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: t("import.subtitle") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageInstructions,
      {
        title: t("import.instructions.title"),
        instructions: [
          t("import.instructions.1"),
          t("import.instructions.2"),
          t("import.instructions.3"),
          t("import.instructions.4"),
          t("import.instructions.5")
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border-b border-gray-200 dark:border-gray-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setImportType("excel"),
          className: `px-6 py-3 text-sm font-medium border-b-2 transition-colors ${importType === "excel" ? "border-primary-500 text-primary-600 dark:text-primary-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "w-4 h-4 inline mr-2" }),
            t("import.excelImport")
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setImportType("database"),
          className: `px-6 py-3 text-sm font-medium border-b-2 transition-colors ${importType === "database" ? "border-primary-500 text-primary-600 dark:text-primary-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "w-4 h-4 inline mr-2" }),
            t("import.databaseImport")
          ]
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4" }),
      error
    ] }),
    importType === "excel" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4", children: [1, 2, 3].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? "bg-primary text-primary-foreground" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`,
            children: step > s ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-5 h-5" }) : s
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm ${step >= s ? "text-gray-900 dark:text-white" : "text-gray-500"}`, children: s === 1 ? t("import.step1") : s === 2 ? t("import.step2") : t("import.step3") }),
        s < 3 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-px bg-gray-300 dark:bg-gray-700" })
      ] }, s)) }),
      step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: t("import.uploadExcel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => window.open(`${API_BASE_URL}/import/template`, "_blank"),
              className: "flex items-center gap-2 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
                t("import.downloadTemplate")
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: () => fileInputRef.current?.click(),
            className: "border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center cursor-pointer hover:border-primary-500 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-2", children: t("import.dragDrop") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: t("import.supportedFormats") })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: ".xlsx,.xls",
            onChange: handleFileUpload,
            className: "hidden"
          }
        ),
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-center text-gray-500", children: t("import.parsing") })
      ] }),
      step === 2 && parsedData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: t("import.mapping") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: t("import.rowCount", { count: parsedData.total }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200 dark:border-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left text-gray-500", children: t("import.excelColumn") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left text-gray-500", children: t("import.mapToField") }),
              parsedData.headers.slice(0, 3).map((header) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left text-gray-500", children: header }, header))
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: parsedData.headers.map((header) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 dark:border-gray-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-medium text-gray-900 dark:text-white", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "w-4 h-4 inline mr-2" }),
                header
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: mapping.find((m) => m.excelColumn === header)?.fieldId || "",
                  onChange: (e) => {
                    const option = e.target.selectedOptions[0];
                    updateMapping(header, e.target.value, option?.textContent || "");
                  },
                  className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t("import.noMapping") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__name__", children: t("assets.assetName") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__code__", children: t("assets.assetCode") }),
                    fields.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: field.id, children: field.label }, field.id))
                  ]
                }
              ) }),
              parsedData.preview.slice(0, 3).map((row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600 dark:text-gray-400", children: String(row[header] || "-").slice(0, 20) }, idx))
            ] }, header)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: reset, className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600", children: t("import.reUpload") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: executeImport,
              disabled: loading || mapping.length === 0,
              className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50",
              children: loading ? t("import.importing") : t("import.startImport")
            }
          )
        ] })
      ] }),
      step === 3 && importResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
          importResult.success ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-16 h-16 mx-auto text-green-500 mb-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-16 h-16 mx-auto text-red-500 mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-2", children: importResult.success ? t("import.importComplete") : t("import.importError") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: importResult.total }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: t("import.total") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-600", children: importResult.imported }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: t("import.success") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-600", children: importResult.skipped }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: t("import.skipped") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: reset, className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg", children: t("import.continueImport") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => window.location.href = "/assets", className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg", children: t("import.viewAssetList") })
        ] })
      ] })
    ] }),
    importType === "database" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      !dbImportResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "w-5 h-5 inline mr-2" }),
          t("import.dbConnection")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("import.dbType") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: dbConfig.type,
                onChange: (e) => setDbConfig({ ...dbConfig, type: e.target.value, port: e.target.value === "mysql" ? 3306 : 5432 }),
                className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "mysql", children: "MySQL" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "postgresql", children: "PostgreSQL" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("import.dbHost") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: dbConfig.host,
                onChange: (e) => setDbConfig({ ...dbConfig, host: e.target.value }),
                placeholder: "localhost",
                className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("import.dbPort") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: dbConfig.port,
                onChange: (e) => setDbConfig({ ...dbConfig, port: parseInt(e.target.value) || 3306 }),
                className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("import.dbName") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: dbConfig.database,
                onChange: (e) => setDbConfig({ ...dbConfig, database: e.target.value }),
                className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("import.dbUsername") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: dbConfig.username,
                onChange: (e) => setDbConfig({ ...dbConfig, username: e.target.value }),
                className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("import.dbPassword") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "password",
                value: dbConfig.password,
                onChange: (e) => setDbConfig({ ...dbConfig, password: e.target.value }),
                className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: testDbConnection,
              disabled: loading || !dbConfig.host || !dbConfig.database,
              className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50",
              children: loading ? t("import.connecting") : t("import.testConnection")
            }
          ),
          dbConnected && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center text-green-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 mr-1" }),
            t("import.connectionSuccess")
          ] })
        ] })
      ] }),
      dbConnected && tables.length > 0 && !dbImportResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { className: "w-5 h-5 inline mr-2" }),
          t("import.selectTable")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: tables.map((table) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setSelectedTable(table.name);
                loadTablePreview(table.name);
              },
              className: `w-full text-left px-4 py-3 rounded-lg border transition-colors ${selectedTable === table.name ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: table.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: t("import.tableRows", { count: table.rowCount }) })
              ]
            },
            table.name
          )) }),
          selectedTable && tablePreview.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-gray-900 dark:text-white mb-3", children: t("import.mapping") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200 dark:border-gray-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left text-gray-500", children: t("import.sourceField") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left text-gray-500", children: t("import.fieldType") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left text-gray-500", children: t("import.mapTo") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left text-gray-500", children: t("import.sampleValue") })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: Object.keys(tablePreview[0]).map((column) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 dark:border-gray-800", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium text-gray-900 dark:text-white", children: column }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-500", children: tables.find((t2) => t2.name === selectedTable)?.columns.find((c) => c.name === column)?.type || "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: dbMapping.find((m) => m.sourceColumn === column)?.targetField || "",
                    onChange: (e) => {
                      setDbMapping((prev) => {
                        const filtered = prev.filter((m) => m.sourceColumn !== column);
                        if (e.target.value) {
                          return [...filtered, { sourceColumn: column, targetField: e.target.value }];
                        }
                        return filtered;
                      });
                    },
                    className: "px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t("import.noMapping") }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "name", children: t("assets.assetName") }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "code", children: t("assets.assetCode") }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "status", children: t("assets.status") }),
                      fields.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: field.name, children: field.label }, field.id))
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-500 truncate max-w-32", children: String(tablePreview[0][column] || "-").slice(0, 20) })
              ] }, column)) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex justify-end gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: resetDb, className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg", children: t("import.reConnect") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: executeDbImport,
                  disabled: loading || dbMapping.length === 0,
                  className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50",
                  children: loading ? t("import.importing") : t("import.startImport")
                }
              )
            ] })
          ] })
        ] })
      ] }),
      dbImportResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-16 h-16 mx-auto text-green-500 mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-2", children: t("import.importComplete") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: dbImportResult.total }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: t("import.total") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-600", children: dbImportResult.imported }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: t("import.success") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-600", children: dbImportResult.failed }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: t("import.failed") })
          ] })
        ] }),
        dbImportResult.errors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-gray-900 dark:text-white mb-2", children: t("import.errorDetails") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-40 overflow-y-auto text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg p-3", children: dbImportResult.errors.map((err, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: err }, idx)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: resetDb, className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg", children: t("import.continueImport") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => window.location.href = "/assets", className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg", children: t("import.viewAssetList") })
        ] })
      ] })
    ] })
  ] });
}
export {
  Import
};
