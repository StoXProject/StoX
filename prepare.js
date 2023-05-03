function copyUrl(url, target) {
    require('https').get(url, response=> {
      response.pipe(require('fs').createWriteStream(target));
    });
}
// This was disabled, as RstoxBuild takes care of it:
// copy files from github that is needed runtime offline as resources
//copyUrl("https://raw.githubusercontent.com/StoXProject/RstoxFramework/master/inst/versions/OfficialRstoxFrameworkVersions.txt", "srv/OfficialRstoxFrameworkVersions.txt")
//copyUrl("https://raw.githubusercontent.com/StoXProject/RstoxFramework/master/R/Versions.R", "srv/Versions.R")