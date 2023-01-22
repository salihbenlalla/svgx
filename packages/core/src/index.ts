import { optimize, Config as SVGOConfig } from "svgo";
import { generate } from "astring";
import { traverse } from "estraverse";
import type {
  ExpressionStatement,
  VariableDeclaration,
  ImportDeclaration,
  Program,
} from "estree";

export interface ToHastOptions {
  optimize?: boolean;
  svgoConfig?: SVGOConfig;
}

// transform an svg string to HAST (Hypertext Abstract Syntax Tree)
export const toHast = async (svg: string, options: ToHastOptions = {}) => {
  const defaultOptions: Required<ToHastOptions> = {
    optimize: true,
    svgoConfig: {},
  };
  const mergedOptions = Object.assign({}, defaultOptions, options);

  let optimized = svg;
  if (mergedOptions.optimize) {
    optimized = optimize(svg, mergedOptions.svgoConfig).data;
  }
  const { fromHtml } = await (eval(`import('hast-util-from-html')`) as Promise<
    typeof import("hast-util-from-html")
  >);
  return fromHtml(optimized, {
    space: "svg",
    fragment: true,
  });
};

export interface ToEsTreeOptions extends ToHastOptions {}

// transform an svg into an estree
export const toEstree = async (svg: string, options?: ToEsTreeOptions) => {
  const hast = await toHast(svg, options);
  const { toEstree: getEstree } = await (eval(
    `import('hast-util-to-estree')`
  ) as Promise<typeof import("hast-util-to-estree")>);
  return getEstree(hast, { space: "svg" });
};

export interface ToJsxOptions extends ToEsTreeOptions {}

// transform an svg into raw jsx syntax (just jsx, not a component)
export const toJsx = async (svg: string, options?: ToJsxOptions) => {
  const esTree = await toEstree(svg, options);
  const { toJs: getJs, jsx } = await (eval(
    `import('estree-util-to-js')`
  ) as Promise<typeof import("estree-util-to-js")>);
  const { value } = getJs(esTree, { handlers: jsx });
  return value;
};

interface ToJsOptions extends ToEsTreeOptions {
  runtime?: "classic" | "automatic";
  importSource?: string;
  pragma?: string;
  pragmaFrag?: string;
  development?: boolean;
  filePath?: string;
}

// transform an svg into javascript function calls (using pragmas)
export const toJs = async (svg: string, options?: ToJsOptions) => {
  const defaultOptions = {
    optimize: true,
    svgoConfig: {},
    runtime: "automatic",
    importSource: "react",
    pragma: options?.runtime === "classic" ? "createElement" : undefined,
    pragmaFrag: options?.runtime === "classic" ? "Fragment" : undefined,
  };

  const mergedOptions = Object.assign({}, defaultOptions, options);

  const esTree = await toEstree(svg, mergedOptions);

  const { buildJsx } = await (eval(
    `import('estree-util-build-jsx')`
  ) as Promise<typeof import("estree-util-build-jsx")>);

  const esAst = buildJsx(esTree, mergedOptions);
  return generate(esAst);
};

export interface ToJsxComponentOptions extends ToEstreeComponentOptions {}

// transform an svg into a component with raw jsx return value
export const toJsxComponent = async (
  svg: string,
  options: ToJsxComponentOptions
) => {
  const esTreeComponent = await toEstreeComponent(svg, options);
  const { toJs: getJs, jsx } = await (eval(
    `import('estree-util-to-js')`
  ) as Promise<typeof import("estree-util-to-js")>);
  const { value } = getJs(esTreeComponent, { handlers: jsx });
  return value;
};

export interface ToJsComponentOptions
  extends ToJsOptions,
    ToEstreeComponentOptions {}

// transform an svg into a component with jsx runtime function calls return value
export const toJsComponent = async (
  svg: string,
  options?: ToJsComponentOptions
) => {
  const defaultOptions: ToJsComponentOptions = {
    optimize: true,
    svgoConfig: {},
    componentName: "Component",
    passProps: true,
    defaultExport: true,
    importSource: "react",
    runtime: "automatic",
    pragma: options?.runtime === "classic" ? "createElement" : undefined,
    pragmaFrag: options?.runtime === "classic" ? "Fragment" : undefined,
  };

  const mergedOptions = Object.assign({}, defaultOptions, options);

  const esTreeComponent = await toEstreeComponent(svg, mergedOptions);

  const { buildJsx } = await (eval(
    `import('estree-util-build-jsx')`
  ) as Promise<typeof import("estree-util-build-jsx")>);

  const esAst = buildJsx(esTreeComponent, mergedOptions);
  return generate(esAst);
};

