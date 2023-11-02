export class HTMLUtil {
  /**
   * Format tag property as in a html tag prop="val[unit]" with preceding space
   * @param prop
   * @param val
   */
  public static formatTagProp(prop, val) {
    return ' ' + prop + '="' + val + '"';
  }
  public static formatTagPropUnit(prop, val, unit) {
    return HTMLUtil.formatTagProp(prop, val + unit);
  }
  public static formatTagPropPx(prop, val) {
    return HTMLUtil.formatTagPropUnit(prop, val, 'px');
  }
}
