import { u as useTranslation, b as useNavigate, r as reactExports, d as useAuthStore, j as jsxRuntimeExports, P as Package, e as Link, G as Github, f as authApi } from "./index-qNrbFx48.js";
function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = reactExports.useState(true);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [formData, setFormData] = reactExports.useState({
    username: "",
    password: "",
    name: "",
    email: ""
  });
  const { setAuth } = useAuthStore();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await authApi.login({
          username: formData.username,
          password: formData.password
        });
      } else {
        if (formData.password.length < 8) {
          setError(t("login.passwordRequirements"));
          setLoading(false);
          return;
        }
        response = await authApi.register({
          username: formData.username,
          password: formData.password,
          name: formData.name || void 0,
          email: formData.email || void 0
        });
      }
      if (response.success && response.data) {
        setAuth(response.data.token, response.data.user);
        navigate("/");
      } else {
        setError(response.error || t("common.error"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-8 h-8 text-blue-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-2xl font-bold text-gray-900 dark:text-white", children: t("login.appName") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 dark:text-gray-400", children: isLogin ? t("login.loginTitle") : t("login.registerTitle") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm", children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("login.username") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: formData.username,
              onChange: (e) => setFormData({ ...formData, username: e.target.value }),
              className: "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              placeholder: t("login.usernamePlaceholder"),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: t("login.password") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              value: formData.password,
              onChange: (e) => setFormData({ ...formData, password: e.target.value }),
              className: "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              placeholder: isLogin ? t("login.passwordPlaceholder") : t("login.passwordPlaceholderRegister"),
              required: true,
              minLength: isLogin ? 1 : 8
            }
          ),
          !isLogin && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400", children: t("login.passwordRequirements") })
        ] }),
        !isLogin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: [
              t("login.name"),
              " ",
              t("common.optional")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: formData.name,
                onChange: (e) => setFormData({ ...formData, name: e.target.value }),
                className: "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                placeholder: t("login.namePlaceholder")
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: [
              t("login.email"),
              " ",
              t("common.optional")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "email",
                value: formData.email,
                onChange: (e) => setFormData({ ...formData, email: e.target.value }),
                className: "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                placeholder: t("login.emailPlaceholder")
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors",
            children: loading ? t("login.processing") : isLogin ? t("login.loginButton") : t("login.registerButton")
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center text-sm text-gray-500 dark:text-gray-400", children: isLogin ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        t("login.noAccount"),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setIsLogin(false);
              setError("");
            },
            className: "text-blue-500 hover:text-blue-600 font-medium",
            children: t("login.registerNow")
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        t("login.hasAccount"),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setIsLogin(true);
              setError("");
            },
            className: "text-blue-500 hover:text-blue-600 font-medium",
            children: t("login.loginNow")
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-500 dark:text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium mb-1", children: t("login.defaultAccount") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          t("login.username"),
          ": admin"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          t("login.password"),
          ": admin123"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 text-center text-sm text-gray-500 dark:text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center justify-center gap-1", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Asset Management System"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: "https://github.com/zweien/asset-anagement-system",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "inline-flex items-center gap-1 mt-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "w-4 h-4" }),
            "GitHub"
          ]
        }
      )
    ] })
  ] }) });
}
export {
  Login
};
