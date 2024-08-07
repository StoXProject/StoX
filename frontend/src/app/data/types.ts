/*Named index converted to standard object. This is a generic form of 'any' if representing an object with fields, not an array */
export type NamedIndex<T> = {
  [key: string]: T;
};

/*Array of Standar objects - Named Indexes */
export type NamedStringIndex = NamedIndex<string>;
export type NamedStringTable = NamedStringIndex[];
