export type ObjectType<T> = {
  [key in keyof T]?: any;
};
