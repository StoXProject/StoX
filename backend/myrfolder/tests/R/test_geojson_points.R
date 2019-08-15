#' A test_geojson_points Function
#'
#' This function to test geojson points.
#' @param no parameters.
#' @keywords geojson
#' @export
#' @examples
#' test_geojson_points()

test_geojson_points <- function() {
	library(geojsonio)
	acdata <- data.frame("lat"=c(68.1232, 65.9786, 74.3698), "long"=c(7.4652, 3.846, 4.8161), "id"=c(1,2,3), "hasCatch"=c("true", "false", "true"))
	points <- as.json(geojson_list(acdata, lat='lat', lon='long'), pretty = TRUE)  
    return(points)
}
