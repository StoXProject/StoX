# Stox v3.2.0 (2021-09-07)

## General
* The new StoX 3.2.0 includes methods for importing AcoustiPSU, BioticAssignment and StratumPolygon from a StoX 2.7 project description file (project.xml), through the DefinitionMethod "ResourceFile" in DefineAcoustiPSU, DefineBioticAssignment and DefineStratumPolygon (and in DefineSurvey, which reads the includeintotal tag of the stratumpolygon process data).
* StoX 3.2.0 also corrects a bug in SuperIndividuals() where length measured individuals were counted over all beams, whereas per beam was correct. This caused under-estimation for acoustic estimates where different vessels have different Beam key, e.g. due to different transceiver number in the NMDEchosounder xml format.
* In addition the GUI shifts focus to the User log in the GUI when an error or a warning occurs. Warnings are introduced when RemoveMissingValues or UseOutputData is TRUE.

## Rstox packages
* Added the function convertStoX2.7To3(), which can be used to convert a StoX 2.7 project to a StoX 3.1.2 project based on a template StoX 3.1.2 project.
* Reports using summaryStox now returns NA for missing values, instead of an error.

## Detailed changes in Rstox packages
* Fixed bug with CompensationTable in GearDependentCatchCompensation.
* Fixed formatting of output from WriteICESBiotic() so that precision is kept and values are not padded with blanks and zeros. Fixed bug in writeXmlFile().
* Changed Distance in ICESBiotic() to distance * 1852.
* Fixed bug where TranslateStoxBiotic() and similar functions changed type of the data, so that translating numeric values did not work properly.


# Stox v3.1.5 (2021-09-28)

## General
* The unofficial version StoX 3.1.5 fixes a critical bug where PSUByTime was updated in DefineAcousticPSU() when UseProcessData = TRUE, as this destroys the information to be passed onto another process using DefineAcousticPSU() where the first process is used as input.
* In the filter expression builder dialogue removing all values resulted in an error in syntax. This has been fixed.
* Fixed bug where acoustic PSUs could be added even if the procecss using DefineAcousticPSU was not active.

## Detailed changes
* Fixed bugs related to stratum names (using getStratumNames() consistently).
* Changed warning to error when processes listed in OutputProcesses in Bootstrap().


# Stox v3.1.4 (2021-09-20)

## General
* The unofficial version StoX 3.1.4 fixes a bug with the button "Run next" in the GUI. If the active process is modified (change in parameters or changes in procecss data made in the map) then that process is run again, so that "Run next" actually means to run the next incomplete process.
* Also fixed a bug when "Install Rstox packages" from the GUI on Linux (was tryring to install binaries, but only source is available for Linux). 

## Detailed changes
* Fixed bug where LengthDistribution produced a line of NA in IndividualTotalLength for subsamples that were completely empty by the filter, thus resulting in a small percentage of the WeightedCount assigned to this NA length in the percent length distribution, and consequently reducinng the WeightedCount of the valid lengths.


# Stox v3.1.3 (2021-09-10)

## General
* The unofficial version StoX 3.1.3 includes several improvements regarding speed, specifically a significant speed up of the function DefineAcousticPSU() when DefinitionMethod is "EDSUToPSU", and the new option of simplifying stratum polygons by the new parameters SimplifyStratumPolygon and SimplificationFactor in DefineStratumPolygon(), which reduces time of opening and saving project where DefineStratumPolygon() reads complicated straum polygons. Also, the function StoxBiotic has been sped up when individuals are generated from NumberAtLength of the Catch table of ICESBiotic xml files.
* The format of output text files with file extension "txt" has been changed to support equallity when reading the files back into R with the function readModelData() of RstoxFramework. Before, all values were un-quoted, including strings. This had the consequence that strings consisting of numbers, such as IDs 1, 2, etc, were converted to numeric by readModelData(). All strings are now quoted to avoid this problem. Also, missing values were written as empty strings, but are now changed to NA.
* Added the function SplitNASC() intended to replace SplitMeanNASC(). SplitNASC() uses NASCData and AcousticPSU as input and generates one PSU per EDSU for splitting the NASC based on BioticAssignment, and then returns a NASCData object. Consequently one can skip the MeanNASC() function in the model. 
* Fixed bug when using depth TargetStrengthMethod = "LengthAndDepthDependent" in DefineAcousticTargetStrength() which is used in AcousticDensity(), which caused the function to fail. Length and depth dependent target strength is now possible.

## Detailed changes
* Fixed bug when reading shapefiles or GeoJSON in DefineStratumPolygon(), by introducing the parameter StratumNameLabel in DefineStratumPolygon().
* Changed from [0, Inf] to [min, max] of channel depth when DefinitionMethod "WaterColumn" in DefineLayer().


# Stox v3.1.2 (2021-09-07)

## General
* The unofficial version StoX 3.1.2 shifts focus to the User log in the GUI when an error or a warning occurs.
* Reports using summaryStox now returns NA for missing values, instead of an error.
* Added warnings when RemoveMissingValues or UseOutputData is TRUE.

## Rstox packages
* Added the function convertStoX2.7To3(), which can be used to convert a StoX 2.7 project to a StoX 3.1.2 project based on a template StoX 3.1.2 project.


# Stox v3.1.1 (2021-08-19)

## General
* The unofficial version StoX 3.1.1 includes methods for importing AcoustiPSU, BioticAssignment and StratumPolygon from a StoX 2.7 project description file (project.xml), through the DefinitionMethod "ResourceFile" in DefineAcoustiPSU, DefineBioticAssignment and DefineStratumPolygon (and in DefineSurvey, which reads the includeintotal tag of the stratumpolygon process data). 
* StoX 3.1.1 also corrects a bug in SuperIndividuals() where length measured individuals were counted over all beams, whereas per beam was correct. This caused under-estimation for acoustic estimates where different vessels have different Beam key, e.g. due to different transceiver number in the NMDEchosounder xml format.

## Detailed changes in Rstox packages
* Fixed bug with CompensationTable in GearDependentCatchCompensation.
* Fixed formatting of output from WriteICESBiotic() so that precision is kept and values are not padded with blanks and zeros. Fixed bug in writeXmlFile().
* Changed Distance in ICESBiotic() to distance * 1852.
* Fixed bug where TranslateStoxBiotic() and similar functions changed type of the data, so that translating numeric values did not work properly.


# Stox v3.1.0 (2021-06-18)

## General
* The new StoX 3.1.0 contains several improvements to the user experience, stability of the application and reliability of the outputs. In particular, installation of StoX and the required Rstox packages is now easier, and installers for Windows, MacOS and Linux have been moved to GitHub (https://github.com/StoXProject/StoX). Further, the reliability of the outputs from StoX is strengthened by automated tests prior to release, and processing speed has been increased by parallel bootstrapping. New functionality has been added to allow for translation of variables inside a StoX project, allowing for data from different reference systems to be used in the same StoX project.

## StoX GUI
* Improved Tools/Install Rstox packages with a loading wheel, information about which packages that have been installed, and more stable installation across plaforms and R versions.
* Introduced Windows msi installer with certificate, MacOS dmg installer, and Linux deb and rpm installers.
* Moved installers and example StoX projects to https://github.com/StoXProject/StoX and https://github.com/StoXProject/StoXExamples.
* Introduced loading wheel in parameter editors such as filter expression builder.
* Applied synchronization when opening a StoX project to avoid conflicting operations.
* Allowing running different versions of StoX, but on different minor R versions (two digit versions such as R 4.1 and R 4.0).
* Fixed encoding problems.
* Fixed bug where StoX fails with R 4.1.
* A number of smaller bug fixes and improvements.

## Rstox packages
* Added parallel bootstrapping.
* Added automatic testing of several full projects reducing the risk of bus affecting outputs from StoX.
* Changed name of output text files to not contain the process name.
* Fixed bug in DistributionMethod == "HaulDensity", where number of individuals in each length group was not taken into account, leading to a different distrribution method than that implemented in StoX 2.7, where individuals in hauls with fewer individuals for a length group were assigned a lower abundance.
* Solved bug where estimates were reduced when including several Beams in acoustic-trawl models.
* Increased flexiblity in ImputeSuperIndividuals() in terms of what to impute.
* Applied platform independent sorting using the "en_US_POSIX"-locale.
* Renamed ReportICESAcoustic(), ReportICESBiotic() and ReportICESDatras() to WriteICESAcoustic(), WriteICESBiotic() and WriteICESDatras(), respectievly.
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
* Fixed bug in StoxAcoustic for ICESAcoustic data, where log-distances with no acoustic records were deleted.
* Added sanitizeFilter() to avoid system calls in filter.
* Fixed time format of StoxAcoustic().
* Changed to keep original FishID and add sequetial integers for individuals regenerated from Catch continuing from the maximum FishID.
* Added documentation of the StoxBiotic format.
* Fixed bug in LengthResolution for ICESBiotic where only the first value was used.
* Fixed bug when converting length for ICESBiotic, where values were multiplied by 100 instead of 10 from mm to cm.
* Changed TowDistance to nautical miles.
* Added ChannelDepthUpper-ChannelDepthLower as Channel in StoxAcousic. 
* Fixed bug in filterData, where propagateUpwards = TRUE did not remove rows of the higher tables if these rows were not present in the filtered table.


# Stox v3.0.0 (2021-02-12)
* First officcial release of the new generation of StoX.
