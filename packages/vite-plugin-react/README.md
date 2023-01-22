# SVGX Vite Plugin for React

Vite plugin to import SVG files as React Components, it transforms raw SVG markup to React Components that can be then inserted directly into the JSX code.

## Install

This package is hybrid (ESM & CommonJS), which means it can be `import`ed or `require`d.

**npm**

```
npm install --save-dev @svgx/vite-plugin-react
```

## Use

**Include the plugin in vite.config.js**

```js
import { defineConfig } from "vite";
import svgx from "@svgx/vite-plugin-react";

export default defineConfig(async () => {
  return {
    plugins: [
      svgx(),
      /* ... other plugins*/
    ],
  };
});
```

## Regular import

```js
import MyIcon from "./icon.svg?component";
// <MyIcon />
```

```js
import MyIcon from "./icon.svg?url";
// './assets/svg/icon.svg'
```

```js
import MyIcon from "./icon.svg?raw";
// '<svg xmlns="http://www.w3.org/2000/svg" ...'
```

## Dynamic import variables

```jsx
import importVars from "@svgx-dir:/path/to/directory";

export default function (props) {
  const MyIcon = importVars(props.iconName);
  return (
    <div>
      <MyIcon color="#FF5733" />
    </div>
  );
}
```

Replace `/path/to/directory` with the path to the directory containing your SVG files.

## Typescript

to get proper typing include this plugin in `types` array in your `tsconfig.json`

```json
// tsconfig.json
"compilerOptions": {
  "types": ["@svgx/vite-plugin-react", "node", "vite/client"],
  // ...other settings
}
```

This plugin works the same as [@svgx/vite-plugin-qwik](https://github.com/salihbenlalla/svgx/blob/main/packages/vite-plugin-qwik). for in depth documentation and options head to [@svgx/vite-plugin-qwik documentation](https://github.com/salihbenlalla/svgx/blob/main/packages/vite-plugin-qwik)
