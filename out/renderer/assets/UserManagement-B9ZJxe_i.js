import { c as createLucideIcon, u as useTranslation, r as reactExports, R as userApi, j as jsxRuntimeExports, B as Button, I as Input, U as USER_ROLE_LABELS, k as Dialog, n as DialogContent, H as DialogHeader, J as DialogTitle, z as Label, S as DialogFooter, N as showSuccess, M as showError, T as Check, s as CircleX } from "./index-qNrbFx48.js";
import { P as PageInstructions, C as Card, a as CardContent } from "./PageInstructions-CytTlGL7.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CVXuarik.js";
import { P as Plus, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BQGUkUaU.js";
import { U as Upload } from "./upload-E5mF9rXr.js";
import { S as Search } from "./search-BF8_zU4S.js";
import { P as Pencil } from "./pencil-CD2tTnb8.js";
import { T as Trash2 } from "./trash-2-pYsdSWY6.js";
import { D as Download } from "./download-J3QrLKzy.js";
const __iconNode$3 = [
  ["path", { d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4", key: "g0fldk" }],
  ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }],
  ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }]
];
const Key = createLucideIcon("key", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
];
const RotateCcw = createLucideIcon("rotate-ccw", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m16 11 2 2 4-4", key: "9rsbq5" }],
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const UserCheck = createLucideIcon("user-check", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "17", x2: "22", y1: "8", y2: "13", key: "3nzzx3" }],
  ["line", { x1: "22", x2: "17", y1: "8", y2: "13", key: "1swrse" }]
];
const UserX = createLucideIcon("user-x", __iconNode);
function UserManagement() {
  const { t } = useTranslation();
  function validatePassword(password) {
    const errors = [];
    if (password.length < 8) {
      errors.push(t("users.passwordReq8"));
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t("users.passwordReqLower"));
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t("users.passwordReqUpper"));
    }
    if (!/[0-9]/.test(password)) {
      errors.push(t("users.passwordReqNumber"));
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
  function PasswordRequirements({ password }) {
    const requirements = [
      { label: t("users.passwordReq8"), valid: password.length >= 8 },
      { label: t("users.passwordReqLower"), valid: /[a-z]/.test(password) },
      { label: t("users.passwordReqUpper"), valid: /[A-Z]/.test(password) },
      { label: t("users.passwordReqNumber"), valid: /[0-9]/.test(password) }
    ];
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1", children: requirements.map((req, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs", children: [
      req.valid ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3 h-3 text-gray-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: req.valid ? "text-green-600" : "text-muted-foreground", children: req.label })
    ] }, index)) });
  }
  const [loading, setLoading] = reactExports.useState(true);
  const [users, setUsers] = reactExports.useState([]);
  const [total, setTotal] = reactExports.useState(0);
  const [page, setPage] = reactExports.useState(1);
  const [pageSize] = reactExports.useState(10);
  const [totalPages, setTotalPages] = reactExports.useState(1);
  const [search, setSearch] = reactExports.useState("");
  const [filterRole, setFilterRole] = reactExports.useState("");
  const [filterActive, setFilterActive] = reactExports.useState("");
  const [showCreateModal, setShowCreateModal] = reactExports.useState(false);
  const [showEditModal, setShowEditModal] = reactExports.useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = reactExports.useState(false);
  const [selectedUser, setSelectedUser] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "USER"
  });
  const [editFormData, setEditFormData] = reactExports.useState({});
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [formError, setFormError] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [showImportModal, setShowImportModal] = reactExports.useState(false);
  const [importFile, setImportFile] = reactExports.useState(null);
  const [importing, setImporting] = reactExports.useState(false);
  const [importResult, setImportResult] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    loadUsers();
  }, [page, filterRole, filterActive]);
  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = { page, pageSize };
      if (search) params.search = search;
      if (filterRole) params.role = filterRole;
      if (filterActive !== "") params.active = filterActive === "true";
      const response = await userApi.getAll(params);
      if (response?.success) {
        setUsers(response.data.data);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      console.error(t("users.loadFailed"), err);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };
  const handleClearFilters = () => {
    setSearch("");
    setFilterRole("");
    setFilterActive("");
    setPage(1);
  };
  const handleCreate = async () => {
    if (!formData.username.trim()) {
      setFormError(t("users.usernameRequired"));
      return;
    }
    if (!formData.password) {
      setFormError(t("users.passwordRequired"));
      return;
    }
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setFormError(`${t("users.passwordInvalid")}${passwordValidation.errors.join("、")}`);
      return;
    }
    try {
      setSubmitting(true);
      setFormError("");
      const response = await userApi.create(formData);
      if (response?.success) {
        setShowCreateModal(false);
        setFormData({
          username: "",
          password: "",
          name: "",
          email: "",
          role: "USER"
        });
        loadUsers();
      } else {
        setFormError(response?.error || t("users.createFailed"));
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("users.createFailed"));
    } finally {
      setSubmitting(false);
    }
  };
  const handleEdit = async () => {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      setFormError("");
      const response = await userApi.update(selectedUser.id, editFormData);
      if (response?.success) {
        setShowEditModal(false);
        setSelectedUser(null);
        setEditFormData({});
        loadUsers();
      } else {
        setFormError(response?.error || t("users.updateFailed"));
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("users.updateFailed"));
    } finally {
      setSubmitting(false);
    }
  };
  const handleRoleChange = async (user, newRole) => {
    if (user.role === newRole) return;
    try {
      const response = await userApi.updateRole(user.id, newRole);
      if (response?.success) {
        showSuccess(t("users.roleUpdateSuccess"));
        loadUsers();
      } else {
        showError(t("users.roleUpdateFailed"), response?.error || t("users.unknownError"));
      }
    } catch (err) {
      showError(t("users.roleUpdateFailed"), err instanceof Error ? err.message : t("users.unknownError"));
    }
  };
  const handleToggleStatus = async (user) => {
    try {
      const response = await userApi.updateStatus(user.id, !user.active);
      if (response?.success) {
        showSuccess(user.active ? t("users.userDeactivated") : t("users.userActivated"));
        loadUsers();
      } else {
        showError(t("users.statusUpdateFailed"), response?.error || t("users.unknownError"));
      }
    } catch (err) {
      showError(t("users.statusUpdateFailed"), err instanceof Error ? err.message : t("users.unknownError"));
    }
  };
  const handleResetPassword = async () => {
    if (!selectedUser) return;
    if (!newPassword) {
      setFormError(t("users.passwordRequired"));
      return;
    }
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setFormError(`${t("users.passwordInvalid")}${passwordValidation.errors.join("、")}`);
      return;
    }
    try {
      setSubmitting(true);
      setFormError("");
      const response = await userApi.resetPassword(selectedUser.id, newPassword);
      if (response?.success) {
        setShowResetPasswordModal(false);
        setSelectedUser(null);
        setNewPassword("");
      } else {
        setFormError(response?.error || t("users.resetPasswordFailed"));
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("users.resetPasswordFailed"));
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (user) => {
    if (!confirm(t("users.confirmDeleteUser", { name: user.name || user.username }))) {
      return;
    }
    try {
      const response = await userApi.delete(user.id);
      if (response?.success) {
        showSuccess(t("users.userDeleteSuccess"));
        loadUsers();
      } else {
        showError(t("users.deleteFailed"), response?.error || t("users.unknownError"));
      }
    } catch (err) {
      showError(t("users.deleteFailed"), err instanceof Error ? err.message : t("users.unknownError"));
    }
  };
  const handleDownloadTemplate = async () => {
    try {
      await userApi.downloadTemplate();
      showSuccess(t("users.templateDownloadSuccess"));
    } catch (err) {
      showError(t("users.templateDownloadFailed"), err instanceof Error ? err.message : t("users.unknownError"));
    }
  };
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
  };
  const handleImport = async () => {
    if (!importFile) {
      showError(t("users.pleaseSelectFile"));
      return;
    }
    try {
      setImporting(true);
      const result = await userApi.importUsers(importFile);
      setImportResult(result);
      if (result.success && result.data) {
        showSuccess(t("users.importSuccess", {
          success: result.data.success,
          failed: result.data.failed
        }));
        if (result.data.success > 0) {
          loadUsers();
        }
      } else {
        showError(t("users.importFailed"), result.error || t("users.unknownError"));
      }
    } catch (err) {
      showError(t("users.importFailed"), err instanceof Error ? err.message : t("users.unknownError"));
    } finally {
      setImporting(false);
    }
  };
  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role
    });
    setShowEditModal(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground", children: t("users.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: t("users.subtitle") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setShowImportModal(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 mr-2" }),
          t("users.importUsers")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowCreateModal(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          t("users.addUser")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageInstructions,
      {
        title: t("users.instructionsTitle"),
        instructions: [
          t("users.instruction1"),
          t("users.instruction2"),
          t("users.instruction3"),
          t("users.instruction4"),
          t("users.instruction5")
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[200px] relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: search,
            onChange: (e) => setSearch(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && handleSearch(),
            placeholder: t("users.searchPlaceholder"),
            className: "pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterRole || "__all__", onValueChange: (v) => {
        setFilterRole(v === "__all__" ? "" : v);
        setPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("users.allRoles") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: t("users.allRoles") }),
          Object.entries(USER_ROLE_LABELS).map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value, children: t(label) }, value))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterActive || "__all__", onValueChange: (v) => {
        setFilterActive(v === "__all__" ? "" : v);
        setPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("users.allStatus") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: t("users.allStatus") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "true", children: t("users.statusActive") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "false", children: t("users.statusInactive") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSearch, children: t("common.search") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleClearFilters, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-4 h-4 mr-2" }),
        t("users.reset")
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: t("common.loading") }) }) : users.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: t("users.noUsers") }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("users.user") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("users.role") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("users.status") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("users.createdAtLabel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: t("common.actions") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: users.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium", children: (user.name || user.username).charAt(0).toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-foreground", children: user.name || user.username }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "@",
                user.username,
                user.email && ` · ${user.email}`
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: user.role,
              onValueChange: (v) => handleRoleChange(user, v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-24 h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(USER_ROLE_LABELS).map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value, children: t(label) }, value)) })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => handleToggleStatus(user),
              className: `h-8 ${user.active ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}`,
              children: user.active ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-4 h-4 mr-1" }),
                t("users.statusActive")
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "w-4 h-4 mr-1" }),
                t("users.statusInactive")
              ] })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: formatDate(user.createdAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon-xs", onClick: () => openEditModal(user), title: t("common.edit"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon-xs",
                onClick: () => {
                  setSelectedUser(user);
                  setShowResetPasswordModal(true);
                },
                title: t("users.resetPassword"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon-xs",
                onClick: () => handleDelete(user),
                title: t("common.delete"),
                className: "hover:text-destructive",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
              }
            )
          ] }) })
        ] }, user.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: t("users.totalRecords", { count: total }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setPage(Math.max(1, page - 1)),
              disabled: page === 1,
              children: t("users.prevPage")
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground px-2", children: [
            page,
            " / ",
            totalPages
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setPage(Math.min(totalPages, page + 1)),
              disabled: page === totalPages,
              children: t("users.nextPage")
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCreateModal, onOpenChange: setShowCreateModal, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("users.addUser") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        formError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-sm text-destructive bg-destructive/10 rounded-lg", children: formError }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "username", children: [
            t("users.username"),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "username",
              value: formData.username,
              onChange: (e) => setFormData({ ...formData, username: e.target.value }),
              placeholder: t("users.usernamePlaceholder")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "password", children: [
            t("login.password"),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "password",
              type: "password",
              value: formData.password,
              onChange: (e) => setFormData({ ...formData, password: e.target.value }),
              placeholder: t("users.passwordPlaceholder")
            }
          ),
          formData.password && /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordRequirements, { password: formData.password })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: t("users.name") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "name",
              value: formData.name || "",
              onChange: (e) => setFormData({ ...formData, name: e.target.value }),
              placeholder: t("users.namePlaceholder")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: t("users.email") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "email",
              type: "email",
              value: formData.email || "",
              onChange: (e) => setFormData({ ...formData, email: e.target.value }),
              placeholder: t("users.emailPlaceholder")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "role", children: t("users.role") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.role,
              onValueChange: (v) => setFormData({ ...formData, role: v }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(USER_ROLE_LABELS).map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value, children: t(label) }, value)) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("users.rolePermissionsNote") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowCreateModal(false);
          setFormError("");
        }, children: t("common.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCreate, disabled: submitting, children: submitting ? t("users.creating") : t("users.create") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showEditModal, onOpenChange: setShowEditModal, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("users.editUser") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        formError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-sm text-destructive bg-destructive/10 rounded-lg", children: formError }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("users.username") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: selectedUser?.username || "",
              disabled: true,
              className: "bg-muted"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "edit-name", children: t("users.name") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "edit-name",
              value: editFormData.name || "",
              onChange: (e) => setEditFormData({ ...editFormData, name: e.target.value }),
              placeholder: t("users.namePlaceholder")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "edit-email", children: t("users.email") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "edit-email",
              type: "email",
              value: editFormData.email || "",
              onChange: (e) => setEditFormData({ ...editFormData, email: e.target.value }),
              placeholder: t("users.emailPlaceholder")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "edit-role", children: t("users.role") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: editFormData.role || "",
              onValueChange: (v) => setEditFormData({ ...editFormData, role: v }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("users.selectRole") }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(USER_ROLE_LABELS).map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value, children: t(label) }, value)) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("users.rolePermissionsNote") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowEditModal(false);
          setFormError("");
        }, children: t("common.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleEdit, disabled: submitting, children: submitting ? t("users.saving") : t("common.save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showResetPasswordModal, onOpenChange: setShowResetPasswordModal, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("users.resetPassword") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        formError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-sm text-destructive bg-destructive/10 rounded-lg", children: formError }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("users.resetPasswordFor", { name: selectedUser?.name || selectedUser?.username }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "new-password", children: [
            t("users.newPassword"),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "new-password",
              type: "password",
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
              placeholder: t("users.newPasswordPlaceholder")
            }
          ),
          newPassword && /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordRequirements, { password: newPassword })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowResetPasswordModal(false);
          setFormError("");
          setNewPassword("");
        }, children: t("common.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleResetPassword, disabled: submitting, children: submitting ? t("users.resetting") : t("users.confirmReset") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showImportModal, onOpenChange: handleCloseImportModal, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("users.importUsers") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 p-4 bg-muted/50 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center", children: "1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: t("users.importStep1") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center", children: "2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: t("users.importStep2") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center", children: "3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: t("users.importStep3") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: t("users.downloadTemplate") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("users.downloadTemplateDesc") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleDownloadTemplate, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 mr-2" }),
            t("users.download")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("users.selectFile") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-dashed rounded-lg p-6 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                accept: ".xlsx,.xls",
                onChange: handleFileSelect,
                className: "hidden"
              }
            ),
            importFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: importFile.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => {
                    setImportFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  },
                  children: t("common.remove")
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => fileInputRef.current?.click(), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 mr-2" }),
              t("users.selectExcelFile")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: [
              t("users.supportedFormats"),
              ": .xlsx, .xls"
            ] })
          ] })
        ] }),
        importResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 rounded-lg ${importResult.success ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium mb-2", children: t("users.importResult") }),
          importResult.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-green-600 dark:text-green-400", children: [
              t("users.importSuccessCount"),
              ": ",
              importResult.data.success
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-red-600 dark:text-red-400", children: [
              t("users.importFailedCount"),
              ": ",
              importResult.data.failed
            ] }),
            importResult.data.errors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 max-h-32 overflow-y-auto", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
                t("users.errorDetails"),
                ":"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc list-inside text-xs", children: importResult.data.errors.map((err, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                t("users.row"),
                " ",
                err.row,
                ": ",
                err.username ? `${err.username} - ` : "",
                err.error
              ] }, idx)) })
            ] })
          ] }),
          importResult.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: importResult.error })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleCloseImportModal, children: t("common.close") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleImport, disabled: !importFile || importing, children: importing ? t("users.importing") : t("users.startImport") })
      ] })
    ] }) })
  ] });
}
export {
  UserManagement
};
