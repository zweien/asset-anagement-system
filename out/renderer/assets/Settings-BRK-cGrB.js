import { c as createLucideIcon, u as useTranslation, r as reactExports, w as getStoredUser, x as hasPermission, j as jsxRuntimeExports, y as API_BASE$1, z as Label, B as Button, I as Input, s as CircleX, E as LoaderCircle, k as Dialog, n as DialogContent, H as DialogHeader, J as DialogTitle, p as fieldApi, K as systemConfigApi, M as showError, N as showSuccess, O as FIELD_TYPES, X, Q as showWarning } from "./index-qNrbFx48.js";
import { S as Sparkles, B as Badge, E as EyeOff, a as Eye, b as aiApi, T as Textarea } from "./badge-BzfgTWgD.js";
import { P as PageInstructions, C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./PageInstructions-CytTlGL7.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CVXuarik.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, P as Plus } from "./select-BQGUkUaU.js";
import { I as Image, S as Save } from "./save-DtqDW5w_.js";
import { U as Upload } from "./upload-E5mF9rXr.js";
import { P as Pencil } from "./pencil-CD2tTnb8.js";
import { T as Trash2 } from "./trash-2-pYsdSWY6.js";
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode$3);
const __iconNode$2 = [
  ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }],
  ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }],
  ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }],
  ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
  ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }],
  ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]
];
const GripVertical = createLucideIcon("grip-vertical", __iconNode$2);
const __iconNode$1 = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
const Lock = createLucideIcon("lock", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ]
];
const Shield = createLucideIcon("shield", __iconNode);
const API_BASE = API_BASE$1;
const AI_PROVIDERS = [
  {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    models: ["deepseek-chat", "deepseek-coder", "deepseek-reasoner"],
    description: "DeepSeek AI - 高性价比的国产大模型",
    apiKeyPlaceholder: "sk-xxxxxxxxxxxxxxxx"
  },
  {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1", "o1-mini", "o1-preview"],
    description: "OpenAI GPT 系列模型",
    apiKeyPlaceholder: "sk-xxxxxxxxxxxxxxxx"
  },
  {
    id: "moonshot",
    name: "Moonshot (月之暗面)",
    baseUrl: "https://api.moonshot.cn",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
    description: "Kimi 大模型，支持超长上下文",
    apiKeyPlaceholder: "sk-xxxxxxxxxxxxxxxx"
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    baseUrl: "https://api.anthropic.com",
    models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
    description: "Claude 系列模型（需要配置 /v1 代理）",
    apiKeyPlaceholder: "sk-ant-xxxxxxxxxxxxxxxx"
  },
  {
    id: "zhipu",
    name: "智谱 AI (GLM)",
    baseUrl: "https://open.bigmodel.cn",
    models: ["glm-4-plus", "glm-4-0520", "glm-4", "glm-4-air", "glm-4-airx", "glm-4-flash"],
    description: "智谱 GLM 系列模型",
    apiKeyPlaceholder: "xxxxxxxxxxxxxxxx"
  },
  {
    id: "qwen",
    name: "阿里云通义千问",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode",
    models: ["qwen-turbo", "qwen-plus", "qwen-max", "qwen-max-longcontext"],
    description: "阿里云通义千问系列模型",
    apiKeyPlaceholder: "sk-xxxxxxxxxxxxxxxx"
  },
  {
    id: "siliconflow",
    name: "SiliconFlow (硅基流动)",
    baseUrl: "https://api.siliconflow.cn",
    models: ["deepseek-ai/DeepSeek-V3", "Qwen/Qwen2.5-72B-Instruct", "meta-llama/Meta-Llama-3.1-70B-Instruct"],
    description: "多种开源模型的统一 API",
    apiKeyPlaceholder: "sk-xxxxxxxxxxxxxxxx"
  },
  {
    id: "custom",
    name: "自定义 (OpenAI 兼容)",
    baseUrl: "",
    models: [],
    description: "自定义 OpenAI 兼容的 API 端点",
    apiKeyPlaceholder: "输入你的 API Key"
  }
];
function FieldForm({
  field,
  onSave,
  onCancel,
  isSystem = false
}) {
  const { t } = useTranslation();
  const [name, setName] = reactExports.useState(field?.name || "");
  const [label, setLabel] = reactExports.useState(field?.label || "");
  const [type, setType] = reactExports.useState(field?.type || "TEXT");
  const [required, setRequired] = reactExports.useState(field?.required || false);
  const [visible, setVisible] = reactExports.useState(field?.visible ?? true);
  const [options, setOptions] = reactExports.useState(() => {
    if (field?.options) {
      try {
        return JSON.parse(field.options).join("\n");
      } catch {
        return "";
      }
    }
    return "";
  });
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const isEdit = !!field;
  const needsOptions = type === "SELECT" || type === "MULTISELECT";
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = {
        name,
        label,
        type,
        required,
        visible
      };
      if (needsOptions && options.trim()) {
        data.options = JSON.stringify(
          options.split("\n").map((o) => o.trim()).filter(Boolean)
        );
      }
      await onSave(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-sm text-destructive bg-destructive/10 rounded-lg", children: error }),
    isSystem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 text-sm text-muted-foreground bg-muted rounded-lg flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-4 h-4" }),
      t("settings.systemFieldNote")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: t("settings.fieldName") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "name",
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "serial_number",
            required: true,
            disabled: isEdit
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "label", children: t("settings.fieldLabel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "label",
            value: label,
            onChange: (e) => setLabel(e.target.value),
            placeholder: t("settings.fieldLabelPlaceholder"),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "type", children: t("settings.fieldType") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: type,
            onValueChange: (v) => setType(v),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FIELD_TYPES.map((ft) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ft.value, children: ft.label }, ft.value)) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6 pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: required,
              onChange: (e) => setRequired(e.target.checked),
              className: "w-4 h-4 accent-primary"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: t("settings.required") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: visible,
              onChange: (e) => setVisible(e.target.checked),
              className: "w-4 h-4 accent-primary"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: t("settings.visible") })
        ] })
      ] })
    ] }),
    needsOptions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "options", children: t("settings.optionsLabel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          id: "options",
          value: options,
          onChange: (e) => setOptions(e.target.value),
          rows: 3,
          placeholder: t("settings.optionsPlaceholder")
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: onCancel, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 mr-1" }),
        t("common.cancel")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: loading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-1" }),
        loading ? t("common.processing") : t("common.save")
      ] })
    ] })
  ] });
}
function Settings() {
  const { t } = useTranslation();
  const [fields, setFields] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [editingField, setEditingField] = reactExports.useState(null);
  const [showAddForm, setShowAddForm] = reactExports.useState(false);
  const [systemLogo, setSystemLogo] = reactExports.useState(null);
  const [systemName, setSystemName] = reactExports.useState("");
  const [systemNameInput, setSystemNameInput] = reactExports.useState("");
  const [savingName, setSavingName] = reactExports.useState(false);
  const logoInputRef = reactExports.useRef(null);
  const [aiConfig, setAIConfig] = reactExports.useState(null);
  const [aiConfigForm, setAIConfigForm] = reactExports.useState({
    apiKey: "",
    provider: "deepseek",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
    maxTokens: 2e3,
    apiType: "chat"
  });
  const [customModel, setCustomModel] = reactExports.useState("");
  const [showApiKey, setShowApiKey] = reactExports.useState(false);
  const [savingAIConfig, setSavingAIConfig] = reactExports.useState(false);
  const [testingAIConfig, setTestingAIConfig] = reactExports.useState(false);
  const [testResult, setTestResult] = reactExports.useState(null);
  const currentProvider = AI_PROVIDERS.find((p) => p.id === aiConfigForm.provider) || AI_PROVIDERS[0];
  const handleProviderChange = (providerId) => {
    const provider = AI_PROVIDERS.find((p) => p.id === providerId);
    if (provider) {
      setAIConfigForm((prev) => ({
        ...prev,
        provider: providerId,
        baseUrl: provider.baseUrl,
        model: provider.models[0] || ""
      }));
      setCustomModel("");
    }
  };
  const currentUser = getStoredUser();
  const isAdmin = hasPermission(currentUser?.role, "user:manage");
  const loadSystemConfig = async () => {
    try {
      const response = await systemConfigApi.getPublicConfig();
      if (response.success) {
        setSystemLogo(response.data.logo);
        setSystemName(response.data.name);
        setSystemNameInput(response.data.name);
      }
    } catch (err) {
      console.error("加载系统配置失败:", err);
    }
  };
  const loadAIConfig = async () => {
    try {
      const response = await aiApi.getConfig();
      if (response.success && response.data) {
        setAIConfig(response.data);
        const normalizedUrl = response.data.baseUrl.replace(/\/v\d*\/?$/, "").replace(/\/$/, "");
        const matchedProvider = AI_PROVIDERS.find((p) => {
          const normalizedProviderUrl = p.baseUrl.replace(/\/$/, "");
          const baseUrl = response.data?.baseUrl ?? "";
          return normalizedUrl === normalizedProviderUrl || baseUrl.startsWith(p.baseUrl);
        });
        const providerId = matchedProvider?.id || "custom";
        const model = response.data?.model ?? "";
        const isCustomModel = matchedProvider && !matchedProvider.models.includes(model);
        setAIConfigForm({
          apiKey: "",
          // 不显示实际 API Key
          provider: providerId,
          baseUrl: response.data.baseUrl,
          model: isCustomModel ? "" : model,
          maxTokens: response.data.maxTokens,
          apiType: response.data.apiType || "chat"
        });
        if (isCustomModel && matchedProvider) {
          setCustomModel(model);
        }
      }
    } catch (err) {
      console.error("加载 AI 配置失败:", err);
    }
  };
  const handleSaveAIConfig = async () => {
    setSavingAIConfig(true);
    try {
      const finalModel = aiConfigForm.model === "custom" ? customModel.trim() : aiConfigForm.model;
      const updateData = {
        baseUrl: aiConfigForm.baseUrl,
        model: finalModel,
        maxTokens: aiConfigForm.maxTokens,
        apiType: aiConfigForm.apiType
      };
      if (aiConfigForm.apiKey.trim()) {
        updateData.apiKey = aiConfigForm.apiKey.trim();
      }
      const response = await aiApi.updateConfig(updateData);
      if (response.success) {
        showSuccess(t("settings.aiConfigSaveSuccess"));
        loadAIConfig();
        setAIConfigForm((prev) => ({ ...prev, apiKey: "" }));
        setTestResult(null);
      } else {
        showError(response.error || t("settings.aiConfigSaveFailed"));
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t("settings.aiConfigSaveFailed"));
    } finally {
      setSavingAIConfig(false);
    }
  };
  const handleTestAIConfig = async () => {
    setTestingAIConfig(true);
    setTestResult(null);
    try {
      const finalModel = aiConfigForm.model === "custom" ? customModel.trim() : aiConfigForm.model;
      const testConfig = {
        baseUrl: aiConfigForm.baseUrl,
        model: finalModel,
        apiType: aiConfigForm.apiType
      };
      if (aiConfigForm.apiKey.trim()) {
        testConfig.apiKey = aiConfigForm.apiKey.trim();
      }
      const response = await aiApi.testConfig(testConfig);
      if (response.success && response.data) {
        setTestResult({
          success: response.data.success,
          message: response.data.message,
          responseTime: response.data.responseTime
        });
        if (response.data.success) {
          showSuccess(t("settings.aiTestSuccess"));
        } else {
          showError(response.data.message);
        }
      } else {
        setTestResult({
          success: false,
          message: response.error || t("settings.aiTestFailed")
        });
        showError(response.error || t("settings.aiTestFailed"));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("settings.aiTestFailed");
      setTestResult({
        success: false,
        message: errorMessage
      });
      showError(errorMessage);
    } finally {
      setTestingAIConfig(false);
    }
  };
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      showError(t("settings.invalidFileType"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showError(t("settings.fileTooLarge"));
      return;
    }
    try {
      const response = await systemConfigApi.uploadLogo(file);
      if (response.success) {
        setSystemLogo(response.data.logo);
        showSuccess(t("settings.logoUploadSuccess"));
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t("settings.logoUploadFailed"));
    }
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };
  const handleSaveSystemName = async () => {
    if (!systemNameInput.trim()) return;
    setSavingName(true);
    try {
      const response = await systemConfigApi.setSystemName(systemNameInput.trim());
      if (response.success) {
        setSystemName(systemNameInput.trim());
        showSuccess(t("settings.systemNameUpdateSuccess"));
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t("settings.systemNameUpdateFailed"));
    } finally {
      setSavingName(false);
    }
  };
  const loadFields = async () => {
    try {
      setLoading(true);
      const response = await fieldApi.getAll();
      if (response?.success) {
        const sortedFields = response.data.sort((a, b) => a.order - b.order);
        setFields(sortedFields);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    loadFields();
    loadSystemConfig();
    if (isAdmin) {
      loadAIConfig();
    }
  }, []);
  const handleAdd = async (data) => {
    const response = await fieldApi.create(data);
    if (response?.success) {
      setShowAddForm(false);
      loadFields();
    } else {
      throw new Error(response?.error || t("common.error"));
    }
  };
  const handleUpdate = async (data) => {
    if (!editingField) return;
    const response = await fieldApi.update(editingField.id, data);
    if (response?.success) {
      setEditingField(null);
      loadFields();
    } else {
      throw new Error(response?.error || t("common.error"));
    }
  };
  const handleDelete = async (field) => {
    if (field.isSystem) {
      showWarning(t("settings.systemFieldNoDelete"));
      return;
    }
    if (!confirm(t("settings.confirmDeleteField"))) {
      return;
    }
    try {
      const response = await fieldApi.delete(field.id);
      if (response?.success) {
        showSuccess(t("settings.fieldDeleteSuccess"));
        loadFields();
      } else {
        showError(t("common.error"), response?.error || "");
      }
    } catch (err) {
      showError(t("common.error"), err instanceof Error ? err.message : "");
    }
  };
  const getTypeLabel = (type) => {
    return FIELD_TYPES.find((t2) => t2.value === type)?.label || type;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground", children: t("settings.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: t("settings.subtitle") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageInstructions,
      {
        title: t("settings.fieldConfig"),
        instructions: [
          t("settings.instruction1"),
          t("settings.instruction2"),
          t("settings.instruction3"),
          t("settings.instruction4"),
          t("settings.instruction5")
        ]
      }
    ),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-sm text-destructive bg-destructive/10 rounded-lg", children: error }),
    isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "flex flex-row items-center justify-between py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-5 h-5" }),
        t("settings.systemSettings")
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: systemLogo ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: `${API_BASE}${systemLogo}`,
              alt: systemName || "Logo",
              className: "w-16 h-16 object-contain rounded-lg border"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-muted rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-8 h-8 text-muted-foreground" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: t("settings.systemLogo") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-2", children: t("settings.uploadLogo") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => logoInputRef.current?.click(),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 mr-1" }),
                  t("settings.uploadLogo")
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: logoInputRef,
                type: "file",
                accept: "image/jpeg,image/png,image/gif,image/webp,image/svg+xml",
                onChange: handleLogoUpload,
                className: "hidden"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "system-name", className: "text-sm font-medium", children: t("settings.systemName") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "system-name",
                value: systemNameInput,
                onChange: (e) => setSystemNameInput(e.target.value),
                placeholder: t("header.appName"),
                className: "max-w-xs"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                onClick: handleSaveSystemName,
                disabled: savingName || systemNameInput === systemName,
                children: savingName ? t("common.processing") : t("common.save")
              }
            )
          ] })
        ] })
      ] })
    ] }),
    isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5" }),
          t("settings.aiConfig")
        ] }),
        aiConfig?.hasApiKey && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "bg-green-500/10 text-green-600", children: t("settings.aiConfigured") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ai-provider", className: "text-sm font-medium", children: t("settings.aiProvider") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: aiConfigForm.provider,
              onValueChange: handleProviderChange,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: AI_PROVIDERS.map((provider) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: provider.id, children: provider.name }, provider.id)) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: currentProvider.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ai-api-key", className: "text-sm font-medium", children: "API Key" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "ai-api-key",
                type: showApiKey ? "text" : "password",
                value: aiConfigForm.apiKey,
                onChange: (e) => setAIConfigForm((prev) => ({ ...prev, apiKey: e.target.value })),
                placeholder: aiConfig?.hasApiKey ? "••••••••••••••••" : currentProvider.apiKeyPlaceholder,
                className: "pr-10"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "icon-xs",
                className: "absolute right-1 top-1/2 -translate-y-1/2",
                onClick: () => setShowApiKey(!showApiKey),
                children: showApiKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: aiConfig?.hasApiKey ? t("settings.aiApiKeyHint") : t("settings.aiApiKeyHintEmpty") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ai-base-url", className: "text-sm font-medium", children: t("settings.aiBaseUrl") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "ai-base-url",
              value: aiConfigForm.baseUrl,
              onChange: (e) => setAIConfigForm((prev) => ({ ...prev, baseUrl: e.target.value })),
              placeholder: currentProvider.baseUrl || "https://api.example.com",
              className: "max-w-xs",
              disabled: aiConfigForm.provider !== "custom"
            }
          ),
          aiConfigForm.provider !== "custom" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("settings.aiBaseUrlAutoHint") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ai-model", className: "text-sm font-medium", children: t("settings.aiModel") }),
          currentProvider.models.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: aiConfigForm.model,
                onValueChange: (v) => {
                  if (v === "custom") {
                    setAIConfigForm((prev) => ({ ...prev, model: "custom" }));
                  } else {
                    setAIConfigForm((prev) => ({ ...prev, model: v }));
                    setCustomModel("");
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("settings.aiModelPlaceholder") }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    currentProvider.models.map((model) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: model, children: model }, model)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "custom", children: t("settings.aiModelCustom") })
                  ] })
                ]
              }
            ),
            aiConfigForm.model === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: customModel,
                onChange: (e) => setCustomModel(e.target.value),
                placeholder: t("settings.aiModelCustomPlaceholder"),
                className: "max-w-xs"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "ai-model",
              value: aiConfigForm.model,
              onChange: (e) => setAIConfigForm((prev) => ({ ...prev, model: e.target.value })),
              placeholder: "model-name",
              className: "max-w-xs"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ai-api-type", className: "text-sm font-medium", children: t("settings.aiApiType") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: aiConfigForm.apiType,
              onValueChange: (v) => setAIConfigForm((prev) => ({ ...prev, apiType: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "chat", children: "Chat Completions (/v1/chat/completions)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "responses", children: "Responses API (/v1/responses)" })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground max-w-xs", children: t("settings.aiApiTypeHint") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ai-max-tokens", className: "text-sm font-medium", children: t("settings.aiMaxTokens") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "ai-max-tokens",
              type: "number",
              value: aiConfigForm.maxTokens,
              onChange: (e) => setAIConfigForm((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) || 2e3 })),
              min: 100,
              max: 32e3,
              className: "max-w-xs"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-2", children: [
          testResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 text-sm ${testResult.success ? "text-green-600" : "text-red-600"}`, children: [
            testResult.success ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: testResult.message }),
            testResult.responseTime && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "(",
              testResult.responseTime,
              "ms)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                onClick: handleTestAIConfig,
                disabled: testingAIConfig,
                children: [
                  testingAIConfig ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-1 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 mr-1" }),
                  testingAIConfig ? t("settings.aiTesting") : t("settings.aiTest")
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handleSaveAIConfig,
                disabled: savingAIConfig,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-1" }),
                  savingAIConfig ? t("common.processing") : t("common.save")
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: t("settings.fieldConfig") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowAddForm(true), disabled: showAddForm, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          t("settings.addField")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-muted-foreground", children: t("common.loading") }) : fields.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-muted-foreground", children: t("settings.noFields") }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("settings.fieldCategory") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("settings.fieldName") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("settings.fieldLabel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("settings.fieldType") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("settings.required") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("settings.visible") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: t("common.actions") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: fields.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableRow,
          {
            className: field.isSystem ? "bg-muted/30" : "",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: field.isSystem ? /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-4 h-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "w-4 h-4 text-muted-foreground cursor-move" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: field.isSystem ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-3 h-3" }),
                t("settings.systemField")
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t("settings.customField") }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-sm", children: field.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: editingField?.id === field.id ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                FieldForm,
                {
                  field,
                  onSave: handleUpdate,
                  onCancel: () => setEditingField(null),
                  isSystem: field.isSystem
                }
              ) }) : field.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: getTypeLabel(field.type) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: field.required ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600", children: t("settings.yes") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("settings.no") }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: field.visible ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: editingField?.id !== field.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon-xs",
                    onClick: () => setEditingField(field),
                    title: t("common.edit"),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon-xs",
                    onClick: () => handleDelete(field),
                    title: t("common.delete"),
                    disabled: field.isSystem,
                    className: field.isSystem ? "opacity-50" : "hover:text-destructive",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                  }
                )
              ] }) })
            ]
          },
          field.id
        )) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showAddForm, onOpenChange: setShowAddForm, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("settings.addField") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FieldForm,
        {
          onSave: handleAdd,
          onCancel: () => setShowAddForm(false)
        }
      )
    ] }) })
  ] });
}
export {
  Settings
};
