export class ErrorUtils {
  public static GetFirstLine = (error: any): string => {
    return error.error.split('\n', 1)[0];
  };
}
