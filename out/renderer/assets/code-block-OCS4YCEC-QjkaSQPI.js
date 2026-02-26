import { L, Z as Zr, I as Io, g } from "./mermaid-NOHMQCX5-CKs6L879.js";
import { r as reactExports, j as jsxRuntimeExports } from "./index-qNrbFx48.js";
import "./ImageUploader-DLxw6MGP.js";
import "./upload-E5mF9rXr.js";
import "./badge-BzfgTWgD.js";
import "./select-BQGUkUaU.js";
import "./download-J3QrLKzy.js";
import "./trash-2-pYsdSWY6.js";
import "./PageInstructions-CytTlGL7.js";
import "./SkeletonLoaders-Dt4N1q7G.js";
import "./table-CVXuarik.js";
import "./EmptyState-C7jBXoff.js";
import "./search-BF8_zU4S.js";
import "./proxy-DSWDMqPq.js";
var P = g("block", "before:content-[counter(line)]", "before:inline-block", "before:[counter-increment:line]", "before:w-6", "before:mr-4", "before:text-[13px]", "before:text-right", "before:text-muted-foreground/50", "before:font-mono", "before:select-none"), R = (o) => {
  let e = {};
  for (let s of o.split(";")) {
    let n = s.indexOf(":");
    if (n > 0) {
      let a = s.slice(0, n).trim(), i = s.slice(n + 1).trim();
      a && i && (e[a] = i);
    }
  }
  return e;
}, y = reactExports.memo(({ children: o, result: e, language: s, className: n, ...a }) => {
  let i = reactExports.useMemo(() => {
    let r = {};
    return e.bg && (r["--sdm-bg"] = e.bg), e.fg && (r["--sdm-fg"] = e.fg), e.rootStyle && Object.assign(r, R(e.rootStyle)), r;
  }, [e.bg, e.fg, e.rootStyle]);
  return jsxRuntimeExports.jsx("pre", { className: g(n, "p-4 text-sm", "bg-[var(--sdm-bg,transparent)]", "dark:bg-[var(--shiki-dark-bg,var(--sdm-bg,transparent))]"), "data-language": s, "data-streamdown": "code-block-body", style: i, ...a, children: jsxRuntimeExports.jsx("code", { className: "[counter-increment:line_0] [counter-reset:line]", children: e.tokens.map((r, l) => jsxRuntimeExports.jsx("span", { className: P, children: r.map((t, p) => jsxRuntimeExports.jsx("span", { className: g("text-[var(--sdm-c,inherit)]", "dark:text-[var(--shiki-dark,var(--sdm-c,inherit))]", t.bgColor && "bg-[var(--sdm-tbg)]", t.bgColor && "dark:bg-[var(--shiki-dark-bg,var(--sdm-tbg))]"), style: { ...t.color ? { "--sdm-c": t.color } : {}, ...t.bgColor ? { "--sdm-tbg": t.bgColor } : {}, ...t.htmlStyle }, ...t.htmlAttrs, children: t.content }, p)) }, l)) }) });
}, (o, e) => o.result === e.result && o.language === e.language && o.className === e.className);
var h = ({ className: o, language: e, style: s, ...n }) => jsxRuntimeExports.jsx("div", { className: g("my-4 w-full overflow-hidden rounded-xl border border-border", o), "data-language": e, "data-streamdown": "code-block", style: { contentVisibility: "auto", containIntrinsicSize: "auto 200px", ...s }, ...n });
var B = ({ language: o, children: e }) => jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-muted/80 p-3 text-muted-foreground text-xs", "data-language": o, "data-streamdown": "code-block-header", children: [jsxRuntimeExports.jsx("span", { className: "ml-1 font-mono lowercase", children: o }), jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: e })] });
var I = /\n+$/, Y = ({ code: o, language: e, className: s, children: n, ...a }) => {
  let { shikiTheme: i } = reactExports.useContext(L), r = Zr(), l = reactExports.useMemo(() => o.replace(I, ""), [o]), t = reactExports.useMemo(() => ({ bg: "transparent", fg: "inherit", tokens: l.split(`
`).map((m) => [{ content: m, color: "inherit", bgColor: "transparent", htmlStyle: {}, offset: 0 }]) }), [l]), [p, c$1] = reactExports.useState(t);
  return reactExports.useEffect(() => {
    if (!r) {
      c$1(t);
      return;
    }
    let m = r.highlight({ code: l, language: e, themes: i }, (S) => {
      c$1(S);
    });
    if (m) {
      c$1(m);
      return;
    }
    c$1(t);
  }, [l, e, i, r, t]), jsxRuntimeExports.jsx(Io.Provider, { value: { code: o }, children: jsxRuntimeExports.jsxs(h, { language: e, children: [jsxRuntimeExports.jsx(B, { language: e, children: n }), jsxRuntimeExports.jsx(y, { className: s, language: e, result: p, ...a })] }) });
};
export {
  Y as CodeBlock
};
