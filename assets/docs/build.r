cmd <- '{"what":"setProcessPropertyValue","args":"{\"groupName\":\"processArguments\",\"name\":\"functionName\",\"value\":\"\\\"DefineStratumPolygon\\\"\",\"projectPath\":\"C:/Users/aasmunds/Test4.2\",\"modelName\":\"baseline\",\"processID\":\"P001\"}\","package":"RstoxFramework"}' 
    RstoxAPI::runFunction.JSON(cmd)
    
       cmdj <- jsonlite::fromJSON(cmd)

       jsonlite::fromJSON('{"args":"{\"value\":\"\\\"a\\\"\"}"}')    
runFunction.JSON2 <- function(cmd) {
    r <- ""
   tryCatch({
        cmdj <- jsonlite::fromJSON(cmd)
        res <- RstoxAPI::runFunction(cmdj$what, cmdj$args, cmdj$package)
        r <- jsonlite::toJSON(res, pretty = T, auto_unbox = T, 
            na = "string")
    }, warning = function(warning_condition) {
        "warning"
        r <- ""
    }, error = function(error_condition) {
        "error"
        r <- ""
    })
    return(r)
}

jsonlite::fromJSON("\"a\"")    
s <- jsonlite::toJSON(jsonlite::toJSON(list(args=jsonlite::toJSON(list(value=jsonlite::toJSON("a", auto_unbox=T)), auto_unbox=T)), auto_unbox=T), auto_unbox=T)
s
RstoxAPI::runFunction.JSON(s)
jsonlite::fromJSON(jsonlite::fromJSON(jsonlite::fromJSON(s)$args)$value)

RstoxAPI::runFunction(package='RstoxFramework', what='setProcessPropertyValue', args="{\"groupName\":\"processArguments\",\"name\":\"functionName\",\"value\":\"\\\"DefineStratumPolygon\\\"\",\"projectPath\":\"C:/Users/aasmunds/Test4.2\",\"modelName\":\"baseline\",\"processID\":\"P002\"}")

RstoxAPI::runFunction.JSON("{\"what\":\"setProcessPropertyValue\",\"args\":\"{\\\"groupName\\\":\\\"processArguments\\\",\\\"name\\\":\\\"functionName\\\",\\\"value\\\":\\\"\\\\\\\"DefineStratumPolygon\\\\\\\"\\\",\\\"projectPath\\\":\\\"C:/Users/aasmunds/Test4.2\\\",\\\"modelName\\\":\\\"baseline\\\",\\\"processID\\\":\\\"P002\\\"}\",\"package\":\"RstoxFramework\"}")
RstoxAPI::runFunction(package='RstoxFramework', what='setProcessPropertyValue', args='{"groupName":"processArguments","name":"functionName","value":"\"DefineStratumPolygon\"","projectPath":"C:/Users/aasmunds/Test4.2","modelName":"baseline","processID":"P002"}')
traceback()
args<-"{\"groupName\":\"processArguments\",\"name\":\"functionName\",\"value\":\"\\\"DefineStratumPolygon\\\"\",\"projectPath\":\"C:/Users/aasmunds/Test4.2\",\"modelName\":\"baseline\",\"processID\":\"P002\"}"
RstoxAPI::runFunction(package='RstoxFramework', what='setProcessPropertyValue', args)
jsonlite::fromJSON(args)
RstoxAPI::runFunction(package='RstoxFramework', what='setProcessPropertyValue', args="{\"groupName\":\"processArguments\",\"name\":\"functionName\",\"value\":\"\\\"DefineStratumPolygon\\\"\",\"projectPath\":\"C:/Users/aasmunds/Test4.2\",\"modelName\":\"baseline\",\"processID\":\"P002\"}")
args<-"{\"groupName\":\"processArguments\",\"name\":\"functionName\",\"value\":\"\\\"DefineStratumPolygon\\\"\",\"projectPath\":\"C:/Users/aasmunds/Test4.2\",\"modelName\":\"baseline\",\"processID\":\"P002\"}"
    RstoxAPI::runFunction(package='RstoxFramework', what='setProcessPropertyValue', args)
jsonlite::fromJSON(args)
    RstoxAPI::runFunction.JSON("{\"what\":\"setProcessPropertyValue\",\"args\":\"{\\\"groupName\\\":\\\"processArguments\\\",\\\"name\\\":\\\"functionName\\\",\\\"value\\\":\\\"\\\\\\\"DefineStratumPolygon\\\\\\\"\\\",\\\"projectPath\\\":\\\"C:/Users/aasmunds/Test4.2\\\",\\\"modelName\\\":\\\"baseline\\\",\\\"processID\\\":\\\"P002\\\"}\",\"package\":\"RstoxFramework\"}")

    RstoxFramework::setProcessPropertyValue(groupName="processArguments", name="functionName", 
    value="\"DefineStratumPolygon\"", projectPath="C:/Users/aasmunds/Test4.2",
    modelName="baseline", processID="P002")

projectPath <- "C:/Users/aasmunds/Test4.2"
modelName <- "baseline" 
processID <- "P002" 
argumentFilePaths <- NULL

getArgumentsToShow <- function(projectPath, modelName, processID, argumentFilePaths = NULL) {
    
    # Get the function name and arguments:
        functionName <- RstoxFramework:::getFunctionName(projectPath = projectPath, modelName = modelName, processID = processID, argumentFilePaths = argumentFilePaths)
    functionInputs <- RstoxFramework:::getFunctionInputs(projectPath = projectPath, modelName = modelName, processID = processID, argumentFilePaths = argumentFilePaths)
    functionParameters <- RstoxFramework:::getFunctionParameters(projectPath = projectPath, modelName = modelName, processID = processID, argumentFilePaths = argumentFilePaths)
    functionArguments <- c(functionInputs, functionParameters)
    
    # Get the function argument hierarchy:
    functionArgumentHierarchy <- RstoxFramework:::getStoxFunctionMetaData(functionName, "functionArgumentHierarchy", showWarnings = FALSE)
    
    # Loop through the arguments given by parent tags in the functionArgumentHierarchy, and set toShow to FALSE if not any of the criterias are fulfilled:
    toShow <- logical(length(functionArguments))
    names(toShow) <- names(functionArguments)
    for(argumentName in names(toShow)) {
        # Check whether the argument is given in the functionArgumentHierarchy. If not, it will be shown:
        atArgumentName <- which(argumentName == names(functionArgumentHierarchy))
        if(length(atArgumentName)) {
            # Loop through the occurrences of the argumentName in the functionArgumentHierarchy, applying &&:
            hitsAnd <- logical(length(atArgumentName))
            browser()
            for(ind in seq_along(atArgumentName)) {
                # Loop through the conditions and set hitsAnd tot TRUE if at least one condition is fullfilled:
                conditionNames <- names(functionArgumentHierarchy[[atArgumentName[ind]]])
                hitsOr <- logical(length(conditionNames))
                names(hitsOr) <- conditionNames
                browser()
                for(conditionName in conditionNames) {
                    browser()
                    if(functionArguments[[conditionName]] %in% functionArgumentHierarchy[[atArgumentName[ind]]][[conditionName]]) {
                        hitsOr[conditionName] <- TRUE
                    }
                }
                # Apply the OR condition, implying that hitsOr is TRUE if any are TRUE:
                hitsAnd[ind] <- any(hitsOr)
            }
            toShow[[argumentName]] <- all(hitsAnd)
        }
        else {
            toShow[[argumentName]] <- TRUE
        }
    }
    
    # Return only the names of the arguments to show:
    return(names(toShow)[toShow])
}
