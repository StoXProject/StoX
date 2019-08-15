#' A readBioticDataFromXml Function
#'
#' This function is used to read Biotic Data From Xml file.
#' @param no parameters.
#' @keywords 
#' @export
#' @examples
#' readBioticDataFromXml()

readBioticDataFromXml <- function() {
	
	library(RstoxData)

	library(data.table)

	# Download biotic data
	download.file("http://tomcat7.imr.no:8080/apis/nmdapi/biotic/v3/Forskningsfart%C3%B8y/2018/Johan%20Hjort_LDGJ/2018202/snapshot/latest", "test_biotic.xml")
	
	BioticData <- readXmlFile("test_biotic.xml")

	return (BioticData[["fishstation"]])
}
