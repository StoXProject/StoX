# StoX v3.5.1 (2022-11-16)

## Summary
* StoX 3.5.1 contains several improvements to the graphical user interface (GUI):
- The right click option "View output" on the process name has been renamed to "Preview", and correspondingly, the Output window has been renamed to "Preview".
- The Preview window now contains the options "Close others" and "Close all" in addition to "Close" on the tab name.
- The right click option "Show in folder" has been added on the process name, opening the folder holding the output files of the process in the file explorer (Finder on Mac). This feature is also added to the project name in the Projects window.
- When a statum is selected in the Stratum/PSU window it is now marked with darker grey color in the map. This currently only applies to AcousticPSU processes.
- The Distance table has been completed, and can now be used to select EDSUs for an AcousticPSU processes.
- The User log no longer resets when opening a different project. Instead the right click option "Clear log" has been added.
- Added scroll bar in the process parameter window.
- Changed colors to red for processing error and orange for function input error. 
- The GUI now disables process parameter view, open/new project, and R connection and Install Rstox packages, when running a process.
- The full path to the project is now shown as tooltip on the project name in the Projects window.
- Origin for the map projection can now be set by right click in the map. 
- Added an info box when the preivously opened project opens when opening StoX. 
- When clicking "Yes" in Install Rstox packages the "Yes" button is now disabled, blocking a second installation.
- Light blue background has been added to all active window and tab names, as well as the active process.
- The GUI now shows RstoxFramework without version in the upper right corner, with red if any of the packages RstoxFramework, RstoxBase or RstoxData is not the certified version of the StoX release. 
- Processes with enabled = FALSE is now marked with grey process symbol.
- Added progress spinner on R connection and Preview.
- Expand buttons in the process parameter window have changed logic to the natural logic (arrow down means open the list, arrow right means close the list).
- Add PSU now activates only on AcousticPSU procecsses.
- The GUI now stops immediately before a process with function input error, bu jumps over processes which are not enabled.
* Added a line "... truncated" if a table in Preview does not contain all rows (the GUI shows at most 200000 rows).
* StoX now deletes output files when a parameter of tha procecss is changed.
* Removed all non-official Rstox-package versions from the StoX repository (https://github.com/StoXProject/repo). This implies that non-official StoX versions can no longer use Install Rstox packages. The user must instetad install the appropriate Rstox packages in R.

## Changes affecting backward compatibility
* Changed behavior of DefinitionMethod "WaterColumn" so that even data with missing depth information will have Layer = "WaterColumn". Before, if MinHaulDepth, MaxHaulDepth, MinChannelDepth or MaxHChannelDepth was missing, Layer would also be missing. This change will result in more individuals in IndividualsData, as the line hauls tagged to PSUs with NA Layer are removed when QuantityType == "SweptArea" in Individuals(). Also, changed the MinLayerDepth and MaxLayerDepth from the range of the depths (set to 0 and Inf if min depth and max depth was misssing) to (0, NA), saying that "WaterColumn" means from surface to an unknown bottom, or at least not defined by a single value.

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
* Added error if variables specified in Regression in ImputeSuperIndividuals() are not present in the data (preivously this was only a warning).
* Added error if a LayerTable specified by the user contains missing values.
* Added a warning if the variables selected using GroupingVariables and RegressionModel have changed in DefineRegression(), making the RegressionTable not work properly in the current version of the GUI.
* Removed error when there are Individuals with IndividualTotalLength smaller than the smallest IndividualTotalLength in the QuantityData in SuperIndividuals(). This was changed to warnings when IndividualTotalLength does not fit into any of the length intervals of the QuantityData.
* Added warning when there are AcousticCategory present in the NASCData but not in the SpeciesLink in AcousticDensity.
* Added warning when ch_type P is missing or represent less sa than B.
* Improved warnings in StoxBiotic() when missing values are generated for different producttype etc.
* Added warning for duplicated station in NMDBiotic, which leads to more than one Haul per Station. This is not supported when assigning Hauls in the map, where all Hauls of a Station are selected. Filtering out Hauls can be a solution.

## Detailed changes
* Added variable selection dialogue for GroupingVariables in DefineRegression() (typing, as there is no list of possible values).
* Disalowed empty string stratum name from the GUI.
* Cleaned up JSON validation test files to enhance the expected error.


# StoX v3.5.0 (2022-08-15)

## Summary
* The new StoX 3.5.0 adds support for R 4.2, which could not be used with StoX 3.4.0, improves warning messages and remmoves some uneccessary messages, adds the option of a simple longitude-latitude (Equirectangular) projection in the GUI as well as selecting origin of the Lambert Azimuthal Equal Area projection by right-clicking, and includes several bug fixes and changes that improve stability. A forecd change in stratum area calcuclation may change the output of the StratumArea function slightly. See below for details. 

## General changes
* Added R 4.2. as supported version.
* Changed projections in the map to only the "Lambert Azimuthal Equal Area Projection" and the "Equirectangular Projection". The origin can be set in the former by right-clicking in the map. StoX will remember the last used projection, origin and zoom when booting. Some challenges remain, specifically that the sea turns into the same colour as land for specific origns, and that some grid lines jump out of position.
* The GUI now supports empty fields in parameter tables, which are treated as missing value (NA). This is now the preferred way to denote NAs!
* Added DependentResolutionVariable and IndependentResolutionVariable in the RegressionTable of DefineRegression() and as parameters in EstimateBioticRegression(), used for adding half the resolution of e.g. length intervals.
* Added warning occurring when there are samples with positive SampleNumber but no individuals, in which case Abundance will be set to NA in the SuperIndividuals function.
* Replaced all use of functions from the packages rgdal and rgeos by the package sf, as per the planned retirement of these packages. See https://www.r-bloggers.com/2022/04/r-spatial-evolution-retirement-of-rgdal-rgeos-and-maptools/. 
* Changed time stamp server to sectigo
* Removed hard coded values for the following variables on ICESDatras() (variable name -> new value): 
	
	+ Table HH:
	*Country -> nation
	*Ship -> platformname
	*SweepLngt -> NA
	*GearEx -> NA
	*DayNight -> NA
	*StatRec -> area + location (concatenation)
	*HaulVal -> NA
	*Distance -> distance (in meters)
	*GroundSpeed -> vesselspeed

	+ Table HL:
	*SpecVal -> NA
	*LenMeasType -> lengthmeasurement
	
	+ Table CA:
	*Maturity -> NA
	*MaturityScale -> NA
	*AgeSource -> agingstructure
	*OtGrading -> readability (only if agingstructure is 2)
	*PlusGr -> NA

* Removed hard coded values for the following variables on ICESBiotic(): 
	*Platform -> platformname
	*Validity -> NA
	*StatisticalRectangle -> area + location

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
* Changed projections in the map to only the "Lambert Azimuthal Equal Area Projection" and the "Equirectangular Projection". The origin can be set in the former by right-clicking in the map. StoX will remember the last used projection, origin and zoom when booting. Some challenges remain, specifically that the sea turns into the same colour as land for specific origns, and that some grid lines jump out of position.
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
* Added more map projections, and extended the grid on the map.
* Removed hard coded values for the following variables on ICESDatras() (variable name -> new value): 
	
	+ Table HH:
	*Country -> nation
	*Ship -> platformname
	*SweepLngt -> NA
	*GearEx -> NA
	*DayNight -> NA
	*StatRec -> area + location (concatenation)
	*HaulVal -> NA
	*Distance -> distance (in meters)
	*GroundSpeed -> vesselspeed

	+ Table HL:
	*SpecVal -> NA
	*LenMeasType -> lengthmeasurement
	
	+ Table CA:
	*Maturity -> NA
	*MaturityScale -> NA
	*AgeSource -> agingstructure
	*OtGrading -> readability (only if agingstructure is 2)
	*PlusGr -> NA

* Removed hard coded values for the following variables on ICESBiotic(): 
	*Platform -> platformname
	*Validity -> NA
	*StatisticalRectangle -> area + location

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
* Fixed bug when working with a DefineStratumPolygon procecss with no polygons defined (readProcessOutputFile() did nor read deal properly with the empty SpatialPolygonsDataFrame with jsonlite::prettify(geojsonsf::sf_geojson(sf::st_as_sf(data))), but ok when using replaceSpatialFileReference(buildSpatialFileReferenceString(data)) instead).
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
* Added error when weigths do not sum to 1 in SuperIndividuals, with a not indicating that this may be due to different input LengthDistributionData compared to that used to  derive the input QuantityData.

# StoX v3.3.8 (2022-03-24)

## Bug fixes
* Fixed critical bug in acoustic-trawl projects for SuperIndividuals when DistributionMethod = "HaulDensity" and Hauls are assigned to PSUs in more than one stratum, which led to under-estimation, as the number of individuals to distribute the Abundance to was counted over all strata per Haul ID, whereas only inside the stratum was correct.

# StoX v3.3.7 (2022-03-22)

## General
* Added the parameter AddToLowestTable in AddToStoxBiotic(), which can be used for adding variables from tables in NMDBiotic or ICESBiotic that are split into two tables in StoxBiotic (fishstation and catchsample in NMDBiotic and Haul and Catch in ICESBiotic). When these tables are split into two tables StoX decides which variable should be placed in each table. E.g., geographical position is placed in the Station table of StoxBiotic, which implies that only the first position of several hauls that comprise one Station is kept. If one needs all positions, AddToLowestTable can be set to TRUE so that the positions are placed in the Haul table instead of the Station table of StoxBiotic.

## Bug fixes
* Fixed bug in possible values for speciesLinkTable in  SplitNASC().
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
* Fixed bug when working with a DefineStratumPolygon procecss with no polygons defined (readProcessOutputFile() did nor read deal properly with the empty SpatialPolygonsDataFrame with jsonlite::prettify(geojsonsf::sf_geojson(sf::st_as_sf(data))), but ok when using replaceSpatialFileReference(buildSpatialFileReferenceString(data)) instead).


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

    + In StoxBiotic():
	*SampleCount -> SampleNumber*
	*CatchFractionCount -> CatchFractionNumber*
	**This could affect external scripts that use the StoxBioticData.**
	
    + In LengthDistribution(), SumLengthDistribution(), MeanLengthDistribution(), AssignmentLengthDistribution(), RegroupLengthDistribution(), GearDependentCatchCompensation(), LengthDependentCatchCompensation(), RelativeLengthDistribution():
	*Renamed the column WeightedCount to WeightedNumber*
    **This could affect external scripts that use one of the listed datatypes as WeightedCount is no longer found. Other than that the WeightedCount does not exist further in the estimation models in StoX.**

    + In BioticAssignmentWeighting():
	*WeightingMethod = "NormalizedTotalCount"    -> "NormalizedTotalNumber"*
	*WeightingMethod = "SumWeightedCount"        -> "SumWeightedNumber"*
	*WeightingMethod = "InverseSumWeightedCount" -> "InverseSumWeightedNumber"*
	**Backward compatibility should take care of these**

    + LengthDistribution():
	*RaisingFactorPriority = "Count" -> "Number"*
    **Backward compatibility should take care of these**
* Changed SpeciesCategoryCatch() to return a single table similar to LengthDistributionData, but with TotalCatchWeight and TotalCatchCount instead of WeightedCount. As such, moved the CatchVariable of SpeciesCategoryCatch() to the ReportVariable of ReportSpeciesCategoryCatch(). The latter is a backward compatibility breaking change. Any existing StoX project using SpeciesCategoryCatch() and ReportSpeciesCategoryCatch() will break in ReportSpeciesCategoryCatch(), and the ReportVariable needs to be set to the appropriate value in order to continue.

## General changes
* Added DefineRegression(), EstimateBioticRegression() and the implementation in ImputeSuperIndividuals(). Refactored so that DefineRegression() and DefineAcousticTargetStrength() both use the underlying DefineModel(), with outputs <Model>Model and <Model>Table. Renamed DefinitionMethod "TargetStrengthTable", "SurveyTable" and "LayerTable" to "Table".
* Added the function ReportAbundance().
* Changed SpeciesCategoryCatch() to return a single table similar to LengthDistributionData, but with TotalCatchWeight and TotalCatchCount instead of WeightedCount. As such, moved the CatchVariable of SpeciesCategoryCatch() to the ReportVariable of ReportSpeciesCategoryCatch(). The latter is a backward compatibility breaking change. Any existing StoX project using SpeciesCategoryCatch() and ReportSpeciesCategoryCatch() will break in ReportSpeciesCategoryCatch(), and the ReportVariable needs to be set to the appropriate value in order to continue.
* Added SumSpeciesCategoryCatch() and MeanSpeciesCategoryCatch().
* Added the parameter SweptAreaDensityType in SweptAreaDensity() supporting both "LengthDistributed" and "TotalCatch" swept-area density. 
* Added new column DensityType in DensityData with supported values "AreaNumberDensity" (the only option for AcousticDensity() and  SweptAreaDensityType "LengthDistributed") and  "AreaMassDensity".

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

    + In StoxBiotic():
	*SampleCount -> SampleNumber*
	*CatchFractionCount -> CatchFractionNumber*
	**This could affect external scripts that use the StoxBioticData.**
	
    + In LengthDistribution(), SumLengthDistribution(), MeanLengthDistribution(), AssignmentLengthDistribution(), RegroupLengthDistribution(), GearDependentCatchCompensation(), LengthDependentCatchCompensation(), RelativeLengthDistribution():
	*Renamed the column WeightedCount to WeightedNumber*
    **This could affect external scripts that use one of the listed datatypes as WeightedCount is no longer found. Other than that the WeightedCount does not exist further in the estimation models in StoX.**

    + In BioticAssignmentWeighting():
	*WeightingMethod = "NormalizedTotalCount"    -> "NormalizedTotalNumber"*
	*WeightingMethod = "SumWeightedCount"        -> "SumWeightedNumber"*
	*WeightingMethod = "InverseSumWeightedCount" -> "InverseSumWeightedNumber"*
	**Backward compatibility should take care of these**

    + LengthDistribution():
	*RaisingFactorPriority = "Count" -> "Number"*
    **Backward compatibility should take care of these**
* Added the function ReportAbundance.

## Detailed changes
* Added the parameter InformationVariables to reports.
* Hiding the parameters VariableName and ConditionalVariableName when DefinitionMethod = "Table" in Translation()


# StoX v3.2.2 (2022-01-10)

## General
* Changed SpeciesCategoryCatch() to return a single table similar to LengthDistributionData, but with TotalCatchWeight and TotalCatchCount instead of WeightedCount. As such, moved the CatchVariable of SpeciesCategoryCatch() to the ReportVariable of ReportSpeciesCategoryCatch(). The latter is a backward compatibility breaking change. Any existing StoX project using SpeciesCategoryCatch() and ReportSpeciesCategoryCatch() will break in ReportSpeciesCategoryCatch(), and the ReportVariable needs to be set to the appropriate value in order to continue.
* Added SumSpeciesCategoryCatch() and MeanSpeciesCategoryCatch().
* Added the parameter SweptAreaDensityType in SweptAreaDensity() supporting both "LengthDistributed" and "TotalCatch" swept-area density. 
* Added new column DensityType in DensityData with supported values "AreaNumberDensity" (the only option for AcousticDensity() and  SweptAreaDensityType "LengthDistributed") and  "AreaMassDensity".
* Added new column AbundanceType in AbundanceData with supported values "Number" (the only option for AcousticDensity() and  SweptAreaDensityType "LengthDistributed") and "Mass".

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
* Added stop if not all EDSUs are inside a stratum in SplitMeanNASC()Fixed bug where stations with 0 fish were removed in LenghtDistribution().
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
