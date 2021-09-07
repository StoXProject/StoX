# StoX

## Introduction

StoX is an open source software developed at IMR, Norway, to analyze survey data and calculate survey estimates from acoustic and swept area surveys. The program is a stand-alone application for easy sharing and further development in cooperation with other institutes. 

“StoX is designed as a tool for transparent and reproducible survey estimation across nations and survey objectives. All methods, user settings and links to input data are documented in a description file. A process is a user‐defined call to one function available in a library of functions defined by StoX. Any StoX model can be modified by changing parameters of the processes, adding or removing processes and by rearranging their order of execution. Different StoX functions require one or more input datasets, which can be data files or output from previously executed processes.” [Johnsen, E., Totland, A., Skålevik, Å., Holmin, A. J., Dingsør, G. E., Fuglebakk, E., & Handegard, N. O. (2019). StoX: An open source software for marine survey analyses. Methods in Ecology and Evolution, 10(9), 1523-1528.](https://doi.org/10.1111/2041-210X.13250)

## Installation

See [release notes for StoX 3.1.0](https://github.com/StoXProject/StoX/blob/master/NEWS.md#Stox-v310-2021-06-18).

Download StoX from (https://github.com/StoXProject/StoX/releases/tag/v3.1.0). For Windows download the .msi file, for MacOS download the .dmg file and for Linux download the .rpm or .deb file. Then follow the instructions below:

### Windows:

Step 1: 
Install by double-clicking on the downloaded .msi file, and follow the instructions. If you get a message along the lines that the installer is blocked by the system, you can click on "More info" and select "Run anyway".

Step 2: 
Install R 3.6.3 or newer if not already installed.

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
Install R 3.6.3 or newer if not already installed.

Step 3: 
Open StoX by double clicking on the "StoX.app" in the Applications folder in the Finder app. If you get a message saying "StoX can't be opened because the identity of the developer cannot be confirmed", or similar, ctr + click and select Open. 

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
Install R 3.6.3 or newer if not already installed.

Step 3: 
Open StoX either by clicking on the StoX icon or using the command 'StoX'.

Step 4: 
Click on "Tools" > "R connection" in the menu to define the path to R. The path to R can be found with the command 'R RHOME'.

Step 5: 
Click on "Tools" > "Install Rstox packages" in the menu. This will install the required R packages. After installing, the StoX and RstoxFramework version numbers shown in the upper right corner should be in black color. If any of these are in red color you are using an unofficial StoX release. It is recommended to close Rstudio and any other R applications before running Install Rstox packages. 

Step 6: 
StoX is now ready for use. 

## Examples

Example StoX projects can be downloaded from https://github.com/StoXProject/StoXExamples.

## License

LGPL-3 © Norwegian Institute of Marine research (IMR) ([homepage](https://www.hi.no/en)).

---

### For historical release notes, see: https://github.com/StoXProject/StoX/blob/master/NEWS.md.

