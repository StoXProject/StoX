
#' A getOutputTable Function
#'
#' Function getOutputTable.
#' @keywords 
#' @export
#' @examples
#' getOutputTable()
getOutputTable <- function(iProcess, iTable) {

	if(any(is.null(iProcess), is.null(iTable))) {
        stop("Invalid parameters!")
    }
	
	library(RstoxData)
	
	library(data.table)
	
	# setwd("~/../workspace/rfiles")
	
	setwd("~/")
	
	fileName <- paste(c(iProcess, iTable), collapse = "_")
	
	# fileNameWithExtension = paste0(fileName, ".rds")
	
	fileNameWithExtension = paste(fileName, ".rds", sep="")
	
	tableWithData <- readRDS(file = fileNameWithExtension)

	tableWithData
}