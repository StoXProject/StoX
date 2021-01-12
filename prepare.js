function copyUrl(url, target) {
    require('https').get(url, response=> {
      response.pipe(require('fs').createWriteStream(target));
    });
}
// copy files from github that is needed runtime offline as resources
copyUrl("https://raw.githubusercontent.com/StoXProject/versions/master/OfficialRstoxFrameworkVersions.txt", "srv/OfficialRstoxFrameworkVersions.txt")
copyUrl("https://raw.githubusercontent.com/StoXProject/RstoxFramework/develop/R/Versions.R", "srv/Versions.R")