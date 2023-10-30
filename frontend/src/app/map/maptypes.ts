export interface RectangleSymbol {
  shape: 'rect'; // discriminant
  // Rectangle spesific properties
  width: number;
  height: number;
}
export interface CircleSymbol {
  shape: 'circle'; // discriminant
  // Circle spesific properties
  radius: number;
}
// Discriminant union for Shape symbols. To be used with type-guards (switch-case)
export type MapSymbol = RectangleSymbol | CircleSymbol;
