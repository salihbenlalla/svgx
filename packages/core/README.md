# SVGX core

This is the core package for [@svgx/vite-plugin-react](https://github.com/salihbenlalla/svgx/blob/main/packages/vite-plugin-react) and [@svgx/vite-plugin-qwik](https://github.com/salihbenlalla/svgx/blob/main/packages/vite-plugin-qwik) plugins. it exposes many functions that are used under the hood to transform SVG files into components, these functions may be especially useful for library authors, or you may find them useful for some tasks in your app.

## Install

This package is hybrid (ESM & CommonJS), which means it can be `import`ed or `require`d.

**npm**

```
npm install @svgx/core
```

## API

All of these functions take a raw `svg` string as first argument, and an `options` object as second argument, and return a Promise:

**toHast**

This function takes a raw SVG string and transforms it into **HAST** (Hypertext Abstract Syntax Tree).

- Signature: `toHast: (svg: string, options?: ToHastOptions) => Promise<import("hast").Root>`
- Options:

  ```ts
  interface ToHastOptions {
    optimize?: boolean | undefined;
    svgoConfig?: SVGOConfig | undefined;
  }
  ```

**toEstree**

This function takes a raw SVG string and transforms it into **ESTree** (EcmaScript Tree).

- Signature: `toEstree: (svg: string, options?: ToEsTreeOptions) => Promise<import("estree").Program>`
- Options:

  ```ts
  interface ToEsTreeOptions extends ToHastOptions {}
  ```

**toJsx**

This function takes a raw SVG string and transforms it into **JSX** Element (string).

- Signature: `toJsx: (svg: string, options?: ToJsxOptions) => Promise<string>`
- Options:

  ```ts
  interface ToJsxOptions extends ToEsTreeOptions {}
  ```

**toJs**

This function takes a raw SVG string and transforms it into vanilla javascript (string) with pragma factory function calls.

- Signature: `toJs: (svg: string, options?: ToJsOptions) => Promise<string>`
- Options:

  ```ts
  interface ToJsOptions extends ToEsTreeOptions {
    runtime?: "classic" | "automatic";
    importSource?: string;
    pragma?: string;
    pragmaFrag?: string;
    development?: boolean;
    filePath?: string;
  }
  ```

**toEstreeComponent**

This function takes a raw SVG string and transforms it into a **function component** (not JSX element) represented with **Estree** format.

- Signature: `toEstreeComponent: (svg: string, options?: ToEstreeComponentOptions) => Promise<import("estree").Program>`
- Options:

  ```ts
  interface ToEstreeComponentOptions extends ToEsTreeOptions {
    runtime?: "classic" | "automatic";
    pragma?: string;
    pragmaFrag?: string;
    importSource?: string;
    componentName?: string;
    passProps?: boolean;
    defaultExport?: boolean;
  }
  ```

**toJsxComponent**

This function takes a raw SVG string and transforms it into a **function component** (not JSX element) that returns regular JSX (without compilation).

- Signature: `toJsxComponent: (svg: string, options: ToJsxComponentOptions) => Promise<string>`
- Options:

  ```ts
  interface ToJsxComponentOptions extends ToEstreeComponentOptions {}
  ```

**toJsComponent**

This function takes a raw SVG string and transforms it into a vanilla javascript **function component** (not JSX element), the JSX is compiled down to vanilla javascript.

- Signature: `toJsComponent: (svg: string, options?: ToJsComponentOptions) => Promise<string>`
- Options:

  ```ts
  interface ToJsComponentOptions
    extends ToJsOptions,
      ToEstreeComponentOptions {}
  ```

### Options

As there are many similar options for these functions i decided to document them once and for all:

### `optimize`

- type: `boolean`
- default: `true`

Wether to optimize the SVG files using [SVGO](https://github.com/svg/svgo) or not.

### `svgoConfig`

- type: `import("svgo").Config` ([SVGO](https://github.com/svg/svgo) configuration)
- default: default [SVGO](https://github.com/svg/svgo) Options

If `optimize` is `true`, pass options to [SVGO](https://github.com/svg/svgo).

### `runtime`

- type: `"classic" | "automatic"`
- default: `"automatic"`

Wether to use **classic** or **automatic** JSX runtime.

### `importSource`

- type: `string`
- default: `"react"`

Specify where you want to import the JSX runtime from.

### `pragma`

- type: `string`
- default: `"createElement"`

The pragma specific to the library intended,

### `pragmaFrag`

- type: `string`
- default: `"Fragment"`

The fragment pragma specific to the library intended,

### `development`

- type: `boolean`
- default: `false`

When in the automatic runtime, whether to import `theSource/jsx-dev-runtime.js`, use `jsxDEV`, and pass location info when available.

This helps debugging but adds a lot of code that you don’t want in production.

### `filePath`

- type: `string`
- default: `undefined`

File path to the original source file. Passed in location info to `jsxDEV` when using the automatic runtime with `development: true`.

### `componentName`

- type: `string`
- default: `"Component"`

The identifier of the generated function component.

### `defaultExport`

- type: `boolean`
- default: `true`

Wether to default export the component, or use named export instead.

### `passProps`

- type: `boolean`
- default: `true`

Wether the component accepts props (the props are passed directly to the `<svg>` element using spread operator `<svg {...props}></svg>`).
