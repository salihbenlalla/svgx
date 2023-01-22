# SVGX Vite Plugin for Qwik

Vite plugin to import SVG files as Qwik Components, it transforms raw SVG markup to Qwik Components that can be then inserted directly into the JSX code.

## Install

This package is hybrid (ESM & CommonJS), which means it can be `import`ed or `require`d.

### npm

```
npm install --save-dev @svgx/vite-plugin-qwik
```

## Use

### Include the plugin in vite.config.js

To use this plugin it needs to be included in the plugins array in the `vite.config.js` config file.

```js
import { defineConfig } from "vite";
import svgx from "@svgx/vite-plugin-qwik";

export default defineConfig(async () => {
  return {
    plugins: [
      svgx(),
      /* ... other plugins*/
    ],
  };
});
```

### Import an SVG file

#### **Regular import**

Say you have an SVG file named `icon.svg` and you want to include it in your JSX, you can simply import it as follows (**note:** it is highly recomanded to include the suffix '`?component`')

```js
import MyIcon from "./icon.svg?component";
// <MyIcon />
```

you can also use `?url` suffix to import the SVG as URL

```js
import MyIcon from "./icon.svg?url";
// './assets/svg/icon.svg'
```

or use `?raw` suffix to import the SVG as raw string

```js
import MyIcon from "./icon.svg?raw";
// '<svg xmlns="http://www.w3.org/2000/svg" ...'
```

**Example:**

```jsx
import MyIcon from "./icon.svg?component";
import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div>
      <MyIcon color="#FF5733" />
    </div>
  );
});
```

#### **Dynamic import variables for SVG files**

You have a component that has to render some SVG based on some variable, and this variable could have a lot of different values? one way of solving this is to use the regular import to import all the possible SVGs that could be rendered, and write some complex logic to choose one of them based on the value of that variable, or you may find an easier way to accomplish this, but with this plugin you can do that with just two lines of code, literally!
all you need to do is to write this import statement:

```js
import importVars from "@svgx-dir:/path/to/directory";
```

Replace `/path/to/directory` with the path to the directory containing your SVG files, the path to that directory must be either relative (start with `./`) or absolute (start with `/`, resolved relative to project root) or an alias path.

This feature is using Vite's [**Glob Import**](https://vitejs.dev/guide/features.html#glob-import) feaure, if you want to read more about it head to [Vite Documentation](https://vitejs.dev/guide/features.html#glob-import).

**Important:** you **must** include `@svgx-dir:` before the directory path, otherwise this won't work.

`importVars` is a function that accepts one argument which is a `string` representing the name of an SVG file in that directory without extension (without `.svg` at the end), and returns a function component representing the imported SVG file which you can then include in your JSX:

**Include the SVG into JSX with importVars**

```jsx
import importVars from "@svgx-dir:/path/to/directory";
import { component$ } from "@builder.io/qwik";

export default component$((props) => {
  const MyIcon = importVars(props.iconName);
  return (
    <div>
      <MyIcon color="#FF5733" />
    </div>
  );
});
```

### Pass props to the SVG component

As you can see, you can pass props to your component as you would do with regular JSX's `<svg>` element.
all of this is handled for you by default, without the need to add any config to the plugin. but if you want to change the default settings for some reason, here are the available options:

## Options

all of these options are optional:

### `defaultImport`

- type: `"url" | "raw" | "component"`
- default: `"component"`

use this option to specify wether the plugin should return a component, raw svg string, or a url, when no suffix is appended to the file path. while it's possible to not append any suffix to the file path, appending it is highly recomanded to prevent confusion with other plugins and to get proper typings when using typescript.

### `passProps`

- type: `boolean`
- default: `true`

use this option to specify wether the component accepts props (the props are passed directly to the `<svg>` element using spread operator `<svg {...props}></svg>`).
note that if you are using typescript, you'll still get props suggestions in your IDE even when this option is set to false, so you need to just ignore the suggestions and avoid setting props for the component.

### `optimize`

- type: `boolean`
- default: `true`

Wether to optimize the SVG files or not, (remove useless information like: editor metadata, comments, hidden elements, etc.), the optimization is done using [SVGO](https://github.com/svg/svgo)

### `svgoConfig`

- type: `import("svgo").Config` ([SVGO](https://github.com/svg/svgo) configuration)
- default: default [SVGO](https://github.com/svg/svgo) Options

When `optimize` is set to `true`, you can pass options to [SVGO](https://github.com/svg/svgo) to configure the optimization process.

**Example**

```js
svgx({
  optimize: true,
  svgoConfig: {
    multipass: true,
  },
});
```

### `runtime`

- type: `"classic" | "automatic"`
- default: `"automatic"`

Wether to use **classic** or **automatic** JSX runtime, you can read more about it in the React official documentation ([Introducing the New JSX Transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)), if you are not sure, just leave the default setting as Qwik supports both automatic and classic runtimes.

### `importSource`

- type: `string`
- default: `"@builder.io/qwik"`

Specify where you want to import the JSX runtime from, this is especially useful if you want to use the plugin with other JSX based libraries like React, Preact, Vue, etc.

when `runtime` is set to `"automatic"`, and `importSource` is set to `"@builder.io/qwik"`, this is transformed automatically to `@builder.io/qwik/jsx-runtime`, and when `runtime` is set to `"classic"`, `importSource` is set to `"@builder.io/qwik"`. so you just need to set the package name for this option and the rest is handled for you based on the runtime.

### `pragma`

- type: `string`
- default: `"h"`

You don't need to touch this setting if you are using Qwik, but in case you want to use this plugin with another JSX based library you can set this option to the pragma specific to that library (`createElement` in case of React), you need to use this setting only when `runtime` is `classic`, as the case of `automatic` runtime is handled automatically,

### `pragmaFrag`

- type: `string`
- default: `"Fragment"`

You don't need to touch this setting either if you are using Qwik, all of what has been said for the previous option applies here too, but for the pragma used to handle the fragments.

If you dont know what the **pragma** is, these pages may help you get an idea of it:

- [JSX Pragma](https://theme-ui.com/jsx-pragma) in Theme UI documentation.
- [What is JSX pragma?](https://www.gatsbyjs.com/blog/2019-08-02-what-is-jsx-pragma/) in gatsbyjs documentation.
- [Custom elements in React using a custom JSX pragma](https://dev.to/gugadev/use-custom-elements-in-react-using-a-custom-jsx-pragma-3kc) in dev.to website.

## Typescript

If you are using typescript you may have noticed that typescript is showing this error when using these imports:

```
Cannot find module '@svgx-import:/path/to/directory' or its corresponding type declarations.
```

or

```
Cannot find module '/path/to/icon.svg?component' or its corresponding type declarations
```

To fix this, and to get proper types for the imported components you need to include `"@svgx/vite-plugin-qwik"` in the `types` array in the `compilerOptions` of your `tsconfig.json` file.

**Note:** if you have `"vite/client"` in that array, make sure to include the above declaration file before it, as it may have collisions with it, or better, include it as the first element in the array, like so:

```json
"compilerOptions": {
  "types": ["@svgx/vite-plugin-qwik", "node", "vite/client"],
  // ...other settings
}
```

If you still have problems with typescript make sure to use the suffixes, especially the `?component` suffix if you want to import the SVG as a component. as stated above, you can import the SVG as a component without using any suffixes, but it is highly recomanded to use them.

Another way to use the plugin with typescript is to use the [reference triple slash directive](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html):

```ts
/// <reference types="@svgx/vite-plugin-qwik" />
```
