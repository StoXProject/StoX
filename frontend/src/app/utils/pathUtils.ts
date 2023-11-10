export class PathUtils {
  public static ConvertBackslash = (path: string) => {
    return path.replace(/\\/g, '/');
  };

  public static ArePathsUnique = (paths): boolean => {
    const tmpArr = [];

    for (let i = 0; i < paths.length; i++) {
      const { path } = paths[i];
      if (tmpArr.indexOf(path) >= 0) {
        return false;
      }

      tmpArr.push(path);
    }

    return true;
  };
}
