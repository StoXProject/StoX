# StoX v3.2.0 (2021-10-06)

## General
* The new StoX 3.2.0 includes improvements to speed, user experience and adds the possibility to build a new StoX project based on process data of an old StoX project created in StoX 2.7.

## Detailed changes
* Methods for importing AcoustiPSU, BioticAssignment and StratumPolygon from a StoX 2.7 project description file (project.xml), through the DefinitionMethod "ResourceFile" in DefineAcoustiPSU(), DefineBioticAssignment() and DefineStratumPolygon() (and in DefineSurvey(), which reads the includeintotal tag of the stratumpolygon process data).
* The GUI shifts focus to the User log in the GUI when an error or a warning occurs. Warnings are introduced when RemoveMissingValues or UseOutputData is TRUE.
* Improvements regarding speed, specifically a significant speed up of the function DefineAcousticPSU() when DefinitionMethod is "EDSUToPSU", and the new option of simplifying stratum polygons by the new parameters SimplifyStratumPolygon and SimplificationFactor in DefineStratumPolygon(), which reduces time of opening and saving project where DefineStratumPolygon() reads complicated stratum polygons. Also, the function StoxBiotic has been sped up when individuals are generated from NumberAtLength of the Catch table of ICESBiotic xml files.
* The format of output text files with file extension "txt" has been changed to support equality when reading the files back into R with the function readModelData() of RstoxFramework. Before, all values were un-quoted, including strings. This had the consequence that strings consisting of numbers, such as IDs 1, 2, etc, were converted to numeric by readModelData(). All strings are now quoted to avoid this problem. Also, missing values were written as empty strings, but are now changed to NA.
* Added the function SplitNASC() intended to replace SplitMeanNASC(). SplitNASC() uses NASCData and AcousticPSU as input and generates one PSU per EDSU for splitting the NASC based on BioticAssignment, and then returns a NASCData object. Consequently one can skip the MeanNASC() function in the model. 
* Reports using summaryStox now returns NA for missing values, instead of an error.
* Added warnings when RemoveMissingValues or UseOutputData is TRUE.

## Bug fixes
* Fixed a bug in SuperIndividuals() where length measured individuals were counted over all beams, whereas per beam was correct. This caused under-estimation for acoustic estimates where different vessels have different Beam key, e.g. due to different transceiver number in the NMDEchosounder xml format.
* Fixed bug where LengthDistribution() produced a line of NA in IndividualTotalLength for subsamples that were completely empty by the filter, thus resulting in a small percentage of the WeightedCount assigned to this NA length in the percent length distribution, and consequently reducing the WeightedCount of the valid lengths.
* Fixed bug when using depth TargetStrengthMethod = "LengthAndDepthDependent" in DefineAcousticTargetStrength() which is used in AcousticDensity(), which caused the function to fail. Length and depth dependent target strength is now possible.
* Fixed a bug with the button "Run next" in the GUI. If the active process is modified (change in parameters or changes in process data made in the map) then that process is run again, so that "Run next" actually means to run the next incomplete process.
* "Install Rstox packages" from the GUI on Linux was trying to install binaries, but only source is available for Linux. 
* Fixed a critical bug where PSUByTime was updated in DefineAcousticPSU() when UseProcessData = TRUE, as this destroys the information to be passed onto another process using DefineAcousticPSU() where the first process is used as input.
* In the filter expression builder dialogue removing all values resulted in an error in syntax. This has been fixed.
* Fixed bug where acoustic PSUs could be added even if the process using DefineAcousticPSU() was not active.
* Fixed bug when reading shapefiles or GeoJSON in DefineStratumPolygon(), by introducing the parameter StratumNameLabel in DefineStratumPolygon().

## Rstox packages
* Added the function convertStoX2.7To3(), which can be used to convert a StoX 2.7 project to a StoX 3.1.2 project based on a template StoX 3.1.2 project.
* Reports using summaryStox now returns NA for missing values, instead of an error.
* Changed from [0, Inf] to [min, max] of channel depth when DefinitionMethod "WaterColumn" in DefineLayer().

## Detailed changes in Rstox packages
* Fixed bug with CompensationTable in GearDependentCatchCompensation.
* Fixed formatting of output from WriteICESBiotic() so that precision is kept and values are not padded with blanks and zeros. Fixed bug in writeXmlFile().
* Changed Distance in ICESBiotic() to distance * 1852.
* Fixed bug where TranslateStoxBiotic() and similar functions changed type of the data, so that translating numeric values did not work properly.
* Fixed bugs related to stratum names (using getStratumNames() consistently).
* Changed warning to error when non-existing processes listed in OutputProcesses in Bootstrap().


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
