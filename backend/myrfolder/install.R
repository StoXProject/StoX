#esmaelmh
setwd("C:/Users/esmaelmh/Documents/myrfolder")  
install("tests")

#aasmunds
setwd("E:/Projects/StoxProject/StoX/backend/myrfolder") 
install.packages("tests", repos = NULL, type = "source")
install.packages("devtools")
# FIrst RTools must be installed manually under c:\program files and added to path
# then devtools must be installed after that
library(devtools)
devtools::find_rtools()
devtools::install_github("stoxproject/RstoxData")

install.packages("geojsonio")
install.packages("xml2")
install.packages("Rcpp")
install.packages("rlang")
# use
library(tests)
library(RStoxData)
getOutputTable(1,1)

remove.packages("devtools")
install.packages("widgets")

