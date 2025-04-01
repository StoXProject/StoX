# StoX

## Introduction

StoX is an open source software developed at IMR, Norway, to analyze survey data and calculate survey estimates from acoustic and swept area surveys. The program is a stand-alone application for easy sharing and further development in cooperation with other institutes. 

“StoX is designed as a tool for transparent and reproducible survey estimation across nations and survey objectives. All methods, user settings and links to input data are documented in a description file. A process is a user‐defined call to one function available in a library of functions defined by StoX. Any StoX model can be modified by changing parameters of the processes, adding or removing processes and by rearranging their order of execution. Different StoX functions require one or more input datasets, which can be data files or output from previously executed processes.” [Johnsen, E., Totland, A., Skålevik, Å., Holmin, A. J., Dingsør, G. E., Fuglebakk, E., & Handegard, N. O. (2019). StoX: An open source software for marine survey analyses. Methods in Ecology and Evolution, 10(9), 1523-1528.](https://doi.org/10.1111/2041-210X.13250)

## Installation

The following describes installation of the latest *official* StoX version (Se [all official StoX versions](https://github.com/StoXProject/StoX/blob/master/Official_StoX_versions.md)). For unofficial versions installation of the Rstox-packages must be done in R (details given at the end of this paragraph). It is highly recommended to use official versions, as these are fully tested, whereas tetsting is limited for unofficial versions.

See [release notes for StoX 4.1.3](https://github.com/StoXProject/StoX/blob/master/NEWS.md#stox-v413-2025-04-01).

Download StoX from (https://github.com/StoXProject/StoX/releases/tag/v4.1.3). For Windows download the .msi file, for MacOS download the .dmg file and for Linux download the .rpm or .deb file. Then follow the instructions below:

### Windows:

Step 1: 
Install by double-clicking on the downloaded .msi file, and follow the instructions. If you get a message along the lines that the installer is blocked by the system, you can click on "More info" and select "Run anyway".

Step 2: 
Install R 4.0.0 or newer if not already installed. It is recommended to use the latest version of R. 

Step 3: 
Click on "Tools" > "R connection" in the menu to define the path to R (for example C:\Program Files\R\R-4.0.3\bin\x64).

Step 4: 
Click on "Tools" > "Install Rstox packages" in the menu. This will install the required R packages. After installing, the StoX and RstoxFramework version numbers shown in the upper right corner should be in black color. If any of these are in red color you are using an unofficial StoX release. It is recommended to close Rstudio and any other R applications before running Install Rstox packages. 

Step 5: 
StoX is now ready for use.

### MacOS:

Step 1: 
Install by double-clicking on the downloaded .dmg file, and follow the instructions.

Step 2: 
Install R 4.0.0 or newer if not already installed. It is recommended to use the latest version of R. 

Step 3: 
Open StoX by double clicking on the "StoX.app" in the Applications folder in the Finder app. If you get a message saying "StoX can't be opened because the identity of the developer cannot be confirmed", or similar, ctr + click and select Open. Some users may need to 

Step 4: 
Click on "Tools" > "R connection" in the menu to define the path to R. Normally the following path will work "/Library/Frameworks/R.framework/Resources" (this path will work even if you at a later point in time upgrade R). Otherwise, the path to R can be found on the command line using 'R RHOME'.

Step 5: 
Click on "Tools" > "Install Rstox packages" in the menu. This will install the required R packages. After installing, the StoX and RstoxFramework version numbers shown in the upper right corner should be in black color. If any of these are in red color you are using an unofficial StoX release. It is recommended to close Rstudio and any other R applications before running Install Rstox packages. 

Step 6: 
StoX is now ready for use. 

### Linux:

Step 1: 
Install by double-clicking on the downloaded .rpm or .deb file, and follow the instructions.

Step 2: 
Install R 4.0.0 or newer if not already installed. It is recommended to use the latest version of R. 

Step 3: 
Open StoX either by clicking on the StoX icon or using the command 'StoX'.

Step 4: 
Click on "Tools" > "R connection" in the menu to define the path to R. The path to R can be found with the command 'R RHOME' in the terminal or R.home("bin") in R.

Step 5: 
Click on "Tools" > "Install Rstox packages" in the menu. This will install the required R packages. After installing, the StoX and RstoxFramework version numbers shown in the upper right corner should be in black color. If any of these are in red color you are using an unofficial StoX release. It is recommended to close Rstudio and any other R applications before running Install Rstox packages. 

Note that on Linux it may be required to install C++ libraries and other resources that are needed by the Rstox packages and their dependencies. The following commands may be sufficient to avoid errors in the "Install Rstox packages":

* Used in the package "units":
sudo apt-get install -y libudunits2-dev
* Used in the package "jsonvalidate" used by "RstoxFramework":
sudo apt-get install -y libcurl4-openssl-dev
* Used in the package "xml2":
sudo apt-get install -y libxml2-dev
* Used in the package "xslt" used by "RstoxData":
sudo apt-get install -y libxslt1-dev
* Used in the package "rgdal":
sudo apt-get install libgdal-dev
* Used in the package "sf": 
sudo apt-get install -y libproj-dev

If problems still occur, try debugging by loacting and running in R the commands that (1) source the Vesions.R file and (2) call the installOfficialRstoxPackagesWithDependencies() function, found in the log file located in the folder "stox" in your system temp folder (/tmp/stox), but with quiet = FALSE. See the following example:

source("/private/var/folders/gn/965ff8792cz_pmwdkdgssbzsyn4rns/T/stox.Versions.R")
installOfficialRstoxPackagesWithDependencies("3.1.4", "/private/var/folders/gn/965ff8792cz_pmwdkdgssbzsyn4rns/T/stox.OfficialRstoxFrameworkVersions.txt", quiet = FALSE, toJSON = TRUE) 

Step 6: 
StoX is now ready for use. 

## Known issues

StoX uses files to store the memory of an open StoX project. These files are located in the folder "process/projectSession", which only exists while the StoX project is open. These memory files occupy 113 characters in the file paths after the StoX project folder. If the StoX project contains processes with long names, the output files can occupy more than 113 characters. For Windows systems with maximum 256 character file path only 143 characters are left for the path of the StoX project folder. When working with StoX projects with long names, it is adivced to change the Windows Registry to accept long file paths (search, e.g., for "How to Make Windows 10 Accept long File Paths" for more information). 

## Examples

Example StoX projects can be downloaded from https://github.com/StoXProject/StoXExamples.

## License

MIT © Norwegian Institute of Marine research (IMR) ([homepage](https://www.hi.no/en)).

---

### For historical release notes, see [NEWS.md](https://github.com/StoXProject/StoX/blob/master/NEWS.md).
