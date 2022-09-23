# list of API usage in GUI (2.9.8)

# Backend info API
getRstoxPackages()
getAvailableTemplatesDescriptions()
getModelInfo()
# Project APIs
createProject(projectPath, template, ow=FALSE, showWarnings=FALSE,open=TRUE)
openProject(projectPath)
closeProject(projectPath, save=TRUE)
resetProject(projectPath, save)
isProject(projectPath)
saveProject(projectPath)
saveAsProject(projectPath, newProjectPath)
# Model APIs
getProcessTable(projectPath, modelName)
getActiveProcess(projectPath, modelName)
resetModel(projectPath, modelName)
runProcesses(projectPath, modelName, startProcess, endProcess, save=FALSE) #endProcess=startProcess in GUI
rearrangeProcesses(projectPath,modelName,processID,afterProcessID)

# Process APIs
addProcess(projectPath, modelName, value=NULL)
removeProcess(projectPath, modelName, processID)
getProcessPropertySheet(projectPath, modelName, processID)
getFunctionHelpAsHtml(projectPath, modelName, processID)  
getProcessOutputElements(projectPath, modelName, processID)
getProcessOutput(projectPath, modelName, processID, tableName, flatten=TRUE, pretty=true,linesPerPage=2000, pageindex=1,columnSeparator=" ",na="-",drop=true)
getMapData(projectPath, modelName, processID)
getInteractiveMode(projectPath, modelName, processID)
getInteractiveData(projectPath, modelName, processID)
addStratum(projectPath, modelName, processID, stratum)
modifyStratum(projectPath, modelName, processID, stratum)
addAcousticPSU(projectPath, modelName, processID)
addEDSU(projectPath, modelName, processID)
removeEDSU(projectPath, modelName, processID)


# Parameter APIs
setProcessPropertyValue(projectPath, modelName, processID, groupName, name, value) # value is always character
getParameterTableInfo(projectPath,modelName, processID, format

# Help
getObjectHelpAsHtml(packageName,objectName)

#Filter
getFilterOptions(projectPath, modelName, processID, tableName)
expression2list(expr)
json2expression(query)
