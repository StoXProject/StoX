// imports
import path from 'path';
var fs = require('fs')
import os from 'node:os';

// local constants
module Constants {
    export const RES_PATH = 'srv';
}
// exports
export module UtilsConstants {
    export const RES_SERVER_FILENAME = 'server.R';
    export const RES_SERVER_OFFICIALRSTOXFRAMEWORKVERSIONS = "OfficialRstoxFrameworkVersions.txt"
    export const RES_SERVER_VERSIONS = "Versions.R"
}

export class Utils {

    public static getTempPath() {
        return fs.realpathSync(os.tmpdir());  
    }

    public static getTempResFileName(resName: string): string {
        return (Utils.getTempPath() + "/stox." + resName).replace(/\\/g, "/");
    }
    /**
     * extractResourceFile(UtilsConstants.RES_SERVER_FILENAME)
     * @param resName 
     */
    public static async extractResourceFile(resName: string) {
        let resFile = path.join(path.join(__dirname, "../.."), Constants.RES_PATH, resName);
        //console.log("__dirname " + __dirname);
        //console.log("Res file name " + resFile)
        //logInfo('Resource file ' + resFile);
        let serverScript = fs.readFileSync(resFile, { encoding: 'utf-8', flag: 'r' })
        let fileName = Utils.getTempResFileName(resName);
        //logInfo("Writing server.R into " + fileName);
        await fs.writeFile(fileName, serverScript, () => { });
    }
}

