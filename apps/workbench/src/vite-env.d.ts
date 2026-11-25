/// <reference types="vite/client" />

/** A source file with its build-time syntax tokens (vite-plugin-examples.ts). */
declare module "*?example" {
  import type { CodeToken } from "@dsw/ui";
  const source: { title: string; code: string; tokens: CodeToken[][] };
  export default source;
}
