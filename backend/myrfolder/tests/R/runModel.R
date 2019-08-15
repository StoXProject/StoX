#' A runModel Function
#'
#' Function runModel.
#' @keywords 
#' @export
#' @examples
#' runModel()

runModel <- function(iFrom, iTo) {
	
	if(any(is.null(iFrom), is.null(iTo))) {
        stop("Invalid parameters!")
    }	
	
	library(RstoxData)

	library(data.table)
	
	# setwd("~/../workspace/rfiles")
	
	setwd("~/")

	# Download biotic data
	download.file("http://tomcat7.imr.no:8080/apis/nmdapi/biotic/v3/Forskningsfart%C3%B8y/2018/Johan%20Hjort_LDGJ/2018202/snapshot/latest", "test_biotic.xml")
	
	BioticData <- readXmlFile("test_biotic.xml")
	
	i <- iFrom
	
	while(i <= iTo) {
		
		filename <- paste(c(i, "mission.rds"), collapse = "_")
		saveRDS(BioticData[["mission"]], file=filename)		
		
		filename <- paste(c(i, "fishstation.rds"), collapse = "_")
		saveRDS(BioticData[["fishstation"]], file=filename)
		
		filename <- paste(c(i, "catchsample.rds"), collapse = "_")
		saveRDS(BioticData[["catchsample"]], file=filename)
		
		filename <- paste(c(i, "individual.rds"), collapse = "_")
		saveRDS(BioticData[["individual"]], file=filename)
		
		filename <- paste(c(i, "agedetermination.rds"), collapse = "_")
		saveRDS(BioticData[["agedetermination"]], file=filename)
				
		i <- (i + 1)
	}
	
	return (BioticData[["fishstation"]])
}

