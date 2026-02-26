import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, a as cn, A as API_BASE_URL, X, h as Camera, i as getToken } from "./index-qNrbFx48.js";
import { U as Upload } from "./upload-E5mF9rXr.js";
const __iconNode = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
];
const Pen = createLucideIcon("pen", __iconNode);
function LazyImage({ src, alt, className }) {
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [hasError, setHasError] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("relative", className), children: [
    isLoading && !hasError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 animate-pulse bg-muted rounded" }),
    hasError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-full h-full bg-muted rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: "加载失败" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src,
        alt,
        loading: "lazy",
        className: cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        ),
        onLoad: () => setIsLoading(false),
        onError: () => {
          setIsLoading(false);
          setHasError(true);
        }
      }
    )
  ] });
}
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const QUALITY = 0.8;
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = height * MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      if (height > MAX_HEIGHT) {
        width = width * MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("压缩失败"));
          }
        },
        "image/jpeg",
        QUALITY
      );
    };
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = URL.createObjectURL(file);
  });
};
const API_BASE = API_BASE_URL;
function ImageUploader({ assetId, images, onImagesChange }) {
  const [uploading, setUploading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const fileInputRef = reactExports.useRef(null);
  const cameraInputRef = reactExports.useRef(null);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const uploadFile = async (file) => {
    setUploading(true);
    setError("");
    try {
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, {
        type: "image/jpeg",
        lastModified: Date.now()
      });
      const formData = new FormData();
      formData.append("image", compressedFile);
      const token = getToken();
      const response = await fetch(`${API_BASE}/assets/${assetId}/images`, {
        method: "POST",
        headers: {
          ...token ? { Authorization: `Bearer ${token}` } : {}
        },
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        onImagesChange();
      } else {
        setError(result.error || "上传失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleCameraCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };
  const handleDelete = async (imageId) => {
    if (!confirm("确定要删除这张图片吗？")) return;
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/images/${imageId}`, {
        method: "DELETE",
        headers: {
          ...token ? { Authorization: `Bearer ${token}` } : {}
        }
      });
      const result = await response.json();
      if (result.success) {
        onImagesChange();
      }
    } catch (err) {
      console.error("删除失败:", err);
    }
  };
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    images.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", children: images.map((image) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            LazyImage,
            {
              src: `${API_BASE}/images/${image.id}`,
              alt: image.originalName,
              className: "w-full h-32 object-cover"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleDelete(image.id),
              className: "p-2 bg-red-500 text-white rounded-full hover:bg-red-600",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 text-xs text-gray-500 dark:text-gray-400 truncate", children: [
            image.originalName,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", children: formatSize(image.size) })
          ] })
        ]
      },
      image.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
      isMobile && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => cameraInputRef.current?.click(),
          disabled: uploading,
          className: "flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-5 h-5" }),
            uploading ? "上传中..." : "拍照上传"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => fileInputRef.current?.click(),
          disabled: uploading,
          className: `flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${isMobile ? "flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" : "w-full border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-5 h-5" }),
            uploading ? "上传中..." : isMobile ? "从相册选择" : "点击上传图片"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        accept: "image/*",
        onChange: handleUpload,
        className: "hidden"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: cameraInputRef,
        type: "file",
        accept: "image/*",
        capture: "environment",
        onChange: handleCameraCapture,
        className: "hidden"
      }
    ),
    !isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-500 text-center", children: "支持 JPEG, PNG, GIF, WebP，最大 10MB" }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: error })
  ] });
}
export {
  ImageUploader as I,
  LazyImage as L,
  Pen as P
};
