declare module "*.svg?component" {
  import { FC } from "react";
  import { SVGProps, ReactSVGElement } from "react";
  const Component: FC<SVGProps<ReactSVGElement>>;
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
  import { FC } from "react";
  import { SVGProps, ReactSVGElement } from "react";
  const importVars: (fileName: string) => FC<SVGProps<ReactSVGElement>>;
  export default importVars;
}
