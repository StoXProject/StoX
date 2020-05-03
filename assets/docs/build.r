#install Rstox
devtools::install_github("https://github.com/StoXProject/RstoxData", ref="NewStoxAcoustic", force=T, upgrade = FALSE) 
devtools::install_github("https://github.com/StoXProject/RstoxBase", ref="develop", force=T,  upgrade = FALSE) 
devtools::install_github("https://github.com/StoXProject/RstoxFramework", ref="develop", force=T, upgrade=FALSE) 
devtools::install_github("https://github.com/StoXProject/RstoxAPI", ref="master", force=T, upgrade=FALSE) 

#Release scripts
devtools::install_github("https://github.com/StoXProject/RstoxData", ref="master", force=T, upgrade = FALSE) 
devtools::install_github("https://github.com/StoXProject/RstoxBase", ref="master", force=T,  upgrade = FALSE) 
devtools::install_github("https://github.com/StoXProject/RstoxFramework", ref="master", force=T, upgrade=FALSE) 
devtools::install_github("https://github.com/StoXProject/RstoxAPI", ref="master", force=T, upgrade=FALSE) 

# The following installs the versions of the Rstox packages used by StoX:
# Restart R
# Remove the Rstox packages:
RstoxPackages <- c("RstoxData", "RstoxBase", "RstoxFramework", "RstoxAPI")
remove.packages(RstoxPackages)
# Install the Rstox packages:
devtools::install_github("StoXProject/RstoxAPI", upgrade = FALSE, force = TRUE)


dt <- data.table::data.table(x= c(list(1),list(2, 2)))
jsonlite::toJSON(dt[1], auto_unbox = T)
jsonlite::fromJSON("[]")

jsonlite::toJSON(list(a=), auto_unbox=T)
str(jsonlite::fromJSON("{\"a\":\"Inf\"}"))
