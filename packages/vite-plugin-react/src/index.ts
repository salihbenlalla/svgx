import { promises as fs } from "fs";
import type { Plugin } from "vite";
import { toJsComponent } from "@svgx/core";
import type { ToJsComponentOptions } from "@svgx/core";

export type SVGXOptions = Omit<
  ToJsComponentOptions,
  "development" | "filePath" | "defaultExport" | "componentName"
> & {
  defaultImport?: "url" | "raw" | "component";
};

export default function (options?: SVGXOptions): Plugin {
  const defaultImport = options?.defaultImport || "component";
  const virtualModulePrefix = "@svgx-dir:";
  const resolvedVirtualModulePrefix = "\0" + virtualModulePrefix;

  const svgRegex = /\.svg(\?(raw|component|url))?$/;

  return {
    name: "@svgx-vite-plugin-react",
    enforce: "pre",
    resolveId(id) {
      if (id.startsWith(virtualModulePrefix)) {
        const dirPath = id.replace(virtualModulePrefix, "");
        return resolvedVirtualModulePrefix + dirPath;
      }
    },
    async load(id) {
      if (id.startsWith(resolvedVirtualModulePrefix)) {
        const dirPath = id.split(":", 2)[1];
        return `
        const modules = import.meta.glob('${dirPath}/*.svg', { eager: true })
        export default function (fileName) {
        return modules[\`${dirPath}/\${fileName}.svg\`].default
        }
        `;
      }

      if (!id.match(svgRegex)) {
        return null;
      }

      const [path, query] = id.split("?", 2);

      const importType = query || defaultImport;

      if (importType === "url") {
        return null; // Use default svg loader
      }

      let svg;

      try {
        svg = await fs.readFile(path, "utf-8");
      } catch (ex) {
        console.warn(
          "\n",
          `${id} couldn't be loaded by vite-svg-loader, fallback to default loader`
        );
        return;
      }

      if (importType === "raw") {
        return `export default ${JSON.stringify(svg)}`;
      }

      const component = toJsComponent(svg, {
        ...options,
        defaultExport: true,
      });

      return component;
    },
  };
}
