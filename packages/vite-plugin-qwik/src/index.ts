import type { Plugin } from "vite";
import svgx from "@svgx/vite-plugin-react";
import type { SVGXOptions } from "@svgx/vite-plugin-react";

export default function (options?: SVGXOptions): Plugin {
  const defaultOptions = {
    importSource: "@builder.io/qwik",
    runtime: "automatic",
    pragma: options?.runtime === "classic" ? "h" : undefined,
    pragmaFrag: options?.runtime === "classic" ? "Fragment" : undefined,
  };
  const mergedOptions = Object.assign({}, defaultOptions, options);
  return {
    ...svgx(mergedOptions),
    name: "@svgx-vite-plugin-qwik",
  };
}
