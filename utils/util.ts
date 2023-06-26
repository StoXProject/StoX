// imports
import path from 'path';
var fs = require('fs')
// local constants
module Constants {
    export const RES_PATH = 'srv';
}
// exports
export module UtilsConstants {
    export const RES_SERVER_FILENAME = 'server.R';
    export const RES_SERVER_OFFICIALRSTOXFRAMEWORKVERSIONS = "OfficialRstoxFrameworkVersions.txt"
    export const RES_SERVER_OFFICIASTOXVERSIONS = "Official_StoX_versions.txt"
    
}

export class Utils {


    public static getTempResFileName(resName: string, subFolder: string): string {
        return (require('temp-dir') + "/" + subFolder + "/" + resName).replace(/\\/g, "/");
    }
    
    public static getResFileName(resName: string): string {
        return (path.join(path.join(__dirname, "../.."), Constants.RES_PATH, resName));
    }
    
    /**
     * extractResourceFile(UtilsConstants.RES_SERVER_FILENAME)
     * @param resName 
     */
    public static async extractResourceFile(resName: string, subFolder: string) {
        let resFile = Utils.getResFileName(resName);
        //console.log("> " + "__dirname " + __dirname);
        //console.log("> " + "Res file name " + resFile)
        //logInfo('Resource file ' + resFile);
        let serverScript = fs.readFileSync(resFile, { encoding: 'utf-8', flag: 'r' })
        let fileName = Utils.getTempResFileName(resName, subFolder);
        //logInfo("Writing server.R into " + fileName);
        await fs.writeFile(fileName, serverScript, () => { });
    }

    public static async createStoXGUIInternal() {
        
        let packageName = "StoXGUIInternal";
        let RSubFolder = packageName + "/" + "R";

        // Create the temporary StoXGUIInternal package folder:
        let StoXGUIInternalFolder = Utils.getTempResFileName(packageName, "stox")
        if (fs.existsSync(StoXGUIInternalFolder)){
            fs.rmSync(StoXGUIInternalFolder, { recursive: true, force: true });
        }
        fs.mkdirSync(StoXGUIInternalFolder);
        
        // Create the temporary R folder:
        let StoXGUIInternalRFolder = Utils.getTempResFileName(RSubFolder, "stox")
        if (fs.existsSync(StoXGUIInternalRFolder)){
            fs.rmSync(StoXGUIInternalRFolder, { recursive: true, force: true });
        }
        fs.mkdirSync(StoXGUIInternalRFolder);
        
        // Copy the DESCRIPTION file:
        Utils.extractResourceFile("DESCRIPTION", "stox" + "/" + packageName);
        // Copy the NAMESPACE file:
        Utils.extractResourceFile("NAMESPACE", "stox" + "/" + packageName);
        // Copy the DESCRIPTION file:
        Utils.extractResourceFile("StoXGUIInternal.R", "stox" + "/" + RSubFolder);

        return("true");
    }

}

