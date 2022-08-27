declare module "*.json" {
    const value: any;
    export default value;
  }

declare function assert(value: unknown): asserts value;