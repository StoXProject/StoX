# StoX v4.0.1-9004 (2024-11-01)

## Summary
* The StoX version 4.0.1-9004 is a bugfix pre-release before StoX 4.1.0.

## Detailed changes
* Breaking change: Changed default from save = TRUE to save = FALSE in runModel(), runProject() and runProjects().
* Updated the documentation of StratumNameLabel.

## Bug fixes
* Fixed bug in asIntegerAfterRound() used when setting class of ICES data to avoid floating point to integer errors. The bug appeared when the input was character (but convertible to numeric). 
* Fixed bug with numeric vectors with NAs in factorNAfirst().
* Fixed bug in runProject() where startProcess and endProcess outside of the range of processes resulted in a warning. In the new version these are truncated to the range of processes. 
* Fixed warnings in translateOneTable() so that a warning is given if the variable to translate is not present in any table, and if any conditional variables are not present in a table to be translated.


# StoX v4.0.1-9003 (2024-10-30)

## Summary
* The StoX version 4.0.1-9003 is a pre-release before StoX 4.1.0. The pre-release fixes multiple bugs, in particular a bug in parameter tables where numeric values entered in one row was copied to the first row, thus overwriting the user input in the first row.

## General changes
* Changed how output files are deleted. Before, output files were deleted for all later processes in a model in addition to the processes of later models using any of these processes. Now, the processes which have an argument UseOutputData = TRUE are not deleted.
* Added a warning in NASC() for multiple Beam with the same frequency, which may lead to over-estimation.
* Added splitting by both "-" and "/" in formatOutput to ensure correct sorting. This change should not affect any results through imputation as all known StoX project use only one SpeciesCategory in SuperIndividuals.
* Changed the drop down list of ConditionalVariableNames in Translate functions to only include the variables in the table of the VariableName (and also excluding the VariableName). Previously all variables of the entire data were listed, which was confusing since only those present in the relevant table could be used.
* Changed the behavior of Translate functions when a variable that is not present in the table is used as a conditional variable. Before this conditional variable was effectively ignored, but in the new version the behavior is to give a warning and not perform any translation.
* Added a warning if no values are translated in Translate functions.
* Added the new GeneticPopulationCode to ICESBiotic().

## Detailed changes
* Refactored resampling functions used in Bootstrap() to save a resamplingFactor in the resampling and then scale the data using the new applyResamplingFactor().
* Changed aggregateBaselineDataOneTableSingleFunction() used by aggregateBaselineDataOneTable() to pad with zeros for all "data" variables, as specified in the dataTypeDefinition.
* Temporarily hiding Prey functions.

## Bug fixes
* Fixed bug in factorNAfirst() which failed when age plus group was not used.
* Fixed bug in ReportBootstrap when an integer variables with missing values are reported (in which case replacing NA by 0 did not work).
* Fixed bug in as.numeric_IfPossible() used by setorderv_numeric() and orderRowsByKeys() where individual elements could be set to NA in a vector unless all of the values were NA after conversion to numeric. In the new version all of the values must be convertible to numeric for a numeric vector to be returned. In addition setorderv_numeric() has gained the parameter split, which is used in RstoxBase::formatOutput() as split = c("-", "/") to split both by the within StoX key separator and the between StoX kye separator used in IDs such as Sample and Individual. This bugfix may result in different sorting of StoxBiotic, particularly for NMDBiotic data with herring coded as catchcategory 161722.G03, 161722.G05 or 161722.G07.


# StoX v4.0.1-9002 (2024-10-10)

## Summary
* The StoX version 4.0.1-9002 is a pre-release before StoX 4.0.1 (or perhaps 4.1.0). The pre-release fixes multiple bugs, and in particular a bug occurring when modifying a heavy stratum in the GUI (payload too large error). The most important bugfix was that certain values of BiologyLengthCode were shifted down one value in ICESBiotic(). 

## General changes
* Added SpeedGround as vesselspeed from NMDBiotic in ICESBiotic().
* Changed mapplyOnCores() to using sockets both for Windows and macOS, which solved the problem that the memory of the parent R session was copied to all cores, potentially causing memory issues.
* Added support for numeric sorting of plus groups in plots, so that 9 comes before 10+.
* Added warning if there are duplicated StratumLayerIndividual in Individuals(). There may however be duplicated StratumLayerIndividual in SuperIndividuals(), e.g. when multiple Beam are used. Added support in imputation to tackle this.
* Added the resampling function Resample_PreySpeciesCategoryCatchData_Hierarchical, which does actual resampling by repeating entries that are sampled more than once, as opposed to scaling the data variable.
* Renamed the resampling functions used in Bootstrap to the following convension: "Resample" + "\_" + dataType + "\_" + specification, where dataType is the StoX data type such as "MeanNASCData" and "BioticAssignment", and specification is any string in CamelCase describing the resampling function, such as "ByStratum" and "ByAcousticPSU":
    * "ResampleMeanLengthDistributionData" -> "Resample_MeanLengthDistributionData"
    * "ResampleMeanSpeciesCategoryCatchData" -> "Resample_MeanSpeciesCategoryCatchData"
    * "ResamplePreySpeciesCategoryCatchData" -> "Resample_PreySpeciesCategoryCatchData_HierarchicalUsingScaling"
    * "ResampleBioticAssignmentByStratum" -> "Resample_BioticAssignment_ByStratum"
    * "ResampleBioticAssignmentByAcousticPSU" -> "Resample_BioticAssignment_ByAcousticPSU"
    * "ResampleMeanNASCData" -> "Resample_MeanNASCData"
* Changed to show TargetVariableUnit in ReportBootstrap() only when the ReportFunction is not a fraction (fractionOfOccurrence or fractionOfSum).

## Detailed changes
* Added documentation of PreySpeciesCategory and PreySample in StoxBiotic.
* Fixed inaccuracies in the documentation of the StoxBiotic format.
* Added warning when there are missing values in keys in StoxBiotic.
* Renamed ReportVariable to TargetVariable and ReportVariableUnit to TargetVariableUnit in ReportSpeciesCategoryCatch() for consistency with other report functions.
* Added the progress of writing the nc file in Bootstrap() to the progress file (which is used by estimateTimeOfProcesses()).
* Added explicit error message when a variable is requested that does not exist in a Bootstrap nc file.
* Relaxed error to warning for unknown file extension in output files read through readModelData().

## Bug fixes
* Fixed bug when modifying a heavy stratum in the GUI, which appeared to work but when the StratumPolygon process was re-run the modifications were lost.
* Fixed a bug where certain values of BiologyLengthCode were shifted one integer value down in ICESBiotic(). The bug is related to floating point precision which causes some values to be slightly lower than the corresponding integer after calculations. In R one example is format(29 / 100 * 100, digits = 20) = "28.999999999999996447", which results in 28 when converted to integer. The following values are affected:
	* 29, 57, 58, 113, 114, 115, 116 when BiologyLengthCode is "cm" (lengthresolution "3")
	* 1001, 1003, 1005, 1007, 1009, 1011, 1013, 1015, 1017, 1019, 1021 and 1023 when BiologyLengthCode is "mm"  (lengthresolution "1")
	* 1005 and 1015 (a subset of the values for "mm") when BiologyLengthCode is "halfcm" (lengthresolution "2")
* Fixed bug in colors of processes to not show bold for ProcessData processes that are used by a later ProcessData process where this use is hidden by UseProcessData.
* Fixed bug where the function inputs to a process data process were not considered when UseProcessData is TRUE, with the consequence that the process was marked as terminal (bold in the GUI).
* Fixed bug when using DefinitionMethod = "PreDefined" in DefineAcousticPSU().
* Fixed bug in RedefineStoxBiotic(), where duplicated keys in the input BioticData were warned but not removed.
* Fixed bug where PreyCatchfractionWeight = 0 was set to NA if PreyCatchFractionWeightResolution was missing. Now returning 0.
* Fixed problem with selecting PointColor in PlotAcousticTrawlSurvey() in the GUI.


# StoX v4.0.1-9002 (2024-10-10)

## Summary
* The StoX version 4.0.1-9003 is a pre-release before StoX 4.0.1 (or perhaps 4.1.0). The pre-release fixes multiple bugs, and in particular a bug occurring when modifying a heavy stratum in the GUI (payload too large error). The most important bugfix was that certain values of BiologyLengthCode were shifted down one value in ICESBiotic(). 

## General changes
* Added SpeedGround as vesselspeed from NMDBiotic in ICESBiotic().
* Changed mapplyOnCores() to using sockets both for Windows and macOS, which solved the problem that the memory of the parent R session was copied to all cores, potentially causing memory issues.
* Added support for numeric sorting of plus groups in plots, so that 9 comes before 10+.
* Added warning if there are duplicated StratumLayerIndividual in Individuals(). There may however be duplicated StratumLayerIndividual in SuperIndividuals(), e.g. when multiple Beam are used. Added support in imputation to tackle this.
* Added the resampling function Resample_PreySpeciesCategoryCatchData_Hierarchical, which does actual resampling by repeating entries that are sampled more than once, as opposed to scaling the data variable.
* Renamed the resampling functions used in Bootstrap to the following convension: "Resample" + "_" + dataType + "_" + specification, where dataType is the StoX data type such as "MeanNASCData" and "BioticAssignment", and specification is any string in CamelCase describing the resampling function, such as "ByStratum" and "ByAcousticPSU":
    * "ResampleMeanLengthDistributionData" -> "Resample_MeanLengthDistributionData"
    * "ResampleMeanSpeciesCategoryCatchData" -> "Resample_MeanSpeciesCategoryCatchData"
    * "ResamplePreySpeciesCategoryCatchData" -> "Resample_PreySpeciesCategoryCatchData_HierarchicalUsingScaling"
    * "ResampleBioticAssignmentByStratum" -> "Resample_BioticAssignment_ByStratum"
    * "ResampleBioticAssignmentByAcousticPSU" -> "Resample_BioticAssignment_ByAcousticPSU"
    * "ResampleMeanNASCData" -> "Resample_MeanNASCData"
* Changed to show TargetVariableUnit in ReportBootstrap() only when the ReportFunction is not a fraction (fractionOfOccurrence or fractionOfSum).

## Detailed changes
* Added documentation of PreySpeciesCategory and PreySample in StoxBiotic.
* Fixed inaccuracies in the documentation of the StoxBiotic format.
* Added warning when there are missing values in keys in StoxBiotic.
* Renamed ReportVariable to TargetVariable and ReportVariableUnit to TargetVariableUnit in ReportSpeciesCategoryCatch() for consistency with other report functions.
* Added the progress of writing the nc file in Bootstrap() to the progress file (which is used by estimateTimeOfProcesses()).
* Added explicit error message when a variable is requested that does not exist in a Bootstrap nc file.
* Relaxed error to warning for unknown file extension in output files read through readModelData().

## Bug fixes
* Fixed bug when modifying a heavy stratum in the GUI, which appeared to work but when the StratumPolygon process was re-run the modifications were lost.
* Fixed a bug where certain values of BiologyLengthCode were shifted one integer value down in ICESBiotic(). The bug is related to floating point precision which causes some values to be slightly lower than the corresponding integer after calculations. In R one example is format(29 / 100 * 100, digits = 20) = "28.999999999999996447", which results in 28 when converted to integer. The following values are affected:
	* 29, 57, 58, 113, 114, 115, 116 when BiologyLengthCode is "cm" (lengthresolution "3")
	* 1001, 1003, 1005, 1007, 1009, 1011, 1013, 1015, 1017, 1019, 1021 and 1023 when BiologyLengthCode is "mm"  (lengthresolution "1")
	* 1005 and 1015 (a subset of the values for "mm") when BiologyLengthCode is "halfcm" (lengthresolution "2")
* Fixed bug in colors of processes to not show bold for ProcessData processes that are used by a later ProcessData process where this use is hidden by UseProcessData.
* Fixed bug where the function inputs to a process data process were not considered when UseProcessData is TRUE, with the consequence that the process was marked as terminal (bold in the GUI).
* Fixed bug when using DefinitionMethod = "PreDefined" in DefineAcousticPSU().
* Fixed bug in RedefineStoxBiotic(), where duplicated keys in the input BioticData were warned but not removed.
* Fixed bug where PreyCatchfractionWeight = 0 was set to NA if PreyCatchFractionWeightResolution was missing. Now returning 0.
* Fixed problem with selecting PointColor in PlotAcousticTrawlSurvey() in the GUI.


# StoX v4.0.1-9001 (2024-09-03)

## Summary
* The StoX version 4.0.1-9001 is a pre-release before StoX 4.0.1. The pre-release contains the new tables PreySpeciesCategory and PreySample in StoxBiotic and new functions PreySpeciesCategoryCatch and ReportPreySpeciesCategoryCatch, for estimates from prey data in NMDBiotic files.

## General changes
* Added tables PreySpeciesCategory and PreySample in StoxBiotic, and prepared for adding PreyIndividual. 
* Added functions PreySpeciesCategoryCatch and ReportPreySpeciesCategoryCatch.
* Added the ReportFunction "number", "fractionOfOccurrence" and "fractionOfSum".
* Added resample function ResamplePreySpeciesCategoryCatchData().

## Detailed changes
* Changed error to something sensible when ReportFunction or TargetVariable are empty in ReportDensity().
* Removed stop in ReportBootstrap when Bootstrap() is not run, and rather showing the default warning.

## Bug fixes
* Fixed bug where reports could be run even though the Baseline model had been rerun."
* Fixed bug where possible values where not available for DensityUnit in ReportDensity().
* Fixed bug where a ReportBootstrap process could be run even if the Baseline model or the Bootstrap process was reset. Also introduced the columns usedInRecursiveProcessIndices, usedInRecursiveProcessIDs and usedInRecursiveProcessNames in getProcessTable() to support resetting processes using outputs from processes in previous tables.
* Fixed bug where defaults were not given for Percentages and GroupingVariables in ReportBootstrap().


# StoX v4.0.0 (2024-07-12)

## Summary
* The StoX version 4.0.0 is a major release which includes several improvements to the StoX GUI, new features like unlimited bootstrapping using NetCDF4 files, and a series of bugfixes. The release contains two breaking changes which may result in differences to existing StoX projects (acoustic-trawl StoX projects with differently assigned hauls to acoustic PSUs in a stratum, or where hauls are used in multiple strata). See details below.

## Changes affecting backward compatibility
1. In acoustic-trawl projects hauls are assigned to the acoustic PSUs (function BioticAssignment) in order to produce a length distribution (function AssignmentLengthDistribution) used for converting NASC to number density (function AcousticDensity). When boostrapping acoustic-trawl projects in StoX <= 3.6.2 the collection of hauls assigned to at least one acoustic PSU in a stratum is resampled with replacement, so that the hauls are sampled 0, 1, 2, etc times. If hauls are assigned differently to different acoustic PSUs there is a probability that none of the assigned hauls are resampled for a specific acoustic PSU. This can lead to under-estimation, as the corresponding NASC cannot be converted to density without a length distribution (resulting in missing density). In StoX 4.0.0 this results in a warning and a proposal to use the new resampling function that samples only from the assigned hauls for each individual acoustic PSU (using ResampleBioticAssignmentByPSU instead of ResampleBioticAssignmentByStratum in the BootstrapMethodTable). Making this change to a StoX project will change the results, and may also require new assignments to be defined in case there are acoustic PSUs with only one assigned haul, which will result in no contribution to the bootstrap variation from those PSUs.

2. A bug in ImputeSuperIndividuals() in StoX <= 3.6.2, occurring in acoustic-trawl projects when hauls are assigned to more than one stratum, could result in data not being fully imputed. The bug was that the Individual column was used to identify rows to impute from, but the values of this column are not unique when an individual is used in more than one stratum. A row with data to be imputed could thus me masked by another row with the same Individual. To solve this the new StoX version has introduced a new column of unique values named StratumLayerIndividual which is used in the imputation.

## Changes in the GUI
* Added green bold for input and output processes to the selected process and black bold for processes not used in any other processes in the model. Processes that use the selected process but are not used by any other process in the model are show as dark green bold.
* Added a stop button that stops a model between two processes or stops a Bootstrap process between two bootstrap replicates.
* The filter expression builder is now faster and can be used also when the input process has not been run (in which case there are no options to select from).
* Increased resolution of the map.
* Added "Open project as template" on the Project menu, which creates a new project with the same processes as the selected template project, but where all input files and process data are deleted, and UseProcessData is set to FALSE for all process data processes.
* Added manual tagging of Stations to BioticPSU. This can be used to group stations together or create PSUs for stations that accidently fall outside of a stratum.
* Added support for selecting multiple files, e.g. in ReadBiotic
* Added zoom in and out buttons in the map.
* Allowed selecting from possible values in the filter expression builder for numeric values which are mostly whole numbers. Also excluded possible values for keys.
* Added note in the User log and a link in the Help menu when there is a new official release.
* Typing and selcting in drop-down lists now works as expected
* Added printing of messages, warnings and errors for parallel bootstrapping.
* Added the number of identical warnings in the warning printout. This is useful e.g. to get an idea of how many bootstrap replicates that has a problem of missing assignment length distribution for AcousticPSUs.

## General changes
* Bootstrap now use netCDF4 files which facilitates practically unlimited number of bootstrap replicates as well as selecting parameter values in ReportBootstrap() from drop-down lists. The change also speeds up ReportBootstrap(). 
* Added warning when opening an existing StoX project using Bootstrap, informing the used about how to use the OutputVariables argument in Bootstrap to reduce the time used by the Bootstrap function.
* Added message about how to read a bootstrap NetCDF4 file into R to replicate the old bootstrap RData file.
* Added defaults "Survey" and "SpeciesCategory" in GroupingVariables of reports.
* Added truncation of output from ICESDatsusc() and similar functions in the Preview in the GUI.
* Added the ICESBioic format 1.6 that includes the new GeneticPopulationCode field.
* Moved warnings for only one PSU from Baseline to Bootstrap (as warnings can now be shown from Bootstrap).
* Moved printing of "Running baseline process" type of messages from backend to frontend, so that this gets printed before the process runs and not after.
* Relaxed validation of the project.json to only consider the first 6 rows (using utils::head()) of each table or sf object. This was due to an observed crash of jsonvalidate::json_validator() for project.json of size larger than 1/2 GB.
* Renamed AggregationFunction to ReportFunction and AggregationWeightingVariable to WeightingVariable.
* Added support for reading a project.json in DefineSurvey(), DefineAcousticPSU(), DefineBioticPSU(), DefineBioticAssignment() and DefineStratumPolygon.
* Added functions ICESDatsusc(), CopyICESDatsusc, FilterICESDatsusc, TranslateICESDatsusc and WriteICESDatsusc().
* Changed a number of parameter to class "single" (DensityType, TargetVariableUnit, etc).
* Changed sorting of StratumLayerIndividual when creating the StratumLayerIndividualIndex to platform independent locale = "en_US_POSIX". This is actually a bug, but has not been discovered since all known StoX projects have been using input data with Cruise as numbers of only upper case letters (sorting by locale = "en_US_POSIX" arranges capital letters first (India before england)).
* Restricted warning for missing or 0 EffectiveTowDistance to only activate when there are there are more than 0 individuals in the Haul. 
* Removed dependency on the retiring R package sp.
* Added ResampleBioticAssignmentByPSU() and ResampleBioticAssignmentByStratum(), where the latter is identical to the ResampleBioticAssignment() of StoX <= 3.6.2.
* Speeding up openProject() for StoX projects with large process data tables.
* Changed GearDependentCatchCompensation() to keep all variables from the input SpeciesCategoryCatchData.
* Added PlotAcousticTrawlSurvey().
* Added message about what the R connection was set to.

## Bug fixes
* Fixed bug in DefineSurvey with DefinitionMethod = "ResourceFile", where the FileName was the path to a project.xml file.
* Fixed the problem of truncated time steps when writing bootstrap data to NetCDF4 file, due to R's awkward bug with formatting POSIXct objects (the last decimal trucated).
* Fixed bug where existing bootstrap data was deleted even when UseOutputData = TRUE.
* Fixed bug which made some plotting functions failing seemingly randomly, by no longer setting precision in plot functions.
* Fixed bug in the GUI where R 4.4.0 was not supported.
* Fixed bug in EstimateBioticRegression(), where failed estimate (e.g. due to singularity) resulted in two instead of 1 row in the output RegressionTable.
* Fixed bug where empty tables showed with duplicated header row in Preview in the GUI.
* Fixed bug in FilterLanding() by adding expandFilterExpressionList().
* Fixed bug when ReportVariableUnit is first inserted and then cleared, which resulted in error in the form "... is not a valid name for quantity ...".
* Fixed bug in getFilterTableNames() where the json array was unboxed in runFunction.JSON() (due to auto_unbox = TRUE) when only one name was returned. Fixed by enclosing in a list if length is 1.
* Fixed bug where empty process output due to modification of process data caused error on right click on the process (changing from return(NULL) to return(list()) in getProcessOutputElements()).
* Fixed bug where modifying process data in DefineAcousticPSU() or DefineBioticPSU() could not be saved past the first click on the save icon.
* Fixed bug in Bootstrap() where character columns with all missing values were written as "N" and not "NA".
* Fixed bug in Bootstrap() where SpeciesCategory containing nordic characters were truncated.
* Fixed bug in getBootstrapData() where DateTime was not converted to POSIX.
* Fixed bug where help for a topic aliased by another topic did not work in getObjectHelpAsHtml() used by the GUI (e.g. var which is documented in cor).
* Fixed bug where the bootstrap attributes processNames and dataTypes were not written past the first value.
* Fixed bug where IndividualAge was not avaiable as TargetVariable in reports (due to class integer, which was not accounted for).
* Fixed bug in DefineBioticAssignment() when DefinitionMethod = "Stratum".
* Fixed bug in DefineBioticPSU when DefinitionMethod = "Manual".
* Fixed bug where 0 was interpreted as missing value in parameter tables.
* Moved functions to set precision to RstoxFramework, and fixed the following two bugs: 1. Datatypes which are lists of lists (AcousticData and BioticData) were not set precision to. 2. Integer fields were set precision to.
* Fixed bug in LengthDistribution() where missing raising factor was reported for samples with no individuals.
* Fixed bug in getNumberOfCores() where the number of cores was not restricted by the number of available cores.
* Fixing a problem with setting default precision in StoX. Before, precision was not set for process outputs which were lists of lists of tables (ReadBioic() and ReadAcousic()). Also, all numeric columns, even integer ones were set precision to, which is now changed to exclude integer columns.
* Fixed bug where runProject() did not open the project.
* Fixed so that RstoxFramework appears red if any of RstoxData, RstoxBase or RstoxFramework are not installed.
* Fixed bug causing the Preview to jump when scrolling.

## Detailed changes
* Corrected and simplified documentation of AssignmentLengthDistribution.
* Moved "addParameter" to be before "removeParameter" and "renameParameter" as backwaards compatibility actions, to facilitate adding a parameter with a value depending on existing values.
* Made comparison to ICES vocabularies more robust.
* Removing the temporary column "TempLengthGroupUsedInSuperIndividuals" from AddHaulDensityToSuperIndividuals(), and fixed the order of rows and columns to match the input SuperIndividualsData.
* Added support for AggregationFunction in ReportBootstrap() for backward compatibility of R scripts.
* Added support for nc files in readStoxOutputFile().
* Updated some test projects for the breaking change in RstoxBase where rows with 0 Abundance are deleted from the QuantityData before merging with the IndividualsData in SuperIndividuals(), which removes unwanted rows with present SpeciesCategory and IndividualTotalLength but missing Abundance when Biotic PSUs with rare IndividualTotalLength are not re-sampled in a bootstrap run.
* Removed "not mapped" console log messages that could slow down closing a project.
* Fixed the function unReDoProject(). This is now ready to be implemeted in the GUI.
* Reduced the number of rows shown in Preview to 10000 to speed up Preview of large data.
* Changed isOpenProject() to only require that the projectSession folder exits, with an option strict = TRUE to use the old requirement that all folders must exist.
* Added warning when replaceArgs contains non-existent arguments.
* Changed to using unlistDepth2 = FALSE in compareProjectToStoredOutputFiles(), as this is in line with the bug fix from StoX 3.6.0 where outputs with multiple tables were no longer unlisted in Bootstrap data.
* Improved error message then Percentages is not given (now saying exactly that and not "SpecificationParameter must be given").
* Improved documentation of DefinitionMethod in DefineBioticPSU(), DefineAcousticPSU() and DefineBioticAssignment().
* Added a warning when reading BioticPSUs from a StoX 2.7 project.xml file where Method is Station and not UseProcessData in DefineSweptAreaPSU(), which makes the BioticPSUs of the project.xml file unused.
* Improved warning when there are Individuals in the IndividualsData with IndividualTotalLength that does not match any of the length intervals of the QuantityData.
* Improved warning for when there are positive NASC values with no assignment length distribution, also removing the list of the affected PSUs.
* Improved simplifyStratumPolygon() used in DefineStratumPolygon() which got stuck in an endless loop in certain cases.


# StoX v3.6.3-9012 (2024-07-08)

## Summary
* The StoX version 3.6.3-9012 is the final pre-release before StoX 4.0.0 (jumping 3.6.3). 

## General changes
* Fixed so that RstoxFramework appears red if any of RstoxData, RstoxBase or RstoxFramework are not installed.

## Detailed changes
* Moved "addParameter" to be before "removeParameter" and "renameParameter" as backwaards compatibility actions, to facilitate adding a parameter with a value depending on existing values.
* Made comparison to ICES vocabularies more robust, and re-introduced the test for ICESExport.


# StoX v3.6.3-9011 (2024-07-03)

## Summary
* The StoX version 3.6.3-9011 is a pre-release preparing for StoX 4.0.0, including some bug fixes and improved warnings and documentation. 

## General changes
* Changed the color of a process which is not used by any other process in the same model from black to dark green in the case that a process used by that process is selected. This change is to avoid loosing information about which processes that use the selected process as input.
* Added warning when openProject() informing the used about the OutputVariables argument in Bootstrap().
* Corrected and simplified documentation of AssignmentLengthDistribution.

## Detailed changes
* Disabled ReportFunction "number", "fractionOfOccurrence" and "fractionOfSum".
* Temporarily disabled test for ICESExport due to problems at ICES. 

## Bug fixes
* Fixed the problem of truncated time steps when writing bootstrap data to NetCDF4 file, due to R's awkward bug with formatting POSIXct objects (the last decimal trucated).
* Fixed bug where existing bootstrap data was deleted even when UseOutputData = TRUE.
* Fixed bug which made some plotting functions failing seemingly randomly, by no longer setting precision in plot functions.


# StoX v3.6.3-9010 (2024-05-28)

## Summary
* The StoX version 3.6.3-9010 is a pre-release preparing for StoX 4.0.0, reverting the breaking change of 3.6.3-9009, and adding defaults "Survey" and "SpeciesCategory" in GroupingVariables of reports.


# StoX v3.6.3-9009 (2024-05-24)

## Summary
* The StoX version 3.6.3-9009 is a pre-release preparing for StoX 4.0.0. 

## General changes
* Breaking change: Rows with 0 Abundance are now deleted from the QuantityData before merging with the IndividualsData in SuperIndividuals(). This removes unwanted rows with present SpeciesCategory and IndividualTotalLength, but missing Abundance when Biotic PSUs with rare IndividualTotalLength are not re-sampled in a bootstrap run.
* Added message about how to read a bootstrap NetCDF4 file into R to replicate the old bootstrap RData file.
* Added truncation of output from ICESDatsusc() and similar functions in the Preview in the GUI.

## Detailed changes
* Added message about what the R connection was set to.
* Removing the temporary column "TempLengthGroupUsedInSuperIndividuals" from AddHaulDensityToSuperIndividuals(), aand fixed the order of rows and columns to match the input SuperIndividualsData.
* Added support for AggregationFunction in ReportBootstrap() for backward compatibility of R scripts.
* Added support for nc files in readStoxOutputFile().
* Updated the following test projects for the breaking change in RstoxBase where rows with 0 Abundance are deleted from the QuantityData before merging with the IndividualsData in SuperIndividuals(), which removes unwanted rows with present SpeciesCategory and IndividualTotalLength but missing Abundance when Biotic PSUs with rare IndividualTotalLength are not re-sampled in a bootstrap run.

## Bug fixes
* Fixed bug in the GUI where R 4.4.0 was not supported.
* Fixed bug in EstimateBioticRegression(), where failed estimate (e.g. due to singularity) resulted in two instead of 1 row in the output RegressionTable.
* Fixed bug where empty tables showed with duplicated header row in Preview in the GUI.


# StoX v3.6.3-9008 (2024-05-08)

## Summary
* The StoX version 3.6.3-9008 is a pre-release preparing for StoX 4.0.0 including some bug fixes and more consistent font size for function parameters.

## General changes
* Added the ICESBioic format 1.6 that includes the new GeneticPopulationCode field.

## Detailed changes
* Removed "not mapped" console log messages that could slow down closing a project.
* Fixed the function unReDoProject(). This is now ready to be implemeted in the GUI.
* Reduced the number of rows shown in Preview to 10000 to speed up Preview of large data.
* Fixed bug causing the Preview to jump when scrolling.

## Bug fixes
* Fixed bug in FilterLanding() by adding expandFilterExpressionList().
* Fixed bug in EstimateBioticRegression(), where failed estimate (e.g. due to sigularity) resulted in two insteda of 1 row in the output RegressionTable.
* Fixed bug when ReportVariableUnit is first inserted and then cleared, which resulted in error in the form "... is not a valid name for quantity ...".
* Fixed bug in getFilterTableNames() where the json array was unboxed in runFunction.JSON() (due to auto_unbox = TRUE) when only one name was returned. Fixed by enclosing in a list if length is 1.
* Fixed bug where empty process output due to modification of process data caused error on right click on the process (changing from return(NULL) to return(list()) in getProcessOutputElements()).
* Fixed bug where modifying process data in DefineAcousticPSU() or DefineBioticPSU() could not be saved past the first click on the save icon.
* Fixed bug in Bootstrap() where character columns with all missing values were written as "N" and not "NA".
* Fixed bug in Bootstrap() where SpeciesCategory containing nordic characters were truncated.
* Fixed bug in getBootstrapData() where DateTime was not converted to POSIX.


# StoX v3.6.3-9007 (2024-04-25)

## Summary
* The StoX version 3.6.3-9007 is a pre-release preparing for StoX 4.0.0. The changes involve new report functions (facilitating planned introduction of prey estimation from NMDBiotic data in StoX 4.1.0), fix of ana issue with validation of large projects which caused StoX to crash, reaming of parameters in ReportBootstrap(), and some other changes and bug fixes.

## General changes
* Added report functions number(), fractionOfOccurrence() and fractionOfSum().
* Moved warnings for only one PSU to Bootstrap in RstoxFramework. These warnings occurred inn Baseline but were actuaally warnings about the potetial issues in Bootstrap. One reason was that warnings were not shown from Bootstrap, but this issue is fixed, and warnings when there is only one element to resample from occur now in the actual resampling functions.
* Relaxed validation of the project.json to only consider the first 6 rows (using utils::head()) of each table or sf object. This was due to an observed crash of jsonvalidate::json_validator() for project.json of size larger than 1/2 GB.
* Renamed AggregationFunction to ReportFunction.
* Renamed AggregationWeightingVariable to WeightingVariable.

## Detailed changes
* Added documentation of ReportFunctions.

## Bug fixes
* Fixed bug where help for a topic aliased by another topic did not work in getObjectHelpAsHtml() used by the GUI (e.g. var which is documented in cor).
* Fixed bug where the bootstrap attributes processNames and dataTypes were not written past the first value.
* Fixed bug where IndividualAge was not avaiable as TargetVariable in reports (due to class integer, which was not accounted for).
* Fixed bug in DefineBioticAssignment() when DefinitionMethod = "Stratum".
* Fixed bug in DefineBioticPSU when DefinitionMethod = "Maual".


# StoX v3.6.3-9006 (2023-12-19)

## Summary
* The StoX version 3.6.3-9006 is a pre-release preparing for StoX 4.0.0. The pre-release includes a number of improvements to the user interface as well as some new StoX functions and bug fixes. The major release (4.0.0) is triggered by the following two non-backward compatible changes:

1. Bootstrapping of acoustic-trawl projects involves resampling of the hauls assigned to acoustic PSUs. In StoX <= 3.6.2 this resampling involved sampling (with replacement) all hauls assigned to at least one acoustic PSU in each stratum. If hauls are assigned differently to different acoustic PSUs there is a probability that none of the assigned hauls are sampled for a specific acoustic PSU in a specific bootstrap replicate. This can lead to under-estimation, as the corresponding NASC cannot be converted to density without a length distribution (the NASC results in missing density). In the new StoX this results in a warning and a proposal to use the new resampling function that samples only from the assigned hauls for each individual acoustic PSU (ResampleBioticAssignmentByPSU instead of ResampleBioticAssignmentByStratum in the BootstrapMethodTable). Making this change to a StoX project will change the results, and may also require new assignments to be defined in case there are acoustic PSUs with only one assigned haul, which will result in no contribution to the bootstrap variation from those PSUs.

2. A bug in ImputeSuperIndividuals() in StoX <= 3.6.2, occurring in acoustic-trawl projects when hauls are assigned to more than one stratum, could result in data not being fully imputed. The bug was that the Individual column was used to identify rows to impute from, but the values of this column are not unique when an individual is used in more than one stratum. A row with data to be imputed could thus me masked by another row with the same Individual. To solve this the new StoX version has introduced a new column of unique values named StratumLayerIndividual which is used in the imputation.

## List of other changes
* Bootstrap now use netCDF4 files which facilitates practically unlimited number of bootstrap replicates as well as selecting parameter values in ReportBootstrap() from drop-down lists. The change also speeds up ReportBootstrap(). 
* Added "Open project as template" on the Project menu, which creates a new project with the same processes as the selected template project, but where all input files and process data are deleted, and UseProcessData is set to FALSE for all process data processes.
* The filter expression builder is now faster and can be used also when the input process has not been run (in which case there are no options to select from).
* Added a stop button that stops a model between two processes or stops a Bootstrap function between two bootstrap replicates.
* Added support for selecting multiple files, e.g., in ReadBiotic.
* Increased resolution of the map.
* Added green bold for input and output processes to the selected process and black bold for processes not used in any other processes in the model. This can be used to identify errors particularly in the Baseline model.
* Added support for reading a project.json in DefineSurvey(), DefineAcousticPSU(), DefineBioticPSU(), DefineBioticAssignment() and DefineStratumPolygon.
* Added printing of messages, warnings and errors for parallel bootstrapping.
* Added the number of identical warnings in the warning printout. This is useful e.g. to get an idea of how many bootstrap replicates that has a problem of missing assignment length distribution for AcousticPSUs.
* Added functions ICESDatsusc(), CopyICESDatsusc, FilterICESDatsusc, TranslateICESDatsusc and WriteICESDatsusc().
* Typing and selcting in drop-down lists now works as expected
* Added manual tagging of Stations to BioticPSU. This can be used to group stations together or create PSUs for stations that accidently fall outside of a stratum.
* Added note in the User log if there is a new official StoX release, with instructions on how to install in the Help menu.
* Added note in the User log and a link in the Help menu when there is a new official release.
* Added zoom in and out buttons in the map.
* Changed a number of parameter to class "single" (DensityType, TargetVariableUnit, etc).
* Allowed selecting from possible values in the filter expression builder for numeric values which are mostly whole numbers. Also excluded possible values for keys.

## Detailed changes
* Restricted warning for missing or 0 EffectiveTowDistance to only activate when there are there are more than 0 individuals in the Haul. 
* Speeding up openProject() for StoX projects with large process data tables.
* Moved printing of "Running baseline process" type of messages from backend to frontend, so that this gets printed before the process runs and not after.
* Changed GearDependentCatchCompensation() to keep all variables from the input SpeciesCategoryCatchData.
* Exposing PlotAcousticTrawlSurvey().
* Removed dependency on the retiring R package sp.

## Bug fixes
* Fixed bug in DefineSurvey with DefinitionMethod = "ResourceFile", where the FileName was the path to a project.xml file.
* Fixed bug where 0 was interpreted as missing value in parameter tables.
* Updated dependencies. This fixed a bug causing drop-down lists to jump when selecting a value.
* Moved functions to set precision to RstoxFramework, and fixed the following two bugs: 1. Datatypes which are lists of lists (AcousticData and BioticData) were not set precision to. 2. Integer fields were set precision to.
* Fixed bug in LengthDistribution() where missing raising factor was reported for samples with no individuals.
* Fixed bug in getNumberOfCores() where the number of cores was not restricted by the number of available cores.


# StoX v3.6.3-9005 (2023-12-18)

## Summary
* The StoX version 3.6.3-9004 is another a pre-release preparing for StoX 4.0.0. The pre-release includes the following improvements to the StoX GUI:
	* Added green bold for input and output processes to the selected process and black bold for processes not used in any other processes in the model.
	* Added note in the User log if there is a new official StoX release, with instructions on how to install in the Help menu.


# StoX v3.6.3-9004 (2023-12-04)

## Summary
* Test release to test changes to the build script.


# StoX v3.6.3-9003 (2023-12-03)

## Summary
* The StoX version 3.6.3-9003 is a pre-release preparing for StoX 4.0.0. The pre-release includes a the following improvements to the StoX GUI:
	* Added note in the User log and a link in the Help menu when there is a new official release.
	* Added zoom in and out buttons in the map.
	* Changed a number of parameter to class "single" (DensityType, TargetVariableUnit, etc).

## General changes
* Added functions ICESDatsusc(), CopyICESDatsusc, FilterICESDatsusc, TranslateICESDatsusc and WriteICESDatsusc().
* Fixed bug in ImputeSuperIndividuals() when ImputationMethod = "RandomSampling", where individuals used in multiple strata were not uniquely represented by the Individual column. The consequence was that data were imputed from the first of the rows with identical Individual, resulting in possible loss of imputation, e.g., if imputing IndividualAge and only one of the identical individuals had IndividualAge but not the first of them, in which case that age would never be imputed. This was fixed by introducing a new unique ID StratumLayerIndividual, which is a concatenation of Stratum, Layer and Individual, and using this to idenify row o impue from.
* Changed sorting of StratumLayerIndividual when creating the StratumLayerIndividualIndex to platform independent locale = "en_US_POSIX". This is actually a bug, but has not been discovered since all known StoX projects have been using input data with Cruise as numbers of only upper case letters (sorting by locale = "en_US_POSIX" arranges capital letters first (India before england)).


# StoX v3.6.3-9002 (2023-11-27)

## Summary
* The StoX version 3.6.3-9002 is a pre-release preparing for StoX 4.0.0. The pre-release includes a the following improvements to the StoX GUI:
	* Added manual tagging of Stations to BioticPSU. This can be used to group stations together or create PSUs for stations that accidently fall outside of a stratum.
	* Added "Open project as template" on the Project menu, which creates a new project with the same processes as the selected template project, but where all input files and process data are deleted, and UseProcessData is set to FALSE for all process data processes.
	* Increased resolution of the map.
	* Added a stop button that stops a model between two processes or stops a Bootstrap function between two bootstrap replicates.
	* The filter expression builder is now faster and can be used also when the input process has not been run (in which case there are no options to select from).
	* Allowed selecting from possible values in the filter expression builder for numeric values which are mostly whole numbers. Also excluded possible values for keys.
	* Added support for selecting multiple files, e.g. in ReadBiotic.

## Bug fixes
* Fixed bug where 0 was interpreted as missing value in parameter tables.
* Updated dependencies. This fixed a bug causing drop-down lists to jump when selecting a value.

## General changes
* Added support for reading a project.json in DefineSurvey(), DefineAcousticPSU(), DefineBioticPSU(), DefineBioticAssignment() and DefineStratumPolygon.
* Restricted warning for missing or 0 EffectiveTowDistance to only activate when there are there are more than 0 individuals in the Haul. 
* Fixed bug in DefineSurvey with DefinitionMethod = "ResourceFile", where the FileName was the path to a project.xml file.


# StoX v3.6.3-9001 (2023-10-15)

## Summary
* The StoX version 3.6.3-9001 is a pre-release preparing for StoX 4.0.0. The pre-release introduces bootstrapping using netCDF4 files which facilitates practically unlimited number of bootstrap replicates. Also, a new resampling function for BioticAssignment is introduced, where Hauls are resampled for each individual AcousicPSU, eliminating the risk of missing assignment length distribution in SplitNASC and AcousticDensity which could result in under-estimation. In addition, dependency on the R package sp has been completely removed from RstoxData, RstoxBase and RstoxFramework.

## Bug fixes
* Moved functions to set precision to RstoxFramework, and fixed the following two bugs: 1. Datatypes which are lists of lists (AcousticData and BioticData) were not set precision to. 2. Integer fields were set precision to.
* Fixing a problem with setting default precision in StoX. Before, precision was not set for process outputs which were lists of lists of tables (ReadBioic() and ReadAcousic()). Also, all numeric columns, even integer ones were set precision to, which is now changed to exclude integer columns.
* Fixed bug where runProject() did not open the project.
* Fixed bug in LengthDistribution() where missing raising factor was reported for samples with no individuals.
* Fixed bug in getNumberOfCores() where the number of cores was not restricted by the number of available cores.

## General changes
* Removed dependency on the retiring R package sp.
* Added BootstrapNetCDF4() and ReportBootstrapNetCDF4(). These will replace Bootstrap() and ReportBootstrap() in StoX 4.0.0.
* Added ResampleBioticAssignmentByPSU() and ResampleBioticAssignmentByStratum(), where the latter is identical to the ResampleBioticAssignment() of StoX <= 3.6.2.
* Speeding up openProject() for StoX projects with large process data tables.
* Added printing of messages, warnings and errors for parallel bootstrapping (by applying runFunction() in each core).
* Added the number of identical warnings in the warning printout. This is needed e.g. to get an idea of how many bootstrap replicates that has a problem of missing assignment length distribution for AcousticPSUs.
* Moved printing of "Running baseline process" type of messages from backend to frontend, so that this gets printed before the process runs and not after.
* Changed GearDependentCatchCompensation() to keep all variables from the input SpeciesCategoryCatchData.
* Exposing PlotAcousticTrawlSurvey().

## Detailed changes
* Changed isOpenProject() to only require that the projectSession folder exits, with an option strict = TRUE to use the old requirement that all folders must exist.
* Added warning when replaceArgs contains non-existent arguments.
* Changed to using unlistDepth2 = FALSE in compareProjectToStoredOutputFiles(), as this is in line with the bug fix from StoX 3.6.0 where outputs with multiple tables were no longer unlisted in Bootstrap data.
* Improved error message then Percentages is not given (now saying exactly that and not "SpecificationParameter must be given").
* Improved documentation of DefinitionMethod in DefineBioticPSU(), DefineAcousticPSU() and DefineBioticAssignment().
* Added a warning when reading BioticPSUs from a StoX 2.7 project.xml file where Method is Station and not UseProcessData in DefineSweptAreaPSU(), which makes the BioticPSUs of the project.xml file unused.
* Improved warning when there are Individuals in the IndividualsData with IndividualTotalLength that does not match any of the length intervals of the QuantityData.
* Improved warning for when there are positive NASC values with no assignment length distribution, also removing the list of the affected PSUs.
* Improved simplifyStratumPolygon() used in DefineStratumPolygon() which got stuck in an endless loop in certain cases.


# StoX v3.6.2 (2023-06-28)

## Summary
* The StoX version 3.6.2 is a patch-release containing an important bug fix for Bootstap(), where the output was text files instead of a single RData in StoX 3.6.1, causing the UseOutputData option to not work. 

## Bug fixes
* Fixed a bug introduced in StoX 3.6.1, where the output file of Bootstrap() was a number of text file instead of a single RData file, causing the option UseOutputData to fail.
* Fixed a bug in ReportBootstrap() where TargetVariableUnit did not work. Also the base unit for the variable Biomass of the QuantityData was corrected from g to kg, as this data originates from SweptAreaDensity() with SweptAreaDensityMethod = "TotalCatch".
* Removed SpeciesCategoryKey from ReportSpeciesCategoryCatch(), as the output is per haul.
* Fixed bug when translating with PreserveClass = FALSE, in which case the class change could corrupt the condition of the translation (e.g., translating a copy of the DateTime in the Log table of the StoxAcousticData would convert that to string after the first line of the TranslationTable, and then any time condition will fail, as the class is no longer POSIX).

## Other changes
* Added the right-click option "Duplicate process".
* Increased speed of frequently used functions in RstoxFramework by using list instead of data.table for the definition og reportFunctions.
* Added tables listing the variables of the data types NASCData, SumNASCData, MeanNASCData, LengthDistributionData, SumLengthDistributionData, MeanLengthDistributionData, DensityData, MeanDensityData and QuantityData. 
* Added better warning when at least one of bottomdepthstart and bottomdepthstop are missing.
* Improved warning when variables that cannot be converted to numeric as requested by the XSD are set to NA in ReadAcoustic()/ReadBiotic().

## Detailed changes
* Updated the test projects coastalCod_20 and cod_19 to have RData as Bootstrap output, since StoX 3.6.1 introduced the error that this file was txt.
* Added check for output file names in the testing.
* Relaxed testUnits.R to accept that Biomass has different units in QuantityData and SuperIndividualsData.


# StoX v3.6.2-9001 (2023-06-26)

## Summary
* The StoX version 3.6.0-9001 is a pre-release before StoX 3.6.2, scheduled end of June 2023. 

## Bug fixes
* Fixed a bug introduced in StoX 3.6.1, where the output file of Bootstrap() was a number of text file instead of a single RData file, causing the option UseOutputData to fail.
* Fixed a ReportBootstrap() where TargetVariableUnit did not work. Also the base unit for the variable Biomass of the QuantityData was corrected from g to kg, as this data originates from SweptAreaDensity() with SweptAreaDensityMethod = "TotalCatch".
* Removed SpeciesCategoryKey from ReportSpeciesCategoryCatch(), as the output is per haul.
* Fixed bug when translating with PreserveClass = FALSE, in which case the class change could corrupt the condition of the translation (e.g., translating a copy of the DateTime in the Log table of the StoxAcousticData would convert that to string after the first line of the TranslationTable, and then any time condition will fail, as the class is no longer POSIX).

## Other changes
* Added the right-click option "Duplicate process".
* Increased speed of frequently used functions in RstoxFramework by using list instead of data.table for the definition og reportFunctions.
* Added tables listing the variables of the data types NASCData, SumNASCData, MeanNASCData, LengthDistributionData, SumLengthDistributionData, MeanLengthDistributionData, DensityData, MeanDensityData and QuantityData. 
* Added better warning when at least one of bottomdepthstart and bottomdepthstop are missing.
* Improved warning when variables that cannot be converted to numeric as requested by the XSD are set to NA in ReadAcoustic()/ReadBiotic().

## Detailed changes
* Updated the test projects coastalCod_20 and cod_19 to have RData as Bootstrap output, since StoX 3.6.1 introduced the error that this file was txt.
* Added check for output file names in the testing.
* Relaxed testUnits.R to accept that Biomass has different units in QuantityData and SuperIndividualsData.


# StoX v3.6.1 (2023-04-21)

## Summary
* The StoX version 3.6.1 is a patch-release containing a number of bug fixes. Particularly, StoX <= 3.6.0 cannot be used with R 4.3. StoX 3.6.1 can.

## Bug fixes
* Fixed bug when on R 4.3 where StoX could not be opened on MacOS and R connection failed on Windows.
* Fixed slow RstoxFramework::ReportBootstrap() in StoX 3.6.0 by removing repeated unnecessary call to getReportFunctions(getMultiple = TRUE) to get the column names of the output in aggregateBaselineDataOneTable().
* Fixed bug in SuperIndividuals() where the test for equal total Abundance from the QuantityData and in the SuperIndividualsData failed when both were 0. This could be a problem if there were no NASC or no catch of the target species in a stratum for acoustic-trawl or swept-area models, respectively.
* Fixed bug in SuperIndividuals() where bootstrapping could result in artificial rows with missing Abundance for certain length groups only present in biotic PSUs that are not resampled in a bootstrap replicate. This was only a problem when DistributionMethod = "HaulDensity". The result was that when not using IndividualTotalLength in the GroupingVariables in ReportBootstrap(), many rows contained NAs. In the new version the NAs can be isolated by including "Survey" and "SpeciesCategory" in the GroupingVariables.
* Fixed bug in EstimateRegression when insufficient data to estimate the regression. Now returning NA for all parameters.
* Fixed bug where only the variables from the Individual table of StoxBioticData were available as GroupingVariables in EstimateBioticRegression() in the GUI.
* Fixed bug in translateOneTranslationOneTable() used by Translate-functions, where type conversion was applied before applying the translation, which for a function such as IndividualAge > 9 resulted in 10, 11, ... to be compared as text and thus not translated.
* Fixed bug in StoX 3.6.0 where simply selecting a process in a model would reset the later models.
* Fixed bug in runProjects(), where processes returning StratumPolygon and BioticData and AcousticData could not be included in the processes argument.
* Fixed bug in modifyProcessNameInFunctionInputs() where function input were modified only in the same model, and failed when at least one function input was empty.
* Fixed bug in SuperIndividuals() for when all lengths of the QuantityData are NA.
* Fixed bug in RegroupLengthICESDatras(), where the columns were reordered with ResolutionTableVariables first.
* Fixed bug in ICESDatras() where distance was first rounded in nautical miles and then multiplied by 1852.
* Fixed bug where slash and backslash were mixed in file name in json schema validation error message. Now using only slash. Also changed this to a warning instead of an error, so that StoX tries to open the project anyhow.

## Other changes
* Temporarily disabled installing the Rstox packages from binaries on macOS, due to the change in R 4.3 to separate between Intel Macs and Apple silicon (M1/M2) Macs. This will slow down "Install Rstox packages" from the menu in StoX on macOS by a minute or two. Installation from binaries is expected to return to macOS in one of the forthcoming releases.
* Stopped using the Versions.R file in the StoX GUI, but rather separated out the functions used by the GUI to an exclusive GUI file. Simplified functions for getting versions used in the project.json file.
* Improved how StoX changes the active process so that setting a parameter without actually changing it value does not reset the process.
* Changed the requirements of the the BaselineSeedTable of the function Bootstrap to only need the ImputeSuperIndividuals processes which use ImputationMethod = "RandomSampling".
* Added support for more than one row in the Regression input to ImputeSuperIndividuals.
* Updated documentation of StoxAcoustic and StoxBiotic with tables defining each variable.
* Removed variable names related to the NMCBiotic tables "prey", "preylengthfrequencytable" and "copepodedevstagefrequencytable".
* Added LogDistance to tooltip for EDSUs in the map.

## Detailed changes
* Added support for specifying startProcess and endProcess in runProject() and runProjects() as a list named by the processes, such as endProcess = list(report = 2) to only run the first two processes of the report model.
* Changed to check function input errors only for enabled processes.
* Improved warning for function input not enabled (added the name of the process).
* Improved error message when there are missing LogOrigin or LogOrigin2.
* Changed the error "The BaselineSeedTable must contain Seed for the processes..." to ignore ImputeSuperIndividuals proecsses with Regression method (no seed required).
* Reduced memory for large BootstrapData in ReportBootstrap() by sending only the relevant columns to the report function.
* Added test for non-empty AcousticPSU in BioticAssignment().
* Added support for starting out with no PSUs in DefineAcousticPSU.
* Now reporting a warning if the user tries to set unit to a variable that has no units defined in ReportSuperIndividuals().
* Improved warning when EstimateBioticRegression() returns NA.
* Corrected the documentation of RegroupLengthDistribution().
* Changed RegroupLengthICESDatras() to regroup lengths both in the HL and the CA table, and also to support recalculating both HLNoAtLngt and CANoAtLngt. Also added the parameters ResolutionTableVariables and ResolutionTable to support species specific (or other variables) regrouping.
* Added a warning if there are more than one tag for at least one individual in AddToStoxBiotic() for NMDBiotic >= 3 files.
* Corrected warning " There are more than one 'serialnumber' ..." to end with "More than one serialnumber for the following cruise/station (of the fishstation table of the BioticData):" instead of "Duplicated serialnumber for the following cruise/station (of the fishstation table of the BioticData):".
* Corrected warning for more NASC in B than in P.
* Corrected warning for non-supported NMDEhcosounder format from >= 1.4 to >= 1.1.

# StoX v3.7.0-9001 (2023-02-27)

## Summary
* The StoX version 3.7.0-9001 is a pre-release before StoX 3.7.0, scheduled in April 2023. 

## General changes
* Removed the StoX XML from https://acoustic.ices.dk/submissions.
* Reduced memory for large BootstrapData in ReportBootstrap() by sending only the relevant columns to the report function.
* Added support for more than one row in the Regression input to ImputeSuperIndividuals.

## Detailed changes
* Changed the requirements of the the BaselineSeedTable of the function Bootstrap to only need the ImputeSuperIndividuals processes which use ImputationMethod = "RandomSampling".
* Changed RegroupLengthICESDatras() to regroup lengths both in the HL and the CA table, and also to support recalculating both HLNoAtLngt and CANoAtLngt. Also added the parameters ResolutionTableVariables and ResolutionTable to support species specific (or other variables) regrouping.
* Changed HaulNo to use the serialnumber and not the station variable of NMDBiotic >= 3 in ICESDatras().
* Improved error message when there are missing LogOrigin or LogOrigin2.
* Changed the error "The BaselineSeedTable must contain Seed for the processes..." to ignore ImputeSuperIndividuals proecsses with Regression method (no seed required).
* Corrected warning " There are more than one 'serialnumber' ..." to end with "More than one serialnumber for the following cruise/station (of the fishstation table of the BioticData):" instead of "Duplicated serialnumber for the following cruise/station (of the fishstation table of the BioticData):".
* Corrected warning for more NASC in B than in P.
* Corrected warning for non-supported NMDEhcosounder format from >= 1.4 to >= 1.1.
* Corrected the documentation of RegroupLengthDistribution().

## Bug fixes
* Fixed bug in translateOneTranslationOneTable() used by Translate-functions, where type conversion was applied before applying the translation, which for a function such as IndividualAge > 9 resulted in 10, 11, ... to be compared as text and thus not translated.


# StoX v3.6.0 (2023-01-18)

