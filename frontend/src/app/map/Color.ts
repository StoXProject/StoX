export class Color {
  static rgbVec(col: string): RegExpMatchArray {
    return col.match(/\d+\.\d+|\d+/g);
  }
  static rgbComp(col: string, i: number): number {
    let arr = Color.rgbVec(col);
    if (i < arr.length) {
      return Number(arr[i]);
    }
    return null;
  }

  static rgb(r, g, b, a): string {
    return 'rgb(' + r + ',' + g + ',' + b + (a != null ? ',' + a : '') + ')';
  }
  static darken(c: string, f: number): string {
    return Color.rgb(Math.trunc(Color.rgbComp(c, 0) * f), Math.trunc(Color.rgbComp(c, 1) * f), Math.trunc(Color.rgbComp(c, 2) * f), Color.rgbComp(c, 3));
  }
}
