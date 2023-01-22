declare module "*.svg?component" {
  import { FunctionComponent, QwikIntrinsicElements } from "@builder.io/qwik";
  const Component: FunctionComponent<QwikIntrinsicElements["svg"]>;
  export default Component;
}

declare module "*.svg?url" {
  const src: string;
  export default src;
}

declare module "*.svg?raw" {
  const src: string;
  export default src;
}

declare module "@svgx-dir:*" {
  import { FunctionComponent, QwikIntrinsicElements } from "@builder.io/qwik";
  const importVars: (
    fileName: string
  ) => FunctionComponent<QwikIntrinsicElements["svg"]>;
  export default importVars;
}
