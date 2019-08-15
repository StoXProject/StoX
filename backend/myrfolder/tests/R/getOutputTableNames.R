
#' A getOutputTableNames Function
#'
#' Function getOutputTableNames.
#' @keywords 
#' @export
#' @examples
#' getOutputTableNames()
getOutputTableNames <- function(iProcess) {

	if(is.null(iProcess)) {
        stop("Invalid parameter!")
    }
	
	# setwd("~/../workspace/rfiles")
	
	setwd("~/")
	
	pattPrefix <- paste(c(iProcess, ".*"), collapse = "_")
	
	patt <- paste0("^", pattPrefix)
	
	fullPattern <- paste0(patt, "\\.rds$")

	rdsFileNames <- list.files(pattern = fullPattern);

	toremove <- paste0(iProcess, "_")

	rdsFileNames <- sub(toremove, "", rdsFileNames)

	rdsFileNames <- sub(".rds", "", rdsFileNames)
	
	return (rdsFileNames)
}