interface ToEstreeComponentOptions extends ToEsTreeOptions {
  runtime?: "classic" | "automatic";
  pragma?: string;
  pragmaFrag?: string;
  importSource?: string;
  componentName?: string;
  passProps?: boolean;
  defaultExport?: boolean;
}

// transform an svg into a component in estree format
export const toEstreeComponent = async (
  svg: string,
  options: ToEstreeComponentOptions = {}
) => {
  const defaultOptions = {
    optimize: true,
    svgoConfig: {},
    componentName: "Component",
    passProps: true,
    defaultExport: true,
    runtime: "automatic",
    pragma: options?.runtime === "classic" ? "createElement" : undefined,
    pragmaFrag: options?.runtime === "classic" ? "Fragment" : undefined,
    importSource: "react",
  };

  const mergedOptions = Object.assign({}, defaultOptions, options);

  const esTree = await toEstree(svg, mergedOptions);

  traverse(esTree, {
    enter: function (node) {
      if (node.type === "Program" && node.body) {
        const previousNodeBody = node.body[0] as ExpressionStatement;

        // this is for importing pragma and pragmaFrag when using classic runtime
        const importDeclaration: ImportDeclaration | null =
          mergedOptions?.runtime === "classic"
            ? {
                type: "ImportDeclaration",
                specifiers: [
                  {
                    type: "ImportSpecifier",
                    imported: {
                      type: "Identifier",
                      name: mergedOptions.pragma || "createElement",
                    },
                    local: {
                      type: "Identifier",
                      name: mergedOptions.pragma || "createElement",
                    },
                  },
                  {
                    type: "ImportSpecifier",
                    imported: {
                      type: "Identifier",
                      name: mergedOptions.pragmaFrag || "Fragment",
                    },
                    local: {
                      type: "Identifier",
                      name: mergedOptions.pragmaFrag || "Fragment",
                    },
                  },
                ],
                source: {
                  type: "Literal",
                  value: mergedOptions.importSource || "react",
                  raw: `"${mergedOptions.importSource}"` || '"react"',
                },
              }
            : null;
        const componentNode: VariableDeclaration = {
          type: "VariableDeclaration",
          kind: "const",
          declarations: [
            {
              type: "VariableDeclarator",
              id: {
                type: "Identifier",
                name: mergedOptions.componentName,
              },
              init: {
                type: "ArrowFunctionExpression",
                expression: false,
                generator: false,
                async: false,
                params: mergedOptions.passProps
                  ? [
                      {
                        type: "Identifier",
                        name: "props",
                      },
                    ]
                  : [],
                body: {
                  type: "BlockStatement",
                  body: [
                    {
                      type: "ReturnStatement",
                      argument: previousNodeBody.expression,
                    },
                  ],
                },
              },
            },
          ],
        };
        const componentWithNamedExport: Program["body"] = [
          {
            type: "ExportNamedDeclaration",
            declaration: componentNode,
            specifiers: [],
            source: null,
          },
        ];
        const componentWithDefaultExport: Program["body"] = [
          componentNode,
          {
            type: "ExportDefaultDeclaration",
            declaration: {
              type: "Identifier",
              name: mergedOptions.componentName,
            },
          },
        ];
        if (importDeclaration) {
          node.body = mergedOptions.defaultExport
            ? [importDeclaration, ...componentWithDefaultExport]
            : [importDeclaration, ...componentWithNamedExport];
        } else {
          node.body = mergedOptions.defaultExport
            ? componentWithDefaultExport
            : componentWithNamedExport;
        }
      }

      if (
        mergedOptions.passProps &&
        node.type === "JSXOpeningElement" &&
        node.name.type === "JSXIdentifier" &&
        node.name.name === "svg"
      ) {
        node.attributes.push({
          type: "JSXSpreadAttribute",
          argument: { type: "Identifier", name: "props" },
        });
      }
    },
    fallback: function (node) {
      if (node.type === "JSXFragment") return ["children"];
      if (node.type === "JSXElement") return ["openingElement"];
      if (node.type === "JSXOpeningElement")
        return ["attributes", "name", "selfClosing"];
      if (node.type === "JSXAttribute") return ["name", "value"];
      if (node.type === "JSXIdentifier") return ["name"];
      if (node.type === "JSXSpreadAttribute") return ["argument"];
      throw new Error("unknown node: " + node.type);
    },
  });

  return esTree;
};
