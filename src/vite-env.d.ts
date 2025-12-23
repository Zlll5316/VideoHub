/// <reference types="vite/client" />

// JSON 模块类型声明
declare module '*.json' {
  const value: any;
  export default value;
}