## Summary
StoX 3.6.0 contains several improvements to the graphical user interface (GUI), as well as important new additions such as the function PlotReportBootstrap, functions to copy the values of a column to a new or existing column, better warnings and errors, and fewer rows with mostly missing values in ReportBootstrap (rows generated as an unwanted consequence of the way the function was coded).

## Note on versioning of StoX
StoX has now changed to fully apply semantic versioning (https://semver.org/), meaning that the following version convention is used: Major.Minor.Patch-Prerelease, where the pre-release number starts at 9001. Consequently, all releases that are not pre-releases (three digit version numbers such as 3.5.2 and 3.6.0) are considered as official. Pre-releases are ONLY to be used for testing by the StoX team, and should NOT be used for any official estimates. Critical bugs will be fixed in patches (e.g. StoX 3.6.1, in case a critical bug is discovered in StoX 3.6.0).

# Changes in the GUI
* The right click option "View output" on the process name has been renamed to "Preview", and correspondingly, the Output window has been renamed to "Preview".
* The Preview window now contains the options "Close others" and "Close all" in addition to "Close" on the tab name.
* The right click option "Show in folder" has been added on the process name, opening the folder holding the output files of the process in the file explorer (Finder on Mac). This feature is also added to the project name in the Projects window.
* When a stratum is selected in the Stratum/PSU window it is now marked with darker grey color in the map. This currently only applies to AcousticPSU processes.
* The Distance table has been completed, and can now be used to select EDSUs for an AcousticPSU processes.
* The User log no longer resets when opening a different project. Instead the right click option "Clear log" has been added.
* A stratum can now be deleted in the GUI by right click on the stratum name in the Stratum/PSU window when a process using DefineStratumPolygon as function is the active process.
* Added scroll bar in the process parameter window.
* Changed colors to red for processing error and orange for function input error. 
* The GUI now disables process parameter view, open/new project, and R connection and Install Rstox packages, when running a process.
* The full path to the project is now shown as tooltip on the project name in the Projects window.
* Origin for the map projection can now be set by right click in the map. 
* Added an info box when the previously opened project opens when opening StoX. 
* When clicking "Yes" in Install Rstox packages the "Yes" button is now disabled, blocking a second installation.
* Light blue background has been added to all active window and tab names, as well as the active process.
* The GUI now shows RstoxFramework without version in the upper right corner, with red if any of the packages RstoxFramework, RstoxBase or RstoxData is not the certified version of the StoX release. 
* Processes with enabled = FALSE is now marked with grey process symbol.
* Added progress spinner on R connection and Preview.
* Expand buttons in the process parameter window have changed logic to the natural logic (arrow down means open the list, arrow right means close the list).
* Add PSU now activates only on AcousticPSU processes.
* The GUI now stops immediately before a process with function input error, but jumps over processes which are not enabled.
* Added highlighting of a stratum in the map when selected in the Stratum/PSU window when the active process uses one of the functions DefineStratumPolygon, DefineAcousticPSU or DefineBioticAssignment.
* Removed tooltip in drop-down lists, as this obscured the selection of the elements in the list.
* Added a line "... truncated" if a table in Preview does not contain all rows (the GUI shows at most 200000 rows).

## General changes
* Added CopyBiotic, CopyStoxBiotic, CopyICESBiotic, CopyICESDatras, CopyAcoustic, CopyStoxAcoustic, CopyICESAcoustic, CopyLanding and CopyStoxLanding, used for copying one column to another (possibly existing) column.
* Added the new function PlotReportBootstrap().
* Removed rows of the output from ReportBootstrap() that contained combinations of the GroupingVariables that are not present in the BootstrapData. There rows were created to ensure that all bootstrap runs contain all combinations of the GroupingVariables, but also introduced non-existing combinations.
* Only Rstox packages for official StoX versions can now be installed from the GUI using Install Rstox packages. If trying to use Install Rstox packages in a pre-release, an error is printed with hints on how to install the Rstox packages manually in R.
* StoX now deletes output files when a parameter of the process is changed.
* Removed all non-official Rstox-package versions from the StoX repository (https://github.com/StoXProject/repo). This implies that non-official StoX versions can no longer use Install Rstox packages. The user must instead install the appropriate Rstox packages in R.
* Added the parameter Percentages with default c(5, 50, 95) in ReportBootstrap() when BootstrapReportFunction = "summaryStox" (currently the only option).
* Added the parameter TargetVariableUnit in ReportSuperIndividuals(), ReportQuantity() and ReportBootstrap(), DensityUnit in ReportDensity(), and ReportVariableUnit in ReportSpeciesCategoryCatch(), which all can be used to set the units for the report.
* Removed warning when a PSU to be added assignment to is not present in the BioticAssignment (this should be no problem, as PSUs are added with).
* Fixed bug introduced in 3.5.1 where scrolling was not possible in the Stratum/PSU window.
* Changes to ICESDatras in RstoxData:
	* Added the function PrepareWriteICESDatras().
	* Fixed typo in ICESDatras() (BycSpecRecCode changed to BySpecRecCode).
	* Added specialstage in Maturity in CA.
	* Added the LiverWeight in CA, with values from the liverweight in NMDBiotic.


## Changes affecting backward compatibility
* Changed behavior of DefinitionMethod "WaterColumn" so that even data with missing depth information will have Layer = "WaterColumn". Before, if MinHaulDepth, MaxHaulDepth, MinChannelDepth or MaxHChannelDepth was missing, Layer would also be missing. This change will result in more individuals in IndividualsData, as the line hauls tagged to PSUs with NA Layer are removed when QuantityType == "SweptArea" in Individuals(). Also, changed the MinLayerDepth and MaxLayerDepth from the range of the depths (set to 0 and Inf if min depth and max depth was missing) to (0, NA), saying that "WaterColumn" means from surface to an unknown bottom, or at least not defined by a single value.

## Bug fixes
* Fixed bug when running a project with projectPath ending with exactly one slash ("/") (problem fixed in getRelativePath()).
* Fixed bug in DefineSurvey() when reading from a table text file, which was attempted read as a project.xml file.
* Fixed bug in StoxBiotic() from NMDBiotic <= 1.4 files, where platform from the mission table was used as CatchPlatform. Changed to using the platform from the fishstation.
* Fixed bug in Translate functions where PreserveClass = TRUE had no effect.
* Fixed error in the documentation of GroupingVariables.
* A problem with large ECA projects where Reca prints large amounts of text to stdout and stderr, where the GUI froze, has been fixed.
* Fixed a bug where the GUI got stuck in the Add stratum symbol if one ran the StratumPolygon process before changing symbol back to the navigator symbol. 
* Fixed possible bug when using a Regression process data where GroupingVariables were set. The indices of the rows of the SuperIndividualsData to be imputed were previously identified before merging in the RegressionTable of the Regression process data. This could possibly change the order so that indices were incorrect when the actual imputation by regression was made. In the new version the indices are identified as the last step before the imputation.
* Fixed bug where EDSUs for StoX projects with data from ICESAcoustic data with and without end position given by Longitude2 resulted in EDSUs not being shown.
* Fixed bug where "Linear" was used instead of "SimpleLinear" as EstimationMethod in EstimateBioticRegression().
* Also fixed bug where the EstimationMethod "SimpleLinear" did not work as expected. 
* Fixed possible values for AcousticCategory in SpeciesLink in SplitNASC(), from the available AcousticCategory in the NASCData to the SplitAcousticCategory in the AcousticCategoryLink. Also reordered the parameters so that AcousticCategoryLink comes before SpeciesLink.
* Fixed bug with R < 4.2, where a filter process with unspecified FilterExpression returns error "zero-length inputs cannot be mixed with those of non-zero length". The error is returned both when opening the FilterExpression and when running the process.
* Changed to not remove rows with missing Haul in DefineBioticAssignment(). This was introduced by a misunderstanding in StoX 3.5.0, in the case when DefinitionMethod == "Stratum". The warning when all Hauls are missing is kept.
* Fixed bug in the GUI, where running a process in one model did not reset all later models.
* Fixed bug in output file of Bootstrap() when OutputProcesses contained processes with more than one table (e.g. the Data and Resolution table of Quantity()) mixed with single table outputs (e.g. ImputeSuperIndividuals()). The list of output data was flattened to include e.g. Quantity_Data and Quantity_Resolution. However, for BootstrapData, the output is saved to an RData file, and no such flattening of the list is necessary, and also corrupts the data when read back in when using the UseOutputData option in Bootstrap(). This may break scripts using the output file of a Bootstrap process with datta from multi table processes. This is however rare, and the function RstoxFramework::unlistToDataType() can be used to re-create the previous list in the output file of Bootstrap processes.

## Warning and error messages
* Improved warning when using RemoveMissingValues. This warning now informs the user that GruopingVariables can be useful to isolate missing values out from the relevant rows of the report.
* Improved error message when readProjectDescriptionJSON() fails to read project.json.
* Added error if variables specified in Regression in ImputeSuperIndividuals() are not present in the data (previously this was only a warning).
* Added error if a LayerTable specified by the user contains missing values.
* Added a warning if the variables selected using GroupingVariables and RegressionModel have changed in DefineRegression(), making the RegressionTable not work properly in the current version of the GUI.
* Removed error when there are Individuals with IndividualTotalLength smaller than the smallest IndividualTotalLength in the QuantityData in SuperIndividuals(). This was changed to warnings when IndividualTotalLength does not fit into any of the length intervals of the QuantityData.
* Added warning when there are AcousticCategory present in the NASCData but not in the SpeciesLink in AcousticDensity.
* Added warning when ch_type P is missing or represent less sa than B.
* Improved warnings in StoxBiotic() when missing values are generated for different producttype etc.
* Added warning for duplicated station in NMDBiotic, which leads to more than one Haul per Station. This is not supported when assigning Hauls in the map, where all Hauls of a Station are selected. Filtering out Hauls can be a solution.
* Removed warning when a preview is open in the GUI and the process is changed (setting warn to FALSE in getProcessTableOutput(), getProcessGeoJsonOutput() and getProcessPlotOutput()).

## Detailed changes
* Added variable selection dialogue for GroupingVariables in DefineRegression() (typing, as there is no list of possible values).
* Disallowed empty string stratum name from the GUI.
* Cleaned up JSON validation test files to enhance the expected error.
* Added drop-down lists for the parameters VariableName and ConditionalVariableNames, and for valueColumn, newValueColumn and conditionalValueColumns in the case that the table is read from a file.
* Improved warning when acoustic PSUs are not present in the BioticAssignment processData or have no assigned biotic Hauls.
* Improved documentation of seed in Bootstrap().
* Improved the documentation EstimateBioticRegression().
* Updated documentation of DefineTranslation and the Translate functions.

# StoX v3.6.0-9003 (2023-01-11)

## General changes
* Added the parameter Percentages with default c(5, 50, 95) in ReportBootstrap() when BootstrapReportFunction = "summaryStox" (currently the only option).
* Fixed bug in the GUI, where running a process in one model did not reset all later models.
* Fixed bug in output file of Bootstrap() when OutputProcesses contained processes with more than one table (e.g. the Data and Resolution table of Quantity()) mixed with single table outputs (e.g. ImputeSuperIndividuals()). The list of output data was flattened to include e.g. Quantity_Data and Quantity_Resolution. However, for BootstrapData, the output is saved to an RData file, and no such flattening of the list is necessary, and also corrupts the data when read back in when using the UseOutputData option in Bootstrap(). This may break scripts using the output file of a Bootstrap process with datta from multi table processes. This is however rare, and the function RstoxFramework::unlistToDataType() can be used to re-create the previous list in the output file of Bootstrap processes.
* Changed defaultPlotGeneralOptions AxisTitleSize (10 to 12) and LegendTitleSize (10 to 12).
* Changed defaultPlotFileOptions Height (17 to 10).
* Reversed the order of installation of Rstox packages for pre-releases, to ensure that the lower packages get the correct version (ultimately RstoxData).


# StoX v3.6.0-9002 (2022-12-26)

## Summary
* This pre-release fixes wrong colors of the StoX and RstoxFramework logo, and updates PlotReportBootstrap(), which was not working prooperly in StoX 3.6.0-9001. Also support is added for displaying RstoxFDA in the drop-down list on the StoX/RstoxFramework logo. Also fixed the colors in the logo and drop-down, which were mixed up in StoX 3.6.0-9001.


# StoX v3.6.0-9001 (2022-12-14)

## Summary
* The StoX version 3.6.0-9001 is a pre-release before the forthcoming StoX 3.6.0. As of this pre-release the release schedule is changed to fully comply with semantic versioning (https://semver.org/), meaning that the following version convention is used: Major.Minor.Patch-Prerelease, where the pre-release number starts at 9001. 

## General changes
* Added CopyBiotic, CopyStoxBiotic, CopyICESBiotic, CopyICESDatras, CopyAcoustic, CopyStoxAcoustic, CopyICESAcoustic, CopyLanding and CopyStoxLanding, used for copying one column to another (possibly existing) column.
* Added the new function PlotReportBootstrap().
* Removed rows of the output from ReportBootstrap() that contained combinations of the GroupingVariables that are not present in the BootstrapData. There rows were created to ensure that all bootstrap runs contain all combinations of the GroupingVariables, but also introduced non-existing combinations.
* Only Rstox packages for official StoX versions can now be installed from the GUI using Install Rstox packages. If trying to use Install Rstox packages in a pre-release, an error is printed with hints on how to install the Rstox packages manually in R.

# Changes in the GUI from StoX 3.5.2
* Added highlighting of a stratum in the map when selected in the Stratum/PSU window when the active process uses one of the functions DefineStratumPolygon, DefineAcousticPSU or DefineBioticAssignment. 
* Fixed a bug where the save symbol was active when opening a project with no backward compatibility changes.
* Removed tooltip in drop-down lists, as this obscured the selection of the elements in the list.
* Fixed a bug that crashed the GUI when a plot was open in Preview and the plotting process was repeatedly rerun with different settings.

## Detailed changes
* Added drop-down lists for the parameters VariableName and ConditionalVariableNames, and for valueColumn, newValueColumn and conditionalValueColumns in the case that the table is read from a file.
* Improved warning when acoustic PSUs are not present in the BioticAssignment processData or have no assigned biotic Hauls.
* Improved documentation of seed in Bootstrap().
* Improved the documentation EstimateBioticRegression().
* Improved warning when using RemoveMissingValues. This warning now informs the user that GruopingVariables can be useful to isolate missing values out from the relevant rows of the report.
* Updated documentation of DefineTranslation and the Translate functions.

## Bug fixes
* Fixed bug when running a project with projectPath ending with exactly one slash ("/") (problem fixed in getRelativePath()).
* Fixed bug in DefineSurvey() when reading from a table text file, which was attempted read as a project.xml file.
* Fixed bug in StoxBiotic() from NMDBiotic <= 1.4 files, where platform from the mission table was used as CatchPlatform. Changed to using the platform from the fishstation.
* Fixed bug in Translate functions where PreserveClass = TRUE had no effect.
* Fixed error in the documentation of GroupingVariables.


# StoX v3.5.2 (2022-11-12)

## Summary
* A stratum can now be deleted in the GUI by right click on the stratum name in the Stratum/PSU window when a proecss usinng DefineStratumPolygon as function is the active proecss.
* Added the parameter TargetVariableUnit in ReportSuperIndividuals(), ReportQuantity() and ReportBootstrap(), DensityUnit in ReportDensity(), and ReportVariableUnit in ReportSpeciesCategoryCatch(), which all can be used to set the units for the report.
* Removed warning when a PSU to be added assignment to is not present in the BioticAssignment (this should be no problem, as PSUs are added with).
* Fixed bug introduced in 3.5.1 where scrolling was not possible in the Stratum/PSU window.
* Changes to ICESDatras in RstoxData:
	* Added the function PrepareWriteICESDatras().
	* Fixed typo in ICESDatras() (BycSpecRecCode changed to BySpecRecCode).
	* Added specialstage in Maturity in CA.
	* Added the LiverWeight in CA, with values from the liverweight in NMDBiotic.

# StoX v3.5.1 (2022-11-16)

## Summary
* StoX 3.5.1 contains several improvements to the graphical user interface (GUI):
	* The right click option "View output" on the process name has been renamed to "Preview", and correspondingly, the Output window has been renamed to "Preview".
	* The Preview window now contains the options "Close others" and "Close all" in addition to "Close" on the tab name.
	* The right click option "Show in folder" has been added on the process name, opening the folder holding the output files of the process in the file explorer (Finder on Mac). This feature is also added to the project name in the Projects window.
	* When a stratum is selected in the Stratum/PSU window it is now marked with darker grey color in the map. This currently only applies to AcousticPSU processes.
	* The Distance table has been completed, and can now be used to select EDSUs for an AcousticPSU processes.
	* The User log no longer resets when opening a different project. Instead, the right click option "Clear log" has been added.
	* Added scroll bar in the process parameter window.
	* Changed colors to red for processing error and orange for function input error. 
	* The GUI now disables process parameter view, open/new project, and R connection and Install Rstox packages, when running a process.
	* The full path to the project is now shown as tooltip on the project name in the Projects window.
	* Origin for the map projection can now be set by right click in the map. 
	* Added an info box when the previously opened project opens when opening StoX. 
	* When clicking "Yes" in Install Rstox packages the "Yes" button is now disabled, blocking a second installation.
	* Light blue background has been added to all active window and tab names, as well as the active process.
	* The GUI now shows RstoxFramework without version in the upper right corner, with red if any of the packages RstoxFramework, RstoxBase or RstoxData is not the certified version of the StoX release. 
	* Processes with enabled = FALSE is now marked with grey process symbol.
	* Added progress spinner on R connection and Preview.
	* Expand buttons in the process parameter window have changed logic to the natural logic (arrow down means open the list, arrow right means close the list).
	* Add PSU now activates only on AcousticPSU processes.
	* The GUI now stops immediately before a process with function input error, but jumps over processes which are not enabled.
* Added a line "... truncated" if a table in Preview does not contain all rows (the GUI shows at most 200000 rows).
* StoX now deletes output files when a parameter of the process is changed.
* Removed all non-official Rstox-package versions from the StoX repository (https://github.com/StoXProject/repo). This implies that non-official StoX versions can no longer use Install Rstox packages. The user must instead install the appropriate Rstox packages in R.

## Changes affecting backward compatibility
* Changed behavior of DefinitionMethod "WaterColumn" so that even data with missing depth information will have Layer = "WaterColumn". Before, if MinHaulDepth, MaxHaulDepth, MinChannelDepth or MaxHChannelDepth was missing, Layer would also be missing. This change will result in more individuals in IndividualsData, as the line hauls tagged to PSUs with NA Layer are removed when QuantityType == "SweptArea" in Individuals(). Also, changed the MinLayerDepth and MaxLayerDepth from the range of the depths (set to 0 and Inf if min depth and max depth was missing) to (0, NA), saying that "WaterColumn" means from surface to an unknown bottom, or at least not defined by a single value.

## Bug fixes
* A problem with large ECA projects where Reca prints large amounts of text to stdout and stderr, where the GUI froze, has been fixed.
* Fixed a bug where the GUI got stuck in the Add stratum symbol if one ran the StratumPolygon process before changing symbol back to the navigator symbol. 
* Fixed possible bug when using a Regression process data where GroupingVariables were set. The indices of the rows of the SuperIndividualsData to be imputed were previously identified before merging in the RegressionTable of the Regression process data. This could possibly change the order so that indices were incorrect when the actual imputation by regression was made. In the new version the indices are identified as the last step before the imputation.
* Fixed bug where EDSUs for StoX projects with data from ICESAcoustic data with and without end position given by Longitude2 resulted in EDSUs not being shown.
* Fixed bug where "Linear" was used instead of "SimpleLinear" as EstimationMethod in EstimateBioticRegression().
* Also fixed bug where the EstimationMethod "SimpleLinear" did not work as expected. 
* Fixed possible values for AcousticCategory in SpeciesLink in SplitNASC(), from the available AcousticCategory in the NASCData to the SplitAcousticCategory in the AcousticCategoryLink. Also reordered the parameters so that AcousticCategoryLink comes before SpeciesLink.
* Fixed bug with R < 4.2, where a filter process with unspecified FilterExpression retuns error "zero-length inputs cannot be mixed with those of non-zero length". The error is returned both when opening the FilterExpression and when running the process.
* Changed to not remove rows with missing Haul in DefineBioticAssignment(). This was introduced by a misunderstanding in StoX 3.5.0, in the case when DefinitionMethod == "Stratum". The warning when all Hauls are missing is kept.

## Warning and error messages
* Removed warning when a preview is open in the GUI and the process is changed (setting warn to FALSE in getProcessTableOutput(), getProcessGeoJsonOutput() and getProcessPlotOutput()).
* Improved error message when readProjectDescriptionJSON() fails to read project.json.
* Added error if variables specified in Regression in ImputeSuperIndividuals() are not present in the data (previously this was only a warning).
* Added error if a LayerTable specified by the user contains missing values.
* Added a warning if the variables selected using GroupingVariables and RegressionModel have changed in DefineRegression(), making the RegressionTable not work properly in the current version of the GUI.
* Removed error when there are Individuals with IndividualTotalLength smaller than the smallest IndividualTotalLength in the QuantityData in SuperIndividuals(). This was changed to warnings when IndividualTotalLength does not fit into any of the length intervals of the QuantityData.
* Added warning when there are AcousticCategory present in the NASCData but not in the SpeciesLink in AcousticDensity.
* Added warning when ch_type P is missing or represent less sa than B.
* Improved warnings in StoxBiotic() when missing values are generated for different producttype etc.
* Added warning for duplicated station in NMDBiotic, which leads to more than one Haul per Station. This is not supported when assigning Hauls in the map, where all Hauls of a Station are selected. Filtering out Hauls can be a solution.

## Detailed changes
* Added variable selection dialogue for GroupingVariables in DefineRegression() (typing, as there is no list of possible values).
* Disallowed empty string stratum name from the GUI.
* Cleaned up JSON validation test files to enhance the expected error.


# StoX v3.5.0 (2022-08-15)

## Summary
* The new StoX 3.5.0 adds support for R 4.2, which could not be used with StoX 3.4.0, improves warning messages and removes some unnecessary messages, adds the option of a simple longitude-latitude (Equirectangular) projection in the GUI as well as selecting origin of the Lambert Azimuthal Equal Area projection by right-clicking, and includes several bug fixes and changes that improve stability. A forced change in stratum area calculation may change the output of the StratumArea function slightly. See below for details. 

## General changes
* Added R 4.2. as supported version.
* Changed projections in the map to only the "Lambert Azimuthal Equal Area Projection" and the "Equirectangular Projection". The origin can be set in the former by right-clicking in the map. StoX will remember the last used projection, origin and zoom when booting. Some challenges remain, specifically that the sea turns into the same colour as land for specific origins, and that some grid lines jump out of position.
* The GUI now supports empty fields in parameter tables, which are treated as missing value (NA). This is now the preferred way to denote NAs!
* Added DependentResolutionVariable and IndependentResolutionVariable in the RegressionTable of DefineRegression() and as parameters in EstimateBioticRegression(), used for adding half the resolution of e.g. length intervals.
* Added warning occurring when there are samples with positive SampleNumber but no individuals, in which case Abundance will be set to NA in the SuperIndividuals function.
* Replaced all use of functions from the packages rgdal and rgeos by the package sf, as per the planned retirement of these packages. See https://www.r-bloggers.com/2022/04/r-spatial-evolution-retirement-of-rgdal-rgeos-and-maptools/. 
* Changed time stamp server to sectigo
* Removed hard coded values for the following variables on ICESDatras() (variable name -> new value): 
	* Table HH:
		* Country -> nation
		* Ship -> platformname
		* SweepLngt -> NA
		* GearEx -> NA
		* DayNight -> NA
		* StatRec -> area + location (concatenation)
		* HaulVal -> NA
		* Distance -> distance (in meters)
		* GroundSpeed -> vesselspeed
	* Table HL:
		* SpecVal -> NA
		* LenMeasType -> lengthmeasurement
	* Table CA:
		* Maturity -> NA
		* MaturityScale -> NA
		* AgeSource -> agingstructure
		* OtGrading -> readability (only if agingstructure is 2)
		* PlusGr -> NA
* Removed hard coded values for the following variables on ICESBiotic(): 
	* Platform -> platformname
	* Validity -> NA
	* StatisticalRectangle -> area + location

## Bug fixes
* Fixed bug in LengthDistribution() with SampleWeight or SampleCount = 0, where haulsWithInfRaisingFactor and samplesWithInfRaisingFactor were missing.
* Fixed bug in DateTime of StoxAcousticData for data read from ICESAcoustic files where time is specified with seconds. In StoX 3.4.2 and older the seconds were set to 00. Fixed also a related bug in DateTime of StoxBioticData for data read from ICESBiotic files where time is specified as YYYY-MM-DDThh:mm. In StoX 3.4.2 and older the DateTime was truncated to only date.
* Fixed bug in AssignmentLengthDistribution(), where the sum of the WeightedNumber did not sum to 100. This did not have any implications on the estimates, as AcousticDensity() normalizes the WeightedNumber from the AssignmentLengthDistributionData.
* Fixed bug in ReportSpeciesCategoryCatch(), where Hauls were duplicated.
* Fixed bug in DateTime in StoxBioticData, where milliseconds were pasted twice if present in the input data. 
* Fixed bug reported in https://jira.imr.no/browse/STOX-544, occurring when splitting catchsample into SpeciesCategory and Sample, by unique() in firstPhase(). 
* Fixed bug in Versions.R, which is used by StoX for the tool "Install Rstox packages". The bug was that the package data.table was used but not installed. Also, added support for installing Rstox package binaries built with older R versions than the one installed, allowing for installation of Rstox packages in existing StoX versions even when a new R version is released and installed. In R 4.2. the location of the folder in which user installed packages are saved has changed from the Documents folder to the AppData > Local folder of the user, which is now included in Versions.R.

## Detailed changes
* Improved warnings AcousticDataToICESAcousticOne() when values are not found in ICES reference tables.
* Improved warning when EDSUs/Stations are tagged to a PSU but not present in the data. 
* Turned off spherical geometry with apply_and_set_use_s2_to_FALSE() when locating EDSUs/Stations in Strata. 
* Added warning when no assigned hauls are located in any Stratum of the PSUs. 
* Cleaned up warnings that list up Hauls, PSUs etc, so that alle use printErrorIDs(), which was simplified.
* Changed to not split NSAC = 0 in SplitNASC. 
* Changed SplitNASC to remove rows with NA NASC originating from missing assignment length distribution. 
* Changed to consider species to be split that are not present in the AssignmentLengthDistribution of a NASC value to be split as WeightedNumber = 0 instead of NA. This prevents NA NASC, and doubles the previous change.
* Disabled warning in Translate-functions when a table contained some but not all of the variables of the Translation. 
* Added warning when SampleCount is used instead of the new SampleNumber in a filter, asking the user to change the filter. 
* Added warning in StoxAcoustic() for data read from ICESAcoustic files where time is specified with minutes (seconds not given). In StoX 3.4.2 and older the LogKey (and subsequently the EDSU) of StoxAcoustic is given in the form YYYY-MM-DDThh:mm.000Z instead of the more reasonable YYYY-MM-DDThh:mm:ss.000Z. This is kept for backwards compatibility, as the LogKey and EDSU are used in process data. It is recommended to use ICESAcoustic files with seconds resolution.
* Changed to using null to denote missing values (NAs) in the project.json, instead of "string" in jsonlite::toJSON().
* Added formatting of parameter tables read from the GUI.
* Fixed bug in DefineBioticAssignment() where DefinitionMethod "Stratum" failed due to unset attribute "pointLabel".
* Added stop when project.xml file path is not set in a DefinitionMethod "ResourceFile"
* Disabled the EstimationMethod "NonLinear" in the drop-down menu in the RegressionTable of function Regression() in the GUI.
* Changed JSON schema so that all table columns of type "string" allow also type "null", supporting NAs.
* Reverted to identify all AcousticPSUs that have any missing assignment, as the proposed solution did not work.
* Fixed bug in the JSON schema of the Translation process data, where number, string and boolean were allowed for the NewValue field, in that order, whereas string and null is correct.
* Refactored location of stations and EDSUs in stratum, and added warnings when locating to multiple or zero stratum.
* Tested and saved for future reference the function StratumArea_supportingIterativeCentroidCalculation which sets the centroid more accurately when transforming to Cartesian coordinates for the area calcuclation.
* Changed tolerance in test-versus_2.7.R as per slight differences in StratumArea due to move from rgeos to sf in RstoxBase, forced by https://www.r-bloggers.com/2022/04/r-spatial-evolution-retirement-of-rgdal-rgeos-and-maptools/.
* Replaced the logical parameter AddToLowestTable by the string parameter SplitTableAllocation in AddToStoxBiotic(), allowing for allocating variables to either the default, highest or lowest table when splitting tables StoxBiotic.
* Moved all User log entries and formatting to RstoxFramework.


# StoX v3.4.6 (2022-08-10)

## Detailed changes
* Improved warning when EDSUs/Stations are tagged to a PSU but not present in the data. 
* Turned off spherical geometry with apply_and_set_use_s2_to_FALSE() when locating EDSUs/Stations in Strata. 
* Added warning when no assigned hauls are located in any Stratum of the PSUs. 
* Cleaned up warnings that list up Hauls, PSUs etc, so that alle use printErrorIDs(), which was simplified.


# StoX v3.4.5 (2022-08-08)

## General 
* Test release, fixing Rstox package version numbers.


# StoX v3.4.4 (2022-08-07)

## General changes
* This version inclcudes changes made to verify that SplitNASC() produces the same results as in StoXX 3.1.12, which was used for the HERAS. Stricter treatment of missing values had introduced some differences which were solved mainly by not splitting NASC = 0.

## Bug fixes
* Fixed bug in LengthDistribution() with SampleWeight or SampleCount = 0, where haulsWithInfRaisingFactor and samplesWithInfRaisingFactor were missing on line 208.


## Detailed changes
* Changed to not split NSAC = 0. 
* Changed SplitNASC to remove rows with NA NASC originating from missing assignment length distribution. 
* Changed to consider species to be split that are not present in the AssignmentLengthDistribution of a NASC value to be split as WeightedNumber = 0 instead of NA. This prevents NA NASC, and doubles the previous change.
* Disabled warning in Translate-functions when a table contained some but not all of the variables of the Translation. 
* Added warning when SampleCount is used instead of the new SampleNumber in a filter, asking the user to change the filter. 


# StoX v3.4.3 (2022-06-22)

## General changes
* Changed projections in the map to only the "Lambert Azimuthal Equal Area Projection" and the "Equirectangular Projection". The origin can be set in the former by right-clicking in the map. StoX will remember the last used projection, origin and zoom when booting. Some challenges remain, specifically that the sea turns into the same colour as land for specific origins, and that some grid lines jump out of position.
* The GUI now supports empty fields in parameter tables, which are treated as missing value (NA). This is now the preferred way to denote NAs!
* Added DependentResolutionVariable and IndependentResolutionVariable in the RegressionTable of DefineRegression() and as parameters in EstimateBioticRegression(), used for adding half the resolution of e.g. length intervals.

## Bug fixes
* Fixed bug in DateTime of StoxAcousticData for data read from ICESAcoustic files where time is specified with seconds. In StoX 3.4.2 and older the seconds were set to 00. Fixed also a related bug in DateTime of StoxBioticData for data read from ICESBiotic files where time is specified as YYYY-MM-DDThh:mm. In StoX 3.4.2 and older the DateTime was truncated to only date.

## Detailed changes
* Added warning in StoxAcoustic() for data read from ICESAcoustic files where time is specified with minutes (seconds not given). In StoX 3.4.2 and older the LogKey (and subsequently the EDSU) of StoxAcoustic is given in the form YYYY-MM-DDThh:mm.000Z instead of the more reasonable YYYY-MM-DDThh:mm:ss.000Z. This is kept for backwards compatibility, as the LogKey and EDSU are used in process data. It is recommended to use ICESAcoustic files with seconds resolution.
* Changed to using null to denote missing values (NAs) in the project.json, instead of "string" in jsonlite::toJSON().
* Added formatting of parameter tables read from the GUI.
* Fixed bug in DefineBioticAssignment() where DefinitionMethod "Stratum" failed due to unset attribute "pointLabel".
* Added stop when project.xml file path is not set in a DefinitionMethod "ResourceFile"
* Disabled the EstimationMethod "NonLinear" in the drop-down menu in the RegressionTable of function Regression() in the GUI.
* Changed JSON schema so that all table columns of type "string" allow also type "null", supporting NAs.
* Reverted to identify all AcousticPSUs that have any missing assignment, as the proposed solution did not work.
* Fixed bug in the JSON schema of the Translation process data, where number, string and boolean were allowed for the NewValue field, in that order, whereas string and null is correct.


# StoX v3.4.2 (2022-06-02)

## General changes
* Added R 4.2. as supported version.
* Added warning occurring when there are samples with positive SampleNumber but no individuals, resulting in positive Abundance in the SuperIndividuals function to be set to NA.
* Replaced all use of functions from the packages rgdal and rgeos by the package sf, as per the planned retirement of these packages. See https://www.r-bloggers.com/2022/04/r-spatial-evolution-retirement-of-rgdal-rgeos-and-maptools/. 
* Changed time stamp server to sectigo

## Detailed changes
* Refactored location of stations and EDSUs in stratum, and added warnings when locating to multiple or zero stratum.
* Tested and saved for future reference the function StratumArea_supportingIterativeCentroidCalculation which sets the centroid more accurately when transforming to Cartesian coordinates for the area calcuclation.
* Changed tolerance in test-versus_2.7.R as per slight differences in StratumArea due to move from rgeos to sf in RstoxBase, forced by https://www.r-bloggers.com/2022/04/r-spatial-evolution-retirement-of-rgdal-rgeos-and-maptools/.


# StoX v3.4.1 (2022-05-13)

## Bug fixes
* Fixed bug in AssignmentLengthDistribution(), where the sum of the WeightedNumber did not sum to 100. This did not have any implications on the estimates, as AcousticDensity() normalizes the WeightedNumber from the AssignmentLengthDistributionData.
* Fixed bug in ReportSpeciesCategoryCatch(), where Hauls were duplicated.
* Fixed bug in DateTime in StoxBioticData, where milliseconds were pasted twice if present in the input data. 
* Fixed bug reported in https://jira.imr.no/browse/STOX-544, occurring when splitting catchsample into SpeciesCategory and Sample, by unique() in firstPhase(). 
* Fixed bug in Versions.R, which is used by StoX for the tool "Install Rstox packages". The bug was that the package data.table was used but not installed. Also, added support for installing Rstox package binaries built with older R versions than the one installed, allowing for installation of Rstox packages in existing StoX versions even when a new R version is released and installed. In R 4.2. the location of the folder in which user installed packages are saved has changed from the Documents folder to the AppData > Local folder of the user, which is now included in Versions.R.

## General changes
* Replaced all use of functions from the packages rgdal and rgeos by the package sf, as per the planned retirement of these packages. See https://www.r-bloggers.com/2022/04/r-spatial-evolution-retirement-of-rgdal-rgeos-and-maptools/. 
* Changed time stamp server to sectigo
* Removed hard coded values for the following variables on ICESDatras() (variable name -> new value): 
	* Table HH:
		* Country -> nation
		* Ship -> platformname
		* SweepLngt -> NA
		* GearEx -> NA
		* DayNight -> NA
		* StatRec -> area + location (concatenation)
		* HaulVal -> NA
		* Distance -> distance (in meters)
		* GroundSpeed -> vesselspeed
	* Table HL:
		* SpecVal -> NA
		* LenMeasType -> lengthmeasurement
	* Table CA:
		* Maturity -> NA
		* MaturityScale -> NA
		* AgeSource -> agingstructure
		* OtGrading -> readability (only if agingstructure is 2)
		* PlusGr -> NA
* Removed hard coded values for the following variables on ICESBiotic(): 
	* Platform -> platformname
	* Validity -> NA
	* StatisticalRectangle -> area + location

## Detailed changes
* Replaced the logical parameter AddToLowestTable by the string parameter SplitTableAllocation in AddToStoxBiotic(), allowing for allocating variables to either the default, highest or lowest table when splitting tables StoxBiotic.
* Moved all User log entries and formatting to RstoxFramework.


# StoX v3.4.0 (2022-03-30)

## Summary
* The new StoX 3.4.0 contains a number of important bug fixes, such as an error in acoustic-trawl projects in the function SuperIndividuals when DistributionMethod = "HaulDensity" and Hauls are assigned to PSUs in more than one stratum, which led to under-estimation. The new version contains several improvements with regards to warnings and errors, such as warnings when hauls with no length distribution of the target species are assigned to the acoustic PSUs of a Stratum, which can lead to biased bootstrapping. 
* Some additional features and parameter are added, such as WeightingMethod "AcousticDensity" in function BioticAssignmentWeighting, and the possibility to define translation directly in Translate-functions. Translation can now also be defined using function strings, useful e.g. if one wants to set all non-NA values to NA.
* The function ReportBootstrap has been sped up by a factor of at least 10
* Finally, the new changes in ICES formats are supported.

## Changes affecting backward compatibility
* Fixed bug in BioticAssignmentWeighting, WeightingMethod "SumWeightedNumber" and "InverseSumWeightedNumber", where weights were overwritten instead of multiplied, with the consequence that the randomness introduced by the bootstrapping of hauls in acoustic-trawl models when the DefineBioticAssignment process is used in BootstrapMethodTable will be overwritten by the BioticAssignmentWeighting process, thus cancelling the randomness for hauls (randomness will still be present for the EDSUs).
* Changed the process data Translation from a table with columns VariableName, Value, NewValue, ConditionalVariableName, ConditionalValueColumn, to a table of the variable to translate in the first column; the column NewValue giving the values to translate to in the second column; followed by zero or more conditional variables. This supports multiple conditional variables, but restricts to translating only one variable at the time (although the old table i still supported, but cannot be generated in the GUI). 

## Bug fixes
* Fixed critical bug in acoustic-trawl projects in the function SuperIndividuals when DistributionMethod = "HaulDensity" and Hauls are assigned to PSUs in more than one stratum, which led to under-estimation, as the number of individuals to distribute the Abundance to was counted over all strata per Haul ID, whereas only inside the stratum was correct.
* Fixed bug in removeEDSU(), where EDSUs to remove were assigned empty string instead of NA as PSU.
* Fixed bug in JSON schema for AcousticLayer and BioticLayer.
* Fixed bug "names do not match previous names" when adding a new stratum in the StoX GUI.
* Fixed bug where the blue dot marking processes as 'run' was turned on on a newly modified process when immediately modifying a later process.
* Fixed bug when working with a DefineStratumPolygon process with no polygons defined (readProcessOutputFile() did nor read deal properly with the empty SpatialPolygonsDataFrame with jsonlite::prettify(geojsonsf::sf_geojson(sf::st_as_sf(data))), but ok when using replaceSpatialFileReference(buildSpatialFileReferenceString(data)) instead).
* Fixed bug in ICESDatras() occurring when there were rows with the same aphia and species, but with missing sex.
* Fixed bug in drop-down list for DensityType in SweptAreaDensity() when SweptAreaDensityMethod == "LengthDistributed". To avoid error the user had to type in the value manually as ["AreaNumberDensity"]. Moved from testthat to tinytest.
* Fixed bug causing stream = TRUE to fail on MacOS Monterey in readXmlFile().

## General changes
* Added WeightingMethod "AcousticDensity" in function BioticAssignmentWeighting, including the parameter MinNumberOfEDSUs.
* Added the parameter AddToLowestTable in AddToStoxBiotic(), which can be used for adding variables from tables in NMDBiotic or ICESBiotic that are split into two tables in StoxBiotic (fishstation and catchsample in NMDBiotic and Haul and Catch in ICESBiotic). When these tables are split into two tables StoX decides which variable should be placed in each table. E.g., geographical position is placed in the Station table of StoxBiotic, which implies that only the first position of several hauls that comprise one Station is kept. If one needs all positions, AddToLowestTable can be set to TRUE so that the positions are placed in the Haul table instead of the Station table of StoxBiotic.
* Added support for the new changes in the ICESBiotic and ICESAcoustic format.
* Reduced time of ReportBootstrap() to a few percent.
* Changed all sd and cv in reports from 0 to NA. Standard deviation = 0 is no longer accepted by StoX, as it implies either insufficient number of bootstraps or only one value to sample from in the bootstrapping.
* Increased significant digits of small numbers from 6 to 12.
* Added the parameters TranslationDefinition, TranslationTable, VariableName, Conditional and ConditionalVariableNames to all Translate functions, specifically TranslateAcoustic(), TranslateBiotic(), TranslateICESAcoustic(), TranslateICESBiotic(), TranslateICESDatras(), TranslateLanding(), TranslateStoxAcoustic(), TranslateStoxBiotic() and TranslateStoxLanding(). This allows for specifying the Translation as a table in the Translate function, without the need for DefineTranslation(). DefineTranslation() can still be used, and must be used if reading the Translation from a file.
* Added InformationVariables to ReportBootstrap().
* Added support for specifying a function as a string in Translation process data, usefull e.g. for setting fish larger than som value to mature.
* Added errors as StoX warning in getRegressionTable() to communicate the error. 

## Warnings and errors
* Added error when the raising factor calculated from CatchFractionWeight/SampleWeight or CatchFractionNumber/SampleNumber is NA or Inf in one or more samples. This is an indication of error in the data that StoX can take no general approach to handle. The primary solution for this error is to correct the errors in the input data, or preferably in the database holding the data, so that other users may avoid the same error. There are possibilities for filtering out the hauls/samples with error in raising factor in StoX, but this requires COMPLETE KNOWLEDGE of what the different samples and hauls represent. Filtering out a sample with missing raising factor causes the length distribution to be given by the other samples, which may be special samples of e.g. only large fish, resulting in highly biased length distribution. Filtering out entire hauls is also problematic, as one may lose vital information in the data, say if the large catches have a particular problem with extra samples where the raising factor is not given. Another dangerous option in StoX is to translate e.g. CatchFractionWeight and SampleWeight to positive values at the exact knowledge of what the correct value should be. 
* Changed the warning when not all assigned hauls have length measured individuals to a warning when not all hauls of the stratum have length measured individuals, as we are bootstrapping within hauls and not within assignment.
* Added a warning for when only one assigned haul has length measured individuals.
* Added error when weigths do not sum to 1 in SuperIndividuals, with a not indicating that this may be due to different input LengthDistributionData compared to that used to derive the input QuantityData.
* Changed warning when there are assigned hauls with no length distribution. Now there is a warning in AcousticDensity() if there are hauls in a stratum for which not ALL target species have length distribution. In SplitNASC() the warning is when not ANY target species have length distribution, as we only need one length distribution to distribute NASC between species.
* Changed the warning "that have assigned ONLY ONE haul with length measured individuals" to "that have assigned ONLY ONE haul", since this warning concerns bootstrapping only one Haul, regardless of whether the Haul contains length distribution or not.
* Added warning when at least one of bottomdepthstart and bottomdepthstop are missing, so that BottomDepth is NA.
* Included more informative warning when e.g. product types are not the required value in StoxBiotic().
* Added error when EstimateBioticRegression() when using the power model and when there are 0 in the data, which result in -Inf in the log used in the power regression.
* Added warnings for when (catch)producttype != 1, (sample)producttype != 1, (individual)producttype != 1, or lengthmeasurement != 'E'. 

## Detailed changes
* Added na.action = na.exclude to the regression functions applied by EstimateBioticRegression().
* Added possible values for SpeciesLink in AcousticDensity().
* Added notes on the difference between unit for Biomass in the data types QuantityData (kg) and SuperIndividualsData (g) in the documentation of the functions Quantity() and SuperIndividuals().
* Changed to using StratumName instead of the old polygonName in stratum polygons throughout RstoxFramework and the StoX GUI
* Added order of backward compatibility actions to package first (alphabetically), then change version (numerically), and finally action type with order as given by RstoxFramework::getRstoxFrameworkDefinitions("backwardCompatibilityActionNames"). 
* Renamed ConditionalVariableName to ConditionalVariableNames and ConditionalValueColumn to ConditionalValueColumns, as multiple values are now supported.
* Added support for both NAs and other values in the same Translation process data.
* Added support for NMDBiotic files of mixed version (<= and > 1.4) in AddToStoxBiotic() (removing the prey table and other unused tables, as consistent link to the individual table is not provided by the XML schema.). 
* Added drop-down list in parameters DependentVariable and IndependentVariable in EstimateRegression().


# StoX v3.3.10 (2022-03-30)

## Detailed changes
* Changed WeightingMethod "AcousticDensity" to only consider EDSUs that are tagged to an acoustic PSU.

# StoX v3.3.9 (2022-03-29)

## Changes affecting backward compatibility
* Fixed bug in BioticAssignmentWeighting, WeightingMethod "SumWeightedNumber" and "InverseSumWeightedNumber", where weights were overwritten instead of multiplied, with the consequence that the randomness introduced by the bootstrapping of hauls in acoustic-trawl models when the DefineBioticAssignment process is used in BootstrapMethodTable will be overwritten by the BioticAssignmentWeighting process, thus cancelling the randomness for hauls (randomness will still be present for the EDSUs).

## Detailed changes
* Translated WeightingMethod "NASC" to "AcousticDensity" to reflect that AcousticDensity is calcuclated per EDSU around each Haul. Changed the description of the BioticAssignmentWeighting() to reflect that this happens rather than averaging NASC first and then calculating AcousticDensity. Fixed errors in BioticAssignmentWeighting() when WeightingMethod = "AcousticDensity".
* Added error when weigths do not sum to 1 in SuperIndividuals, with a not indicating that this may be due to different input LengthDistributionData compared to that used to derive the input QuantityData.

# StoX v3.3.8 (2022-03-24)

## Bug fixes
* Fixed critical bug in acoustic-trawl projects for SuperIndividuals when DistributionMethod = "HaulDensity" and Hauls are assigned to PSUs in more than one stratum, which led to under-estimation, as the number of individuals to distribute the Abundance to was counted over all strata per Haul ID, whereas only inside the stratum was correct.

# StoX v3.3.7 (2022-03-22)

## General
* Added the parameter AddToLowestTable in AddToStoxBiotic(), which can be used for adding variables from tables in NMDBiotic or ICESBiotic that are split into two tables in StoxBiotic (fishstation and catchsample in NMDBiotic and Haul and Catch in ICESBiotic). When these tables are split into two tables StoX decides which variable should be placed in each table. E.g., geographical position is placed in the Station table of StoxBiotic, which implies that only the first position of several hauls that comprise one Station is kept. If one needs all positions, AddToLowestTable can be set to TRUE so that the positions are placed in the Haul table instead of the Station table of StoxBiotic.

## Bug fixes
* Fixed bug in possible values for speciesLinkTable in SplitNASC().
* Fixed bug when checking for only one PSU in a stratum.
* Fixed bug in JSON schema for AcousticLayer and BioticLayer.

## Detailed changes
* Changed warning when there are assigned hauls with no length distribution. Now there is a warning in AcousticDensity() if there are hauls in a stratum for which not ALL target species have length distribution. In SplitNASC() the warning is when not ANY target species have length distribution, as we only need one length distribution to distribute NASC between species.
* Changed the warning "that have assigned ONLY ONE haul with length measured individuals" to "that have assigned ONLY ONE haul", since this warning concerns bootstrapping only one Haul, regardless of whether the Haul contains length distribution or not.
* Added the MinNumberOfEDSUs parameter to BioticAssignmentWeighting() when WeightingMethod == "NASC".

# StoX v3.3.6 (2022-03-15)

## Bug fixes
* Fixed bug in removeEDSU(), where EDSUs to remove were assigned empty string instead of NA as PSU.
* Fixed bug in JSON schema for AcousticLayer and BioticLayer.

## Detailed changes
* Added warning when at least one of bottomdepthstart and bottomdepthstop are missing, so that BottomDepth is NA.
* Included more informative warning when e.g. product types are not the required value in StoxBiotic().


# StoX v3.3.5 (2022-03-03)

## General
* Added support for the new changes in the ICESBiotic and ICESAcoustic format.


# StoX v3.3.4 (2022-03-02)

## General
* Reduced time of ReportBootstrap() to a few percent.
* Changed all sd and cv in reports from 0 to NA. Standard deviation = 0 is no longer accepted by StoX, as it implies either insufficient number of bootstraps or only one value to sample from in the bootstrapping.
* Added error when the raising factor calculated from CatchFractionWeight/SampleWeight or CatchFractionNumber/SampleNumber is NA or Inf in one or more samples. This is an indication of error in the data that StoX can take no general approach to handle. The primary solution for this error is to correct the errors in the input data, or preferably in the database holding the data, so that other users may avoid the same error. There are possibilities for filtering out the hauls/samples with error in raising factor in StoX, but this requires COMPLETE KNOWLEDGE of what the different samples and hauls represent. Filtering out a sample with missing raising factor causes the length distribution to be given by the other samples, which may be special samples of e.g. only large fish, resulting in highly biased length distribution. Filtering out entire hauls is also problematic, as one may lose vital information in the data, say if the large catches have a particular problem with extra samples where the raising factor is not given. Another dangerous option in StoX is to translate e.g. CatchFractionWeight and SampleWeight to positive values at the exact knowledge of what the correct value should be. 

## Detailed changes
* Increased significant digits of small numbers from 6 to 12.
* Moved application of setRstoxPrecisionLevel() from each StoX function to RstoxFramework::runProcess().
* Added error when EstimateBioticRegression() when using the power model and when there are 0 in the data, which result in -Inf in the log used in the power regression.
* Added na.action = na.exclude to the regression functions applied by EstimateBioticRegression().
* Changed the warning when not all assigned hauls have length measured individuals to a warning when not all hauls of the stratum have length measured individuals, as we are bootstrapping within hauls and not within assignment.
* Added a warning for when only one assigned haul has length measured individuals.
* Added possible values for SpeciesLink in AcousticDensity().
* Added notes on the difference between unit for Biomass in the data types QuantityData (kg) and SuperIndividualsData (g) in the documentation of the functions Quantity() and SuperIndividuals().
* Changed to using StratumName instead of the old polygonName in stratum polygons throughout RstoxFramework and the StoX GUI
* Added order of backward compatibility actions to package first (alphabetically), then change version (numerically), and finally action type with order as given by RstoxFramework::getRstoxFrameworkDefinitions("backwardCompatibilityActionNames"). 

## Bug fixes
* Fixed bug "names do not match previous names" when adding a new stratum in the StoX GUI.
* Fixed bug where the blue dot marking processes as 'run' was turned on on a newly modified process when immediately modifying a later process.
* Fixed bug when working with a DefineStratumPolygon process with no polygons defined (readProcessOutputFile() did nor read deal properly with the empty SpatialPolygonsDataFrame with jsonlite::prettify(geojsonsf::sf_geojson(sf::st_as_sf(data))), but ok when using replaceSpatialFileReference(buildSpatialFileReferenceString(data)) instead).


# StoX v3.3.3 (2022-02-14)

## General
* Added the parameters TranslationDefinition, TranslationTable, VariableName, Conditional and ConditionalVariableNames to all Translate functions, specifically TranslateAcoustic(), TranslateBiotic(), TranslateICESAcoustic(), TranslateICESBiotic(), TranslateICESDatras(), TranslateLanding(), TranslateStoxAcoustic(), TranslateStoxBiotic() and TranslateStoxLanding(). This allows for specifying the Translation as a table in the Translate function, without the need for DefineTranslation(). DefineTranslation() can still be used, and must be used if reading the Translation from a file.

## Detailed changes
* Added InformationVariables to ReportBootstrap().


# StoX v3.3.2 (2022-02-10)

## General
* Added WeightingMethod = "NASC" in BioticAssignmentWeighting().
* Added support for specifying a function as a string in Translation process data, usefull e.g. for setting fish larger than som value to mature.

## Changes affecting backward compatibility
* Changed the process data Translation from a table with columns VariableName, Value, NewValue, ConditionalVariableName, ConditionalValueColumn, to a table of the variable to translate in the first column; the column NewValue giving the values to translate to in the second column; followed by zero or more conditional variables. This supports multiple conditional variables, but restricts to translating only one variable at the time (although the old table i still supported, but cannot be generated in the GUI). 

## Bug fixes
* Fixed bug in ICESDatras() occurring when there were rows with the same aphia and species, but with missing sex.

## Detailed changes
* Renamed ConditionalVariableName to ConditionalVariableNames and ConditionalValueColumn to ConditionalValueColumns, as multiple values are now supported.
* Added support for both NAs and other values in the same Translation process data.


# StoX v3.3.1 (2022-01-25)

## General
* The unofficial version StoX 3.3.1 fixes a bug in the GUI occurring when selecting DensityType in SweptAreaDensity() when SweptAreaDensityMethod == "LengthDistributed", along with a few other improvements.

## Bug fixes
* Fixed bug in drop-down list for DensityType in SweptAreaDensity() when SweptAreaDensityMethod == "LengthDistributed". To avoid error the user had to type in the value manually as ["AreaNumberDensity"]. Moved from testthat to tinytest.
* Fixed bug causing stream = TRUE to fail on MacOS Monterey in readXmlFile().

## Detailed changes
* Added warnings for when (catch)producttype != 1, (sample)producttype != 1, (individual)producttype != 1, or lengthmeasurement != 'E'. 
* Added support for NMDBiotic files of mixed version (<= and > 1.4) in AddToStoxBiotic() (removing the prey table and other unused tables, as consistent link to the individual table is not provided by the XML schema.). 
* Added drop-down list in parameters DependentVariable and IndependentVariable in EstimateRegression().
* Added errors as StoX warning in getRegressionTable() to communicate the error. 


# StoX v3.3.0 (2022-01-14)

## Summary
* The new StoX 3.3.0 completes the implementation of the functionality of StoX 2.7, by introducing the SweptAreaMethod = "TotalCatch" in SweptAreaDensity(), and ImputationMethod = "Regression" in ImputeSuperIndividuals() corresponding to FillWeight = "Regression" in FillMissingData() in StoX 2.7. TotalCatch can be calculated both as number and weight, and the function Abundance() has thus been renamed to Quantity() and gained the column Biomass in addition to the existing columnn Abundance.

## Changes affecting backward compatibility
* Changed all instances of the use of the phrase "count" to "number", in accordance with the terminology of ICESBiotic and the convension "area number density" ("area count density is very rare"). This change affects the following code:
	* In StoxBiotic():
		* *SampleCount -> SampleNumber*
		* *CatchFractionCount -> CatchFractionNumber*
		* **This could affect external scripts that use the StoxBioticData.**
	* In LengthDistribution(), SumLengthDistribution(), MeanLengthDistribution(), AssignmentLengthDistribution(), RegroupLengthDistribution(), GearDependentCatchCompensation(), LengthDependentCatchCompensation(), RelativeLengthDistribution():
		* *Renamed the column WeightedCount to WeightedNumber*
  	* **This could affect external scripts that use one of the listed datatypes as WeightedCount is no longer found. Other than that the WeightedCount does not exist further in the estimation models in StoX.**
	* In BioticAssignmentWeighting():
		* *WeightingMethod = "NormalizedTotalCount"  -> "NormalizedTotalNumber"*
		* *WeightingMethod = "SumWeightedCount"    -> "SumWeightedNumber"*
		* *WeightingMethod = "InverseSumWeightedCount" -> "InverseSumWeightedNumber"*
		* **Backward compatibility should take care of these**
	* LengthDistribution():
		* *RaisingFactorPriority = "Count" -> "Number"*
  	* **Backward compatibility should take care of these**
* Changed SpeciesCategoryCatch() to return a single table similar to LengthDistributionData, but with TotalCatchWeight and TotalCatchCount instead of WeightedCount. As such, moved the CatchVariable of SpeciesCategoryCatch() to the ReportVariable of ReportSpeciesCategoryCatch(). The latter is a backward compatibility breaking change. Any existing StoX project using SpeciesCategoryCatch() and ReportSpeciesCategoryCatch() will break in ReportSpeciesCategoryCatch(), and the ReportVariable needs to be set to the appropriate value in order to continue.

## General changes
* Added DefineRegression(), EstimateBioticRegression() and the implementation in ImputeSuperIndividuals(). Refactored so that DefineRegression() and DefineAcousticTargetStrength() both use the underlying DefineModel(), with outputs <Model>Model and <Model>Table. Renamed DefinitionMethod "TargetStrengthTable", "SurveyTable" and "LayerTable" to "Table".
* Added the function ReportAbundance().
* Changed SpeciesCategoryCatch() to return a single table similar to LengthDistributionData, but with TotalCatchWeight and TotalCatchCount instead of WeightedCount. As such, moved the CatchVariable of SpeciesCategoryCatch() to the ReportVariable of ReportSpeciesCategoryCatch(). The latter is a backward compatibility breaking change. Any existing StoX project using SpeciesCategoryCatch() and ReportSpeciesCategoryCatch() will break in ReportSpeciesCategoryCatch(), and the ReportVariable needs to be set to the appropriate value in order to continue.
* Added SumSpeciesCategoryCatch() and MeanSpeciesCategoryCatch().
* Added the parameter SweptAreaDensityType in SweptAreaDensity() supporting both "LengthDistributed" and "TotalCatch" swept-area density. 
* Added new column DensityType in DensityData with supported values "AreaNumberDensity" (the only option for AcousticDensity() and SweptAreaDensityType "LengthDistributed") and "AreaMassDensity".

## Detailed changes
* Added the parameter InformationVariables to reports.
* Hiding the parameters VariableName and ConditionalVariableName when DefinitionMethod = "Table" in Translation()
* Added ResampleMeanSpeciesCategoryCatchData(). 
* Added test for functioning help-pages. Updated tests.
* Changed type of the columns of the Translation process data to accept strings, numeric and boolean (preivously restricted to string).
* Changed TranslationTable to Table in DefineTranslation(). Fixed bug where NA in Tanslation was not converted properly to the type of the existing data. Added change of class in ICESBiotic() as per the XSD. Fixed bug in AddToStoxBiotic(), where variables from agedetermination in NMDBiotic >= 3 were not added. Code changed to use the xsd to determine the variables that can be added.
* Added renameColumInProcessDataTable as backward compatibility action. Changed to using AJV. Dropped the option of saving and reading project.RData. Added a second json validation after backward compatibility action, in case the first did not pass.


# StoX v3.2.4 (2022-01-13)

## General
* Renamed Abundance(), ReportAbundance(), AbundanceData and ReportAbundanceData to Quantity*, as this data now contains both Abundance and Biomass.


# StoX v3.2.3 (2022-01-12)

## General
* Changed all instances of the use of the phrase "count" to "number", in accordance with the terminology of ICESBiotic and the convension "area number density" ("area count density is very rare"). This change affects the following code:
	* In StoxBiotic():
		* *SampleCount -> SampleNumber*
		* *CatchFractionCount -> CatchFractionNumber*
		* **This could affect external scripts that use the StoxBioticData.**
	* In LengthDistribution(), SumLengthDistribution(), MeanLengthDistribution(), AssignmentLengthDistribution(), RegroupLengthDistribution(), GearDependentCatchCompensation(), LengthDependentCatchCompensation(), RelativeLengthDistribution():
		* *Renamed the column WeightedCount to WeightedNumber*
  	* **This could affect external scripts that use one of the listed datatypes as WeightedCount is no longer found. Other than that the WeightedCount does not exist further in the estimation models in StoX.**
	* In BioticAssignmentWeighting():
		* *WeightingMethod = "NormalizedTotalCount"  -> "NormalizedTotalNumber"*
		* *WeightingMethod = "SumWeightedCount"    -> "SumWeightedNumber"*
		* *WeightingMethod = "InverseSumWeightedCount" -> "InverseSumWeightedNumber"*
		* **Backward compatibility should take care of these**
	* LengthDistribution():
		* *RaisingFactorPriority = "Count" -> "Number"*
  	* **Backward compatibility should take care of these**
* Added the function ReportAbundance.

## Detailed changes
* Added the parameter InformationVariables to reports.
* Hiding the parameters VariableName and ConditionalVariableName when DefinitionMethod = "Table" in Translation()


# StoX v3.2.2 (2022-01-10)

## General
* Changed SpeciesCategoryCatch() to return a single table similar to LengthDistributionData, but with TotalCatchWeight and TotalCatchCount instead of WeightedCount. As such, moved the CatchVariable of SpeciesCategoryCatch() to the ReportVariable of ReportSpeciesCategoryCatch(). The latter is a backward compatibility breaking change. Any existing StoX project using SpeciesCategoryCatch() and ReportSpeciesCategoryCatch() will break in ReportSpeciesCategoryCatch(), and the ReportVariable needs to be set to the appropriate value in order to continue.
* Added SumSpeciesCategoryCatch() and MeanSpeciesCategoryCatch().
* Added the parameter SweptAreaDensityType in SweptAreaDensity() supporting both "LengthDistributed" and "TotalCatch" swept-area density. 
* Added new column DensityType in DensityData with supported values "AreaNumberDensity" (the only option for AcousticDensity() and SweptAreaDensityType "LengthDistributed") and "AreaMassDensity".
* Added new column AbundanceType in AbundanceData with supported values "Number" (the only option for AcousticDensity() and SweptAreaDensityType "LengthDistributed") and "Mass".

## Detailed changes
* Added ResampleMeanSpeciesCategoryCatchData(). 
* Added test for functioning help-pages. Updated tests.
* Changed type of the columns of the Translation process data to accept strings, numeric and boolean (preivously restricted to string).


# StoX v3.2.1 (2022-01-07)

## General
* Added DefineRegression(), EstimateBioticRegression() and the implementation in ImputeSuperIndividuals(). Refactored so that DefineRegression() and DefineAcousticTargetStrength() both use the underlying DefineModel(), with outputs <Model>Model and <Model>Table. Renamed DefinitionMethod "TargetStrengthTable", "SurveyTable" and "LayerTable" to "Table".

## Detailed changes
* Changed TranslationTable to Table in DefineTranslation(). Fixed bug where NA in Tanslation was not converted properly to the type of the existing data. Added change of class in ICESBiotic() as per the XSD. Fixed bug in AddToStoxBiotic(), where variables from agedetermination in NMDBiotic >= 3 were not added. Code changed to use the xsd to determine the variables that can be added.
* Added renameColumInProcessDataTable as backward compatibility action. Changed to using AJV. Dropped the option of saving and reading project.RData. Added a second json validation after backward compatibility action, in case the first did not pass.


# StoX v3.2.0 (2021-12-22)

## Summary
* The new StoX 3.2.0 includes improvements to speed, user experience and adds the possibility to build a new StoX project based on process data of an old StoX project created in StoX 2.7.

## Changes affecting backward reproducibility
* If there are hauls with empty length distribution of the taregt species (no length sampled fish) assigned to an acoustic PSU, there is a probability that only these hauls are resampeled in the bootstrapping, in which case acoustic density will be missing (NA) for that PSU, and further the abundance will be NA for the stratum of that PSU. This can lead to underestimation in reports from bootstrap, as NAs are treated as 0 across bootsrap runs in ReportBootsstrap().
* An error in StoX 3.1.0 has bee fixed, where acoustic PSUs with missing values in the variable Beam in the output from AcousticDensity() were included in the weighted average performed in MeanDensity(). Missing Beam is interpreted by StoX so that the Beam of interest was not recording. This is not a problem if the beam (frequency) of interest is present in all EDSUs in the acoustic input file, such as files retrieved from the ICES Acoustic trawl survey database (https://acoustic.ices.dk/submissions).
* Bootstrapping has been changed to be platform (operating system and language settings) independent. StoX 3.1.0 could have different effect of seed depending on the platform. Consequently, one may experience different results from bootstrapping, particularly on Windows with scandinavian language. This can be overcome by forcing the old order of strata by renaming. The difference is that StoX 3.2.0 sorts strata in the bootstrapping by the locale "en_US_POSIX" in stringi::stri_sort(), which organizes capital letters first (India before england). This may have a "seed effect", but induces no bias.
* StoX 3.2.0 removes empty acoustic PSUs (with no EDSUs), which can result in difference in the resampling of acoustic PSUs in bootstrapping using ResampleMeanNASCData in the BootstrapMethodTable. This may have has a "seed effect", but induces no bias.
* In DefineBioticAssignment() with DefinitionMethod "EllipsoidalDistance", the parameter BottomDepthDifference cannot yet be used when the acoustic data are read from NMDEchosounder files, due to this information being stored on each frequency, and a rule on how to extract this information for each Log, irrespective of frequency has not yet been defined. Also, the parameter Distance behaves differently in StoX >= 3 versus StoX 2.7. In StoX >= 3 distances are calculated along the great circle on a WGS84 ellipsoid (R function sp::spDists), whereas a spherical model was used in StoX 2.7.
* In StoX 2.7, using a combination of two fs.getLengthSampleCount, such as fs.getLengthSampleCount('Sardinella aurita') > 10 || fs.getLengthSampleCount('Sardinella maderensis') > 10, cannot be entirely reproduced in StoX >= 3. The option of using the following filter on the Sample table of StoxBiotic, with FilterUpwards = TRUE, removes the appropriate stations, but also removes the samples, which are left untouhced by the fs.getLengthSampleCount: SampleCount > 10 & SpeciesCategoryKey %in% "Sardinella aurita/161763/126422/NA") | (SampleCount > 10 & SpeciesCategoryKey %in% "Sardinella maderensis/161767/126423/NA". Instead the user can filter the specific stations which are left after the above filter expression.
* Changed from [0, Inf] to [min, max] of channel depth when DefinitionMethod "WaterColumn" in DefineLayer().

## General changes
* Treatment of missing values (NA) has been strengthened in StoX 3.2.0. Missing values are now preserved throughout a StoX project, so that e.g. an NA in LengthDistributionData (due to an error in the input data) will result in NA in the abundance estimate of the stratum linked to that NA. This is per the default behaivor in R, where the na.rm parameter has default value FALSE. The exception to this treatment of NAs is ReportBootstrap(), where a missing value is treated as 0 in order to take into acocunt the random fluctuations induced by the bootstrapping. If all values are NA, however, the result will be NA. The user may experience that StoX projects that produced valid results in the preivous StoX versions now result in NAs, requiring a diagnostics of the input data and settings of the StoX project. Consequently, this change may break backward reproducibility.
* Handling error and warning has been improved, by shifting focus to the User log when an error or a warning occurs. Also, several warning messages have been added, particularly for flagging missing information in the input data which can affect the end result. Also warnings are added when RemoveMissingValues or UseOutputData are set to TRUE, which should be used with care.
* Improvements has been made to speed of particularly heavy Baseline functionality, such as the DefinitionMethod "EDSUToPSU" in DefineAcousticPSU(), and DefineStratumPolygon() when reading large files. In the latter case the new parameters SimplifyStratumPolygon and SimplificationFactor can be used to reduce the resolution of the data that is saved to the project.json file, savinngg time when opening and saving the StoX project.
* The format of output text files with file extension "txt" has been changed to support equality when reading the files back into R with the function readModelData() in RstoxFramework. Before, all values were un-quoted, including strings. This had the consequence that strings consisting of numbers, such as "1", "2", etc, were converted to numeric by readModelData(). All strings are now quoted to avoid this problem. Also, missing values are now written as "NA" instead of the preivous empty string.
* StoX can now import AcoustiPSU, BioticAssignment and StratumPolygon from a StoX 2.7 project description file (project.xml), through the DefinitionMethod "ResourceFile" in DefineAcoustiPSU(), DefineBioticAssignment() and DefineStratumPolygon() (and in DefineSurvey(), which reads the includeintotal tag of the stratumpolygon process data). 
* A bug was corrected in SuperIndividuals() for trawl-acoustic models, where length measured individuals were counted over all beams, whereas per beam was correct. This caused under-estimation when different vessels had different Beam key, e.g. due to different transceiver number in the NMDEchosounder xml format.
* The parameters ValueColumn, NewValueColumn, VariableName, ConditionalVariableName and ConditionalValueColumn have been added to DefineTranslation(), to support full flexibility of column names in the resource file. Also added the parameter PreserveClass to Translate* functions, specifying whether to allow for the translation to change class of the data, e.g. form integer to string.
* Added tests comparing results to StoX 2.7 for Barents sea cod 2020, sandeel 2011 and SplitNASC Angola 2015.
* Added the function SplitNASC() using NASCData and AcousticPSU as input and returns a NASCData object, replacing SplitMeanNASC()
* Added "> " at the start of each element in the User log of the StoX GUI.
* Added support for hybrid StoX 2.7 and >= 3 projects, using the same project folder. 

## Detailed changes
* Added warning for when EffectiveTowDistance = 0 in Lengthdistribution() with LengthDistributionType = "Normalized".
* Added supprt for Biomass = 0 when Abundance = 0, regardless of IndividualRoundWeight = NA.
* Added CompensateEffectiveTowDistanceForFishingDepthCount() for NMDBiotic data with hauls made at several depths.
* Updated validation of project.json (using processDataSchema).
* Removed unwanted columns in the output from AcousticDensity(), inherirted from MeanNASCData.
* Added support for multiple beams in SplitNASC(), where the NASC is now distributed to the different species for each beam().
* StoX 3.2.0 removes empty PSUs.
* Added warning when adding a variable that already exists in AddToStoxBiotic(), particularly aimed at SpeciesCategory in ICESBiotic, which has a different meaning that SpeciesCategory in StoxBioticData.* Added the columns NumberOfAssignedHaulsWithCatch and NumberOfAssignedHauls to AsssignmentLengthDistributionData, used in AcousticDensity() to flag PSUs for which hauls with no length measured individuals of the target species are assigned.
* Added warning when ValueColumn, NewValueColumn or ConditionalValueColumn does not exist in the file in DefineTranslation().
* Reports using summaryStox now returns NA for missing values, instead of an error.
* Added the requirement jsonvalidate >= 1.3.2, as per changes in JSON definition.
* Refactored SplitNASC to support multiple EDSUs per PSU, and EDSUs outside of any statum.
* Changed Distance in ICESBiotic() to distance * 1852.
* Added support for two table output processes in Bootstrap, where only the table "Data" is used.
* Added support for mixed level function outputs, whereas only a list of tables or a list of lists of tables were preivously allowed. This fixed bug when a two table output process was included as output from Bootstrap.
* Fixed formatting of output from WriteICESBiotic() so that precision is kept and values are not padded with blanks and zeros. Fixed bug in writeXmlFile().

## Bug fixes
* Fixed bug when reading NMDBiotic 1.4 and 1.1, where variables with common name between tables (producttype, weight and volume) were not read properly, causing values from the Sample table to bleed into the Individual table, potentially affecting biomass estimates for projects using these old versions of the NMDBiotic format.
* Fixed a bug where PSUByTime was updated in DefineAcousticPSU() when UseProcessData = TRUE, as this destroys the information to be passed onto another process using DefineAcousticPSU() where the first process is used as input.
* In the filter expression builder dialogue removing all values resulted in an error in syntax. This has been fixed.
* Fixed bug where acoustic PSUs could be added even if the process using DefineAcousticPSU was not active.
* Fixed a bug with the button "Run next" in the GUI. If the active process is modified (change in parameters or changes in procecss data made in the map) then that process is run again, so that "Run next" actually means to run the next incomplete process.
* Also fixed a bug when "Install Rstox packages" from the GUI on Linux (was tryring to install binaries, but only source is available for Linux). 
* Fixed bug when using depth TargetStrengthMethod = "LengthAndDepthDependent" in DefineAcousticTargetStrength() which is used in AcousticDensity(), which caused the function to fail. Length and depth dependent target strength is now possible.
* Fixed bug in SplitNASC() so that NASC for a PSUs with all missing values in the AssignmentLengthDistributionData of a specific species are now left un-splitted.
* Fixed bug causing empty PSUByTime from DefineAcousticPSU when DefinitionMethod = "Manual".
* Fixed bug where only BioticAssignmentWeighting was available for selection in BootstrapMethodTable in Bootstrap() in the GUI, whereas only DefineBioticAssignment is correct. U
* Fixed bug in getProcessOutputFiles() where project paths containing special characters resulted in corrupt file paths, causing View output to crash.
* Fixed bug in the parameter formats of ImputeSuperIndividuals() when using SuperIndividualsData from another process using ImputeSuperIndividuals().
* Fixed error in links to documentation in RstoxData.
* Fixed bugs related to stratum names (using getStratumNames() consistently).
* Fixed bug where LengthDistribution() produced a line of NA in IndividualTotalLength for subsamples that were completely empty by the filter, thus resulting in a small percentage of the WeightedCount assigned to this NA length in the percent length distribution, and consequently reducing the WeightedCount of the valid lengths.
* Fixed bug when reading shapefiles or GeoJSON in DefineStratumPolygon(), by introducing the parameter StratumNameLabel in DefineStratumPolygon().
* Fixed bug with CompensationTable in GearDependentCatchCompensation().
* Fixed bug where TranslateStoxBiotic() and similar functions changed type of the data, so that translating numeric values did not work properly.


# StoX v3.1.16 (2021-12-22)

## General
* Added warning when Beam = NA for acoutstic-trawl models, which is an indication of incomplete acoustic sampling.
* Added warning when biotic hauls are assigned to non-existing acoustic PSUs.


# StoX v3.1.15 (2021-12-15)

## General
* Changed to sort strata by locale en_US_POSIX when bootstrapping.


# StoX v3.1.14 (2021-12-13)

## General
* Added escaping newline and tab when writing output tables to txt, in order to read back in.

## Detailed changes
* Avoided unwanted warnings when raising factor is missing for hauls with no fish.
* Improved documentation of ImputeSuperIndividuals().


# StoX v3.1.13 (2021-12-03)

## General
* Missing values (NA) are now preserved throughout StoX, so that e.g. an NA in LengthDistributionData (due to an error in the input data) will result in NA in the abundance estimate of the stratum containing that missing value, and further to an NA in an estimate of the whole survey. This is per the default behaivor of R, where the na.rm parameter has default value FALSE. The exception to this treatment of missing values is ReportBootstrap(), where a missing value is treated as 0 in order to take into acocunt the random fluctuations induced by the bootstrapping. The user may experience that StoX projects that produced valid results in the preivous StoX versions now result in NAs, requiring a diagnostics of the input data and settings of the StoX project. Consequently, this change may break backward reproducibility. See Detailed changes for details
* Added "> " at the start of each element in the User log of the StoX GUI.

## Detailed changes
* Changed how StoX treats missing values (NA) so that an NA will always propagate to the next step in the calculation (na.rm = FALSE). The only exception is missing values in bootstrap runs, which are treated as 0 to reflect the instances of e.g. a length group being left out in the data due to the random sampling of hauls, in which case the abundance of that length group is to be considered as 0. Previously, in MeanNASC(), MeanLengthDistribution() and MeanDensity(), where the mean is calculated as sum of the data divided by the sum of the weights (e.g. log distance or number of stations), missing values were ignored in the sums. In the new version missing values result in missing values in the mean. A consequence of preserving missing values can be that a missing value in a normalized LengthDistribution (e.g., due to missing sample weights) will propagate through to a missing value in the stratum, and ultimately to a missing value in the survey if summing over strata in a report. The problem must then be solved by either correcting what in the input data that is causing the missing values, or filter out those values (e.g. filter out erroneous or experimental hauls). For acoustic-trawl models there is an extra complication related to bootstrapping, since missing values here are treated as 0. I there are hauls assigned to an acoustic PSU that does not contain any length measured individuals of the target species, there is a positive probability that only these hauls are sampled in a bootstrap run, resulting in missing values in abundance of the stratum of that PSU. Treating this as 0 will lead to under-estimation. Only hauls length measured individuals of the target species should be used in the biotic assignment when bootstrapping is included in the StoX project.
* Added warning when ValueColumn, NewValueColumn or ConditionalValueColumn did not exist in the file in DefineTranslation().
* Added support for multiple beams in SplitNASC(), where the NASC is now distributed to the different species for each beam().
* Fixed bug in SplitNASC() so that NASC for a PSUs with all missing values in the AssignmentLengthDistributionData of a specific species are left un-splitted.
* Added removal of empty PSUs.
* Added the columns NumberOfAssignedHaulsWithCatch and NumberOfAssignedHauls to AsssignmentLengthDistributionData, used in AcousticDensity() to flag PSUs for which hauls with no length measured individuals of the target species are assigned.
* Removed unwanted columns in the output from AcousticDensity(), inherirted from MeanNASCData.
* Added support for Biomass = 0 when Abundance = 0, regardless of IndividualRoundWeight = NA.
* Fixed bug causing empty PSUByTime from DefineAcousticPSU when DefinitionMethod = "Manual".
* Added option of reading empty strings as NA in readModelData() to support output files from StoX <= 3.1.0. 
* Added support for hybrid StoX 2.7 and >= 3 projects, using the same project folder. 
* Fixed bug where only BioticAssignmentWeighting was available for selection in BootstrapMethodTable in Bootstrap() in the GUI, whereas only DefineBioticAssignment is correct. U
* Updated test projects to match changes in RstoxBase.


# StoX v3.1.12 (2021-11-22)

## General
* Added supprt for Biomass = 0 when Abundance = 0, regardless of IndividualRoundWeight = NA.
* Added parameters VariableName, ConditionalVariableName and ConditionalValueColumn to DefineTranslation(), to support full flexibility of column names in the resource file. Also added the parameter PreserveClass to Translate* functions, specifying whether to allow for the translation to change class of the data, e.g. form integer to string. Specified NAs in ICESBiotic() to the class defined by ICES.
* Added the requirement jsonvalidate >= 1.3.2, as per changes in JSON definition.

## Notes on backward compatability
* Reverted to ussing all = TRUE when merging AbnudanceData into Individuals in SuperIndividuals(), as using all.x = TRUE implies the risk of discarding a portion of the abundance.
* Reverted to the original createOrderKey() of StoX 3.1.0, used in setorderv_numeric() and further in RstoxBase::formatOutput(), in order to produce the same seeds in RstoxBase::ImputeSuperIndividuals().


# StoX v3.1.11 (2021-11-15)

## General
* Added tests comparing results to StoX 2.7 for Barents sea cod 2020, sandeel 2011 and SplitNASC Angola 2015.
* Fixed bug when reading NMDBiotic 1.4 and 1.1, where variables with common name between tables (producttype, weight and volume) were not read properly, causing values from the Sample table to bleed into the Individual table, potentially affecting biomass estimates for projects using these old versions of the NMDBiotic format.
* Changed error cacusing trouble in DistributeNASC() in splitOneAcousticCategory() to warning.

## Notes on backward compatability
* In DefineBioticAssignment() with DefinitionMethod "EllipsoidalDistance", the parameter BottomDepthDifference cannot yet be used when the acoustic data are read from NMDEchosounder files, due to this information being stored on each frequency, and a rule on how to extract this information for each Log, irrespective of frequency has not yet been defined. Also, the parameter Distance behaves differently in StoX >= 3 versus StoX 2.7. In StoX >= 3 distances are calculated along the great circle on a WGS84 ellipsoid (R function sp::spDists), whereas a spherical model was used in StoX 2.7.
* Using a combination of two fs.getLengthSampleCount, such as fs.getLengthSampleCount('Sardinella aurita') > 10 || fs.getLengthSampleCount('Sardinella maderensis') > 10, cannot be entirely reproduced in StoX >= 3. The option of using the following filter on the Sample table of StoxBiotic, with FilterUpwards = TRUE, removes the appropriate stations, but also removes the samples, which are left untouhced by the fs.getLengthSampleCount: SampleCount > 10 & SpeciesCategoryKey %in% "Sardinella aurita/161763/126422/NA") | (SampleCount > 10 & SpeciesCategoryKey %in% "Sardinella maderensis/161767/126423/NA". Instead the user can filter the specific stations which are left after the above filter expression.


# StoX v3.1.10 (2021-11-04)

## General
* Fixed bug in Install Rstox packages.


# StoX v3.1.9 (2021-11-04)

## General
* Added warning for when EffectiveTowDistance = 0 in Lengthdistribution() with LengthDistributionType = "Normalized".

## Detailed changes
* Refactored SplitNASC to support multiple EDSUs per PSU, and EDSUs outside of any statum.
* Updated validation of project.json (using processDataSchema).


# StoX v3.1.8 (2021-11-01)

## General
* Added the parameters ValueColumn and NewValueColumn to DefineTranslaion().
* Added CompensateEffectiveTowDistanceForFishingDepthCount() for NMDBiotic data with hauls made at several depths.
* Added the DefinitionMethod \"ResourceFile\" in DefineBioticPSU(), which enables reading BioiticPSU from a StoX 2.7 project.xml file.

## Detailed changes
* Added warning when adding a variable that already exists in AddToStoxBiotic(), particularly aimed at SpeciesCategory in ICESBiotic, which has a different meaning that SpeciesCategory in StoxBioticData.
* Fixed bug in getProcessOutputFiles() where project paths containing special characters resulted in corrupt file paths, causing View output to crash.
* In readProjectDescription(), StratumNameLabel is now set to "StratumName", in case the stratum polygon was added from shapefile or GeoJSON in StoX < 3.2.0.


# StoX v3.1.7 (2021-10-15)

## General
* Fixed bug in ReportBootstrap(), where all NAs were converted to 0.
* Changed SuperIndividuals() to not add rows from EDSUs with no assigned biotic hauls. Also, hauls that are discarded by the random sampling in a bootstrap run no longer result in a row of mostly NAs in SuperIndividualsData.

## Detailed changes
* Added support for two table output processes in Bootstrap, where only the table "Data" is used.
* Added support for mixed level function outputs, whereas only a list of tables or a list of lists of tables were preivously allowed. This fixed bug when a two table output process was included as output from Bootstrap.
* Fixed bug in the parameter formats of ImputeSuperIndividuals() when using SuperIndividualsData from another process using ImputeSuperIndividuals().
* Fixed error in links to documentation in RstoxData.


# StoX v3.1.6 (2021-10-05)

## General
* The unofficial version StoX 3.1.6 fixes a bug in SplitNASC(), and fixes erroneous links in the documentation shown in the lower right corner of the StoX GUI.


# StoX v3.1.5 (2021-09-28)

## General
* The unofficial version StoX 3.1.5 fixes a critical bug where PSUByTime was updated in DefineAcousticPSU() when UseProcessData = TRUE, as this destroys the information to be passed onto another process using DefineAcousticPSU() where the first process is used as input.
* In the filter expression builder dialogue removing all values resulted in an error in syntax. This has been fixed.
* Fixed bug where acoustic PSUs could be added even if the process using DefineAcousticPSU was not active.

## Detailed changes
* Fixed bugs related to stratum names (using getStratumNames() consistently).
* Changed warning to error when processes listed in OutputProcesses in Bootstrap().


# StoX v3.1.4 (2021-09-20)

## General
* The unofficial version StoX 3.1.4 fixes a bug with the button "Run next" in the GUI. If the active process is modified (change in parameters or changes in procecss data made in the map) then that process is run again, so that "Run next" actually means to run the next incomplete process.
* Also fixed a bug when "Install Rstox packages" from the GUI on Linux (was tryring to install binaries, but only source is available for Linux). 

## Detailed changes
* Fixed bug where LengthDistribution() produced a line of NA in IndividualTotalLength for subsamples that were completely empty by the filter, thus resulting in a small percentage of the WeightedCount assigned to this NA length in the percent length distribution, and consequently reducing the WeightedCount of the valid lengths.


# StoX v3.1.3 (2021-09-10)

## General
* The unofficial version StoX 3.1.3 includes several improvements regarding speed, specifically a significant speed up of the function DefineAcousticPSU() when DefinitionMethod is "EDSUToPSU", and the new option of simplifying stratum polygons by the new parameters SimplifyStratumPolygon and SimplificationFactor in DefineStratumPolygon(), which reduces time of opening and saving project where DefineStratumPolygon() reads complicated stratum polygons. Also, the function StoxBiotic has been sped up when individuals are generated from NumberAtLength of the Catch table of ICESBiotic xml files.
* The format of output text files with file extension "txt" has been changed to support equality when reading the files back into R with the function readModelData() of RstoxFramework. Before, all values were un-quoted, including strings. This had the consequence that strings consisting of numbers, such as IDs 1, 2, etc, were converted to numeric by readModelData(). All strings are now quoted to avoid this problem. Also, missing values were written as empty strings, but are now changed to NA.
* Added the function SplitNASC() intended to replace SplitMeanNASC(). SplitNASC() uses NASCData and AcousticPSU as input and generates one PSU per EDSU for splitting the NASC based on BioticAssignment, and then returns a NASCData object. Consequently one can skip the MeanNASC() function in the model. 
* Fixed bug when using depth TargetStrengthMethod = "LengthAndDepthDependent" in DefineAcousticTargetStrength() which is used in AcousticDensity(), which caused the function to fail. Length and depth dependent target strength is now possible.

## Detailed changes
* Fixed bug when reading shapefiles or GeoJSON in DefineStratumPolygon(), by introducing the parameter StratumNameLabel in DefineStratumPolygon().
* Changed from [0, Inf] to [min, max] of channel depth when DefinitionMethod "WaterColumn" in DefineLayer().


# StoX v3.1.2 (2021-09-07)

## General
* The unofficial version StoX 3.1.2 shifts focus to the User log in the GUI when an error or a warning occurs.
* Reports using summaryStox now returns NA for missing values, instead of an error.
* Added warnings when RemoveMissingValues or UseOutputData is TRUE.

## Rstox packages
* Added the function convertStoX2.7To3(), which can be used to convert a StoX 2.7 project to a StoX 3.1.2 project based on a template StoX 3.1.2 project.


# StoX v3.1.1 (2021-08-19)

## General
* The unofficial version StoX 3.1.1 includes methods for importing AcoustiPSU, BioticAssignment and StratumPolygon from a StoX 2.7 project description file (project.xml), through the DefinitionMethod "ResourceFile" in DefineAcoustiPSU(), DefineBioticAssignment() and DefineStratumPolygon() (and in DefineSurvey(), which reads the includeintotal tag of the stratumpolygon process data). 
* StoX 3.1.1 also corrects a bug in SuperIndividuals() where length measured individuals were counted over all beams, whereas per beam was correct. This caused under-estimation for acoustic estimates where different vessels have different Beam key, e.g. due to different transceiver number in the NMDEchosounder xml format.

## Detailed changes in Rstox packages
* Fixed bug with CompensationTable in GearDependentCatchCompensation().
* Fixed formatting of output from WriteICESBiotic() so that precision is kept and values are not padded with blanks and zeros. Fixed bug in writeXmlFile().
* Changed Distance in ICESBiotic() to distance * 1852.
* Fixed bug where TranslateStoxBiotic() and similar functions changed type of the data, so that translating numeric values did not work properly.


# StoX v3.1.0 (2021-06-18)

## General
* The new StoX 3.1.0 contains several improvements to the user experience, stability of the application and reliability of the outputs. In particular, installation of StoX and the required Rstox packages is now easier, and installers for Windows, MacOS and Linux have been moved to GitHub (https://github.com/StoXProject/StoX). Further, the reliability of the outputs from StoX is strengthened by automated tests prior to release, and processing speed has been increased by parallel bootstrapping. New functionality has been added to allow for translation of variables inside a StoX project, allowing for data from different reference systems to be used in the same StoX project.

## StoX GUI
* Improved Tools/Install Rstox packages with a loading wheel, information about which packages that have been installed, and more stable installation across platforms and R versions.
* Introduced Windows msi installer with certificate, MacOS dmg installer, and Linux deb and rpm installers.
* Moved installers and example StoX projects to https://github.com/StoXProject/StoX and https://github.com/StoXProject/StoXExamples.
* Introduced loading wheel in parameter editors such as filter expression builder.
* Applied synchronization when opening a StoX project to avoid conflicting operations.
* Allowing running different versions of StoX, but on different minor R versions (two-digit versions such as R 4.1 and R 4.0).
* Fixed encoding problems.
* Fixed bug where StoX fails with R 4.1.
* A number of smaller bug fixes and improvements.

## Rstox packages
* Added parallel bootstrapping.
* Added automatic testing of several full projects reducing the risk of bus affecting outputs from StoX.
* Changed name of output text files to not contain the process name.
* Fixed bug in DistributionMethod == "HaulDensity", where number of individuals in each length group was not taken into account, leading to a different distribution method than that implemented in StoX 2.7, where individuals in hauls with fewer individuals for a length group were assigned a lower abundance.
* Solved bug where estimates were reduced when including several Beams in acoustic-trawl models.
* Increased flexibility in ImputeSuperIndividuals() in terms of what to impute.
* Applied platform independent sorting using the "en_US_POSIX"-locale.
* Renamed ReportICESAcoustic(), ReportICESBiotic() and ReportICESDatras() to WriteICESAcoustic(), WriteICESBiotic() and WriteICESDatras(), respectively.
* Added TranslateICESAcoustic() and TranslateICESBiotic().
* Added option of a conditional variable in DefineTranslation() and Translate*().
* Enabled reading zipped input xml file.
* Added stop if not all EDSUs are inside a stratum in SplitMeanNASC()
* Fixed bug where stations with 0 fish were removed in LenghtDistribution().
* Removed hard coded conversions in ICESBiotic(), moving the responsibility of such conversions to the translation functions.

## Detailed changes in Rstox packages
* Added BaselineSeedTable in Bootstrap().
* Reintroduced possible values in filter for all-unique variables such as Station and EDSU. Allowing drop down list of only one * unique element.
* project.json now uses ISO8601 for time.
* Fixed column order for datatypes *IndividualsData.
* Fixed bug in StoxBiotic(), where date and time were borrowed from Station to Haul, which could crash due to missing values in StationKey.
* Fixed bug in StoxAcoustic() for ICESAcoustic data, where log-distances with no acoustic records were deleted.
* Added sanitizeFilter() to avoid system calls in filter.
* Fixed time format of StoxAcoustic().
* Changed to keep original FishID and add sequetial integers for individuals regenerated from Catch continuing from the maximum FishID.
* Added documentation of the StoxBiotic format.
* Fixed bug in LengthResolution for ICESBiotic where only the first value was used.
* Fixed bug when converting length for ICESBiotic, where values were multiplied by 100 instead of 10 from mm to cm.
* Changed TowDistance to nautical miles.
* Added ChannelDepthUpper-ChannelDepthLower as Channel in StoxAcousic(). 
* Fixed bug in filterData, where propagateUpwards = TRUE did not remove rows of the higher tables if these rows were not present in the filtered table.


# StoX v3.0.0 (2021-02-12)
* First official release of the new generation of StoX.
