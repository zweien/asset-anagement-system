import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, k as Dialog, m as DialogTrigger, n as DialogContent, o as useParams, b as useNavigate, g as assetApi, p as fieldApi, i as getToken, A as API_BASE_URL, X, h as Camera, q as ASSET_STATUS_LABELS } from "./index-qNrbFx48.js";
import { L as LazyImage, P as Pen, I as ImageUploader } from "./ImageUploader-DLxw6MGP.js";
import { S as Save, I as Image } from "./save-DtqDW5w_.js";
import { T as Trash2 } from "./trash-2-pYsdSWY6.js";
import "./upload-E5mF9rXr.js";
const __iconNode$2 = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0"
    }
  ],
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
];
const Tag = createLucideIcon("tag", __iconNode);
function ImagePreview({ src, alt, thumbnailClassName }) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "cursor-pointer hover:opacity-80 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LazyImage, { src, alt, className: thumbnailClassName }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "max-w-4xl max-h-[90vh] p-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt, className: "w-full h-auto object-contain" }) })
  ] });
}
const API_BASE = API_BASE_URL;
function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = reactExports.useState(null);
  const [fields, setFields] = reactExports.useState([]);
  const [images, setImages] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [showImageUpload, setShowImageUpload] = reactExports.useState(false);
  const [editForm, setEditForm] = reactExports.useState({
    name: "",
    code: "",
    status: "IDLE",
    data: {}
  });
  reactExports.useEffect(() => {
    loadData();
  }, [id]);
  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [assetRes, fieldsRes] = await Promise.all([
        assetApi.getById(id),
        fieldApi.getAll()
      ]);
      if (assetRes.success) {
        setAsset(assetRes.data);
        const assetData = typeof assetRes.data.data === "string" ? JSON.parse(assetRes.data.data || "{}") : assetRes.data.data || {};
        setEditForm({
          name: assetRes.data.name,
          code: assetRes.data.code || "",
          status: assetRes.data.status,
          data: assetData
        });
        const token = getToken();
        const imagesRes = await fetch(`${API_BASE}/assets/${id}/images`, {
          headers: {
            ...token ? { Authorization: `Bearer ${token}` } : {}
          }
        });
        const imagesData = await imagesRes.json();
        if (imagesData.success) {
          setImages(imagesData.data);
        }
      } else {
        setError("资产不存在");
      }
      if (fieldsRes.success) {
        setFields(fieldsRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!asset || !confirm("确定要删除这个资产吗？")) return;
    try {
      const result = await assetApi.delete(asset.id);
      if (result.success) {
        navigate("/assets");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  };
  const handleSave = async () => {
    if (!asset) return;
    setSaving(true);
    try {
      const result = await assetApi.update(asset.id, {
        name: editForm.name,
        code: editForm.code || void 0,
        status: editForm.status,
        data: editForm.data
      });
      if (result.success) {
        setAsset(result.data);
        setIsEditing(false);
      } else {
        setError("保存失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = () => {
    if (asset) {
      const assetData = typeof asset.data === "string" ? JSON.parse(asset.data || "{}") : asset.data || {};
      setEditForm({
        name: asset.name,
        code: asset.code || "",
        status: asset.status,
        data: assetData
      });
    }
    setIsEditing(false);
  };
  const updateDataField = (fieldName, value) => {
    setEditForm((prev) => ({
      ...prev,
      data: { ...prev.data, [fieldName]: value }
    }));
  };
  const getFieldValue = (fieldName) => {
    if (!asset?.data) return null;
    try {
      const data = typeof asset.data === "string" ? JSON.parse(asset.data) : asset.data;
      return data[fieldName];
    } catch {
      return null;
    }
  };
  const renderFieldInput = (field) => {
    const value = editForm.data[field.name] ?? "";
    switch (field.type) {
      case "TEXT":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value,
            onChange: (e) => updateDataField(field.name, e.target.value),
            className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          }
        );
      case "NUMBER":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            value,
            onChange: (e) => updateDataField(field.name, e.target.value ? Number(e.target.value) : null),
            className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          }
        );
      case "DATE":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: value ? new Date(value).toISOString().split("T")[0] : "",
            onChange: (e) => updateDataField(field.name, e.target.value || null),
            className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          }
        );
      case "SELECT": {
        const options = field.options ? JSON.parse(field.options) : [];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value,
            onChange: (e) => updateDataField(field.name, e.target.value),
            className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "请选择" }),
              options.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: opt, children: opt }, opt))
            ]
          }
        );
      }
      case "MULTISELECT": {
        const multiOptions = field.options ? JSON.parse(field.options) : [];
        const selectedValues = Array.isArray(value) ? value : [];
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: multiOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: selectedValues.includes(opt),
              onChange: (e) => {
                if (e.target.checked) {
                  updateDataField(field.name, [...selectedValues, opt]);
                } else {
                  updateDataField(field.name, selectedValues.filter((v) => v !== opt));
                }
              },
              className: "rounded border-gray-300"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: opt })
        ] }, opt)) });
      }
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value,
            onChange: (e) => updateDataField(field.name, e.target.value),
            className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          }
        );
    }
  };
  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      IDLE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      DAMAGED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      SCRAPPED: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    };
    return colors[status];
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "加载中..." }) });
  }
  if (error || !asset) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => navigate("/assets"),
          className: "flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
            "返回列表"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg", children: error || "资产不存在" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => navigate("/assets"),
          className: "flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
            "返回列表"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleCancel,
            className: "px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" }),
              "取消"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleSave,
            disabled: saving,
            className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-1 disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
              saving ? "保存中..." : "保存"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowImageUpload(true),
            className: "px-4 py-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-4 h-4" }),
              "添加照片"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setIsEditing(true),
            className: "px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-4 h-4" }),
              "编辑"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleDelete,
            className: "px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }),
              "删除"
            ]
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "资产名称 *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: editForm.name,
                onChange: (e) => setEditForm((prev) => ({ ...prev, name: e.target.value })),
                className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "资产编号" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: editForm.code,
                  onChange: (e) => setEditForm((prev) => ({ ...prev, code: e.target.value })),
                  className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "状态" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  value: editForm.status,
                  onChange: (e) => setEditForm((prev) => ({ ...prev, status: e.target.value })),
                  className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                  children: Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value, children: label }, value))
                }
              )
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: asset.name }),
          asset.code && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-500 dark:text-gray-400 mt-1", children: [
            "编号: ",
            asset.code
          ] })
        ] }) }),
        !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(asset.status)}`, children: ASSET_STATUS_LABELS[asset.status] })
      ] }),
      !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-gray-600 dark:text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "分类: ",
            asset.category?.name || "未分类"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-gray-600 dark:text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "创建时间: ",
            new Date(asset.createdAt).toLocaleDateString("zh-CN")
          ] })
        ] })
      ] }),
      fields.filter((f) => !["name", "code", "status"].includes(f.name) && f.visible !== false).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "详细信息" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: fields.filter((f) => !["name", "code", "status"].includes(f.name) && f.visible !== false).sort((a, b) => a.order - b.order).map((field) => {
          const value = isEditing ? editForm.data[field.name] : getFieldValue(field.name);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm text-gray-500 dark:text-gray-400", children: field.label }),
            isEditing ? renderFieldInput(field) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-900 dark:text-white", children: value === null || value === void 0 || value === "" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "-" }) : field.type === "DATE" ? new Date(value).toLocaleDateString("zh-CN") : field.type === "MULTISELECT" ? Array.isArray(value) ? value.join(", ") : String(value) : String(value) })
          ] }, field.id);
        }) })
      ] })
    ] }),
    images.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-5 h-5 text-gray-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: [
            "资产图片 (",
            images.length,
            ")"
          ] })
        ] }),
        !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowImageUpload(true),
            className: "text-sm text-primary-600 dark:text-primary-400 hover:underline",
            children: "管理图片"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4", children: images.map((image) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ImagePreview,
              {
                src: `${API_BASE}/images/${image.id}`,
                alt: image.originalName,
                thumbnailClassName: "w-full h-24 object-cover"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 text-xs text-gray-500 dark:text-gray-400 truncate", children: image.originalName })
          ]
        },
        image.id
      )) })
    ] }),
    showImageUpload && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: [
          "管理图片 - ",
          asset.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowImageUpload(false),
            className: "p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ImageUploader,
        {
          assetId: asset.id,
          images,
          onImagesChange: () => {
            const token = getToken();
            fetch(`${API_BASE}/assets/${asset.id}/images`, {
              headers: {
                ...token ? { Authorization: `Bearer ${token}` } : {}
              }
            }).then((res) => res.json()).then((data) => {
              if (data.success) {
                setImages(data.data);
              }
            });
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShowImageUpload(false),
          className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600",
          children: "完成"
        }
      ) })
    ] }) })
  ] });
}
export {
  AssetDetail
};
