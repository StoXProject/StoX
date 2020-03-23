#install Rstox
devtools::install_github("https://github.com/StoXProject/RstoxData", ref="NewStoxAcoustic", force=T, upgrade = FALSE) 
devtools::install_github("https://github.com/StoXProject/RstoxBase", ref="develop", force=T,  upgrade = FALSE) 
devtools::install_github("https://github.com/StoXProject/RstoxFramework", ref="develop", force=T, upgrade=FALSE) 
devtools::install_github("https://github.com/StoXProject/RstoxAPI", ref="master", force=T, upgrade=FALSE) 
