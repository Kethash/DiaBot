declare module "*.json" {
    const value: any;
    export default value;
}

declare function assert(value: unknown): asserts value;

declare type autoquizz = {
  title: String, 
  questions: []
}

declare type jsonquizz = {
  name: string, 
  description: string, 
  quizzs: Array<{imageLink: string, answers: string}>
}