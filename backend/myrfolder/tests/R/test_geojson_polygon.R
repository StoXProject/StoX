#' A test_geojson_polygon Function
#'
#' This function to test geojson polygon.
#' @param no parameters.
#' @keywords geojson
#' @export
#' @examples
#' test_geojson_polygon()

test_geojson_polygon <- function() {
	library(geojsonio)
	vecs <- list(c(7.4652,68.1232), c(3.846,65.9786), c(4.8161,74.3698), c(7.4652,68.1232))
	mypolygon <- as.json(geojson_list(vecs, geometry="polygon"), pretty = TRUE)  
   return(mypolygon)
}
