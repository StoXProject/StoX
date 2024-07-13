supportedRVersion = c(
    "4.3", 
    "4.2", 
    "4.1", 
    "4.0", 
    "3.6"
    )

#' Install official Rstox packages
#' 
#' @export
#'
installOfficialRstoxPackagesWithDependencies <- function(
    StoXVersion, 
    officialRstoxPackageVersionsFile, 
    optionalDependencies = FALSE, 
    destdir = NA, 
    Rstox.repos = "https://stoxproject.github.io/repo", 
    Rstox_preRelease.repos = "https://stoxproject.github.io/testingRepo", 
    dependency.repos = "https://cloud.r-project.org", 
    lib = NULL, 
    toJSON = FALSE, 
    quiet = FALSE
) {
    
    # 1. Warn about locked files.

    # 2. Identify and download non-Rstox dependencies, located on CRAN. Binary on Windows, source on MacOS (may change to binary when arm64 vs x86_64 is sorted out) and Linux.
    #   - If any are not installed on Windows, try source also here.

    # 3. Download and install the specific Rstox package versions linked to the StoX version
    if(!is_online()) {
        stop("Internet connection is needed to install Rstox-packages.")
    }
    
    # Set timeout to the maximum value of 24 hours:
    originalTimeout <- options("timeout")
    options(timeout = 24*60*60)
    on.exit(options(timeout = originalTimeout))

    # Select the first library if not specified:
    if(!length(lib)) {
        lib <- .libPaths()[1]
    }
    
    #### Step 1: Identify the Rstox-packages: ####
    # Get the Rstox package names and versions:
    RstoxPackages <- getOfficialRstoxPackageVersion(
        StoXVersion = StoXVersion, 
        officialRstoxPackageVersionsFile = officialRstoxPackageVersionsFile,
        optionalDependencies = FALSE, 
        toJSON = FALSE, 
        list.out = TRUE, 
        reverse = TRUE
    )
    if(!length(RstoxPackages)) {
        warning("Rstox packages not specified. Did you specify the 'officialRstoxPackageVersionsFile'?")
        return(NULL)
    }

    # If the StoX version is not official, report an error with info on how to install manually from source in R:
    if(isFALSE(as.logical(attr(RstoxPackages, "Official")))) {
        #installCommands <- paste0(
        #    "remotes::install_github(repo = \"stoxproject/", 
        #    names(RstoxPackages$version), 
        #    "\", ref = \"", 
        #    names(RstoxPackages$version), 
        #    "-v", 
        #    unlist(RstoxPackages$version), 
        #    "\", dependencies = FALSE)"
        #)
        #stop("The StoX version ", StoXVersion, " is not an official version. Installation of Rstox packages for non-official versions is no longer supported in the StoX GUI. It is highly recommended to use the latest official version StoX ", getLatestOfficialStoxVersion(officialRstoxPackageVersionsFile), ".\nTo install the Rstox packages for this non-official version, the following lines must be run in R. If you are using Rstudio, it is adviced to restart R before installing the Rstox packages. Also, on Windows Rtools must be installed, as the Rstox packages are installed from source by these lines:\n", paste0(installCommands, collapse = "\n"))
        Rstox.repos <- Rstox_preRelease.repos
    }

    #### Step 2: List and install the dependencies: ####
    
    # Get the R version as two digit string:
    twoDigitRVersion <- getTwoDigitRVersionForDownload(Rstox.repos = Rstox.repos)
    
    # Get the package tables from the Rstox 
    dependency.contriburl <- contrib.url(dependency.repos, type = "source")
    dependency.available <- utils::available.packages(dependency.contriburl)
    # ... and the CRAN repo, 
    Rstox.contriburl <- contrib.url(Rstox.repos, type = "source")
    Rstox.available <- utils::available.packages(Rstox.contriburl)
    # ... and rbind to one table to be used in package_dependencies:
    packageTable <- as.data.frame(rbind(Rstox.available, dependency.available), stringsAsFactors = FALSE)

    # Cannot use remotes::package_deps since we are looking in two repos, the Rstox.repos and the dependency.repos:
    #deps <- remotes::package_deps(RstoxPackages$packageName, dependencies = c("Depends", "Imports", "LinkingTo"), repos = dependency.repos)
    #toInstall <- deps$package
    deps <- unique(unlist(tools::package_dependencies(packages = RstoxPackages$packageName, db = packageTable, which = "strong", recursive = TRUE)))
    # Ignore the base and recommended packages, which are those shipped with R:
    deps <- setdiff(deps, rownames(utils::installed.packages(priority = "high")))

    # Check whether there are any deps that should be installed (either missing or not the last version):
    installedTable <- as.data.frame(installed.packages(lib.loc = lib), stringsAsFactors = FALSE)
    # Keep only the dependencies:
    installedTable <- subset(installedTable, installedTable$Package %in% deps)
    availableTable <- packageTable[installedTable$Package, ]
    installedTable$Diff <- installedTable$Version != availableTable$Version
    installedButNotLatest <- subset(installedTable, Diff == 1)$Package
    
    # Install the dependencies that are not installed:
    notInstalled <- setdiff(deps, installedTable[, "Package"])
    
    # Get all dependencies to install
    toInstall <- c(notInstalled, installedButNotLatest)
    # Exclude Rstox packages, which are installed below:
    toInstall <- toInstall[!startsWith(toInstall, "Rstox")]
    
    if(length(toInstall)) {
    # Locate lockced folders:
        dirs <- list.dirs(lib, recursive = FALSE)
        lockedDirs <- subset(dirs, startsWith(basename(dirs), "00LOCK"))
        if(length(lockedDirs)) {
            warning("The directory ", lib, " contains locked folders (name starting with 00LOCK). If problems are expreienced during installation of the R pacckcages, you may try deleting such folders manually.")
        }
        
        # Install the dependencies. dependencies = NA means c("Depends", "Imports", "LinkingTo"):
        if(length(toInstall)) {
            options(install.packages.compile.from.source = "never") # Avoid installing sources which need compilation
            utils::install.packages(toInstall, repos = dependency.repos, dependencies = NA, type = getInstallType("CRAN"), quiet = quiet, lib = lib)
        }
        
        # If any packages were not installed as the default type, install as source:
        installed <- utils::installed.packages()[, "Package"]
        missing <- setdiff(toInstall, installed)
        if(length(missing)) {
            message("Installing the following packages from source as binary was not available:\n", paste0(missing, collapse = ", "))
            utils::install.packages(missing, repos = dependency.repos, dependencies = NA, type = "source", quiet = quiet, lib = lib)
        }
    }   
    
    
    #### Step 3: Install the Rstox packages: ####
    # Download the files to the specified directory (or to the tempdir() if not specified). We download first since we need specific versions, which is not supported by utils::install.packages():
    if(length(destdir) && is.na(destdir)) {
        destdir <- replace4backslashWithOneForward(tempdir())
    }
    
    ### # Get the URLs of the Rstox package to download:
    ### RstoxPackageURLs <- getRstoxPackageURL(
    ###     RstoxPackages$packageName, 
    ###     version = RstoxPackages$version, 
    ###     Rstox.repos = Rstox.repos, 
    ###     type = getInstallType("StoX"), 
    ###     twoDigitRVersion = twoDigitRVersion
    ### ) 
    ### localFiles <- paste(destdir, basename(RstoxPackageURLs), sep = "/")
    
    
    ### # Download the binaries:
    ### mapply(
    ###     utils::download.file, 
    ###     replace4backslashWithOneForward(RstoxPackageURLs), 
    ###     destfile = replace4backslashWithOneForward(localFiles), 
    ###     quiet = quiet
    ### )

    localFiles <- mapply( 
        downloadRstoxPackage, 
        packageName = RstoxPackages$packageName, 
        version = RstoxPackages$version, 
        MoreArgs = list(
            twoDigitRVersion = twoDigitRVersion, 
            destdir = destdir, 
            Rstox.repos = Rstox.repos, 
            type = getInstallType("StoX"), 
            quiet = quiet
        )
    )

    
    # Locate lockced folders again:
    dirs <- list.dirs(lib, recursive = FALSE)
    lockedDirs <- subset(dirs, startsWith(basename(dirs), "00LOCK"))
    if(length(lockedDirs)) {
        warning("The directory ", lib, " contains locked folders (name starting with 00LOCK). If problems are expreienced during installation of the R pacckcages, you may try deleting such folders manually.")
    }

    # First install downladed binaries


    # Then install into first of .libPaths():
    installedRstoxPackages <- utils::install.packages(localFiles, type = getInstallType("StoX"), repos = NULL, quiet = quiet, lib = lib)
    
    allInstalledPackages <- c(
        toInstall, 
        paste(RstoxPackages$packageName, RstoxPackages$version, sep = "_v")
    )
    
    if(toJSON) {
        allInstalledPackages <- vector2json(allInstalledPackages)
    }
    return(allInstalledPackages)
}


downloadRstoxPackage <- function(
    packageName, 
    version, 
    twoDigitRVersion, 
    destdir, 
    Rstox.repos = "https://stoxproject.github.io/repo", 
    type = getInstallType("StoX"), 
    quiet = FALSE
) {

    twoDigitRVersion <- getTwoDigitRVersionForDownload(
        twoDigitRVersion = twoDigitRVersion, 
        Rstox.repos = Rstox.repos, 
        packageName = packageName, 
        packageVersion = version
    )

    # Get the URLs of the Rstox package to download:
    RstoxPackageURL <- getRstoxPackageURL(
        packageName, 
        version = version, 
        Rstox.repos = Rstox.repos, 
        type = type, 
        twoDigitRVersion = twoDigitRVersion
    ) 
    localFile <- paste(destdir, basename(RstoxPackageURL), sep = "/")
    
    
    # Download the binaries:
    utils::download.file(
        replace4backslashWithOneForward(RstoxPackageURL), 
        destfile = replace4backslashWithOneForward(localFile), 
        quiet = quiet
    )

    if(! file.exists(localFile)) {
        localFile <- NA
    }

    return(localFile)
}

contrib.url_Rstox <- function(Rstox.repos = "https://stoxproject.github.io/repo", type = getInstallType("StoX"), twoDigitRVersion = NA) {
    
    # Get the contrib url:
    contriburl <- contrib.url(Rstox.repos, type = type)

    if(type == "binary") {
        # Replace by the given R minor version to support other R versions than the installed one (e.g. before the StoX repo is updated):
        contriburl_sans_RMinorVersion <- sub("/[^/]*$", "", contriburl)
        RMinorVersion <- gsub(".*/", "", contriburl)
        if(RMinorVersion != twoDigitRVersion) {
            contriburl <- paste(contriburl_sans_RMinorVersion, twoDigitRVersion, sep = "/")
        }
    }
    

    return(contriburl)
}

getRstoxPackageURL <- function(packageName, version = NULL, Rstox.repos = "https://stoxproject.github.io/repo", type = getInstallType("StoX"), twoDigitRVersion = NA) {

    contriburl <- contrib.url_Rstox(Rstox.repos = Rstox.repos, type = type, twoDigitRVersion = twoDigitRVersion)

    pathSansExt <- paste(
        contriburl, 
        getPackageNameAndVersionString(packageName, version), 
        sep = "/"
    )
    
    # Get the file extension:
    fileExt <- getPackageFileExt(type = type)
    
    path <- paste(pathSansExt, fileExt, sep = ".")
    
    return(path)
}



getTwoDigitRVersionForDownload <- function(twoDigitRVersion = NA, Rstox.repos = "https://stoxproject.github.io/repo", packageName = NULL, packageVersion = NULL) {
    
    if(is.na(twoDigitRVersion)) {
        RMajor <- R.Version()$major
        RMinor <- gsub("(.+?)([.].*)", "\\1", R.Version()$minor)
        twoDigitRVersion <- paste(RMajor, RMinor, sep = ".")
    }
    
    if(twoDigitRVersion < min(supportedRVersion)) {
        stop("R ", min(supportedRVersion), " is the minimum supported R version for StoX")
    }
    else if(twoDigitRVersion > max(supportedRVersion)) {
        warning("Rstox packages were downloaded for the latest supported R version for StoX (R ", max(supportedRVersion), ", installed R version is ", twoDigitRVersion, ").")
        twoDigitRVersion <- max(supportedRVersion)
    }
        
    # Test against the repo, whether it exists:
    contriburl <- contrib.url_Rstox(Rstox.repos = Rstox.repos, type = getInstallType("StoX"), twoDigitRVersion = twoDigitRVersion)
    #suppressWarnings(packageTable <- utils::available.packages(contriburl))
    tmpf <- file.path(tempdir(), "PACKAGES")
    download.file(url = file.path(contriburl, "PACKAGES"), destfile = tmpf, quiet = TRUE)
    suppressWarnings(packageTable <- read.dcf(tmpf))
    if(!NROW(packageTable)) {
        newTwoDigitRVersion <- max(supportedRVersion[supportedRVersion < twoDigitRVersion])
        warning("R (minor) version ", twoDigitRVersion, " was requested, but does not exist (presumably a delay or an error when building StoX). Rstox packages for the previvous supported R version (", newTwoDigitRVersion, ") were downloaded.")
        twoDigitRVersion <- newTwoDigitRVersion
    }
    else if(length(packageName) && length(packageVersion)) {
        atPackage <- which(packageTable[, "Package"] == packageName)
        if(length(atPackage) && ! packageVersion %in% packageTable[atPackage, "Version"]) {
            latestExistingVersion <- max(packageTable[atPackage, "Version"])
            warning("The requested package version ", packageName, "_v", packageVersion, " is not present in ", contriburl, "(presumably a delay or an error when building StoX). Latest existing version is ", latestExistingVersion, ".")
        }

        
    }


    return(twoDigitRVersion)
}


getPlatform <- function(platform = NA) {
    
    if(is.na(platform)) {
        if (.Platform$OS.type == "windows") {
            platform <- "windows"
        }
        else if (Sys.info()["sysname"] == "Darwin") {
            platform <- "macosx"
        } 
        else if (Sys.info()["sysname"] == "Linux") {
            platform <- "linux"
        } 
        else {
            stop("Only Windows, MacOS and Linux are currently supported.")
        }
    }
    else {
        platform <- tolower(platform)
    }
    
    return(platform)
}






#'
#' @export
#'
getOfficialRstoxPackageVersion <- function(
    StoXVersion = NULL, 
    officialRstoxPackageVersionsFile = "https://raw.githubusercontent.com/StoXProject/StoX/master/srv/OfficialRstoxFrameworkVersions.txt", 
    optionalDependencies = FALSE, 
    toJSON = FALSE, 
    list.out = FALSE, 
    reverse = FALSE
) {
    
    # Read the officialRstoxPackageVersionsFile:
    official <- readOfficialRstoxPackageVersionsFile(officialRstoxPackageVersionsFile)
    
    if(length(official)) {
        # Get rows of RstoxFrameworkVersions within the minimum and maximum StoXGUI version:
        if(length(StoXVersion)) {
            if(!StoXVersion %in% official$StoX) {
                stop("StoX GUI version ", StoXVersion, " not present in the file ", officialRstoxPackageVersionsFile, ".")
            }
            official <- subset(official, StoX == StoXVersion)
        }
        # If StoXVersion is not given, we use the versions of the last row of the officialRstoxPackageVersionsFile, which gives the latest official 
        else {
            official <- utils::tail(official, 1)
        }
        
        # Split the Dependencies:
        officialDependencies <- strsplit(official$Dependencies, "[,]")[[1]]
        officialDependencies <- extractPackageNameAsNames(officialDependencies)
        packageVersionList <- c(list(RstoxFramework = official$RstoxFramework), officialDependencies)
        
        # Split the optional dependencies:
        if(length(official$OptionalDependencies) && !isFALSE(optionalDependencies)) {
            officialOptionalDependencies <- strsplit(official$OptionalDependencies, "[,]")[[1]]
            officialOptionalDependencies <- extractPackageNameAsNames(officialOptionalDependencies)
            #if(!isFALSE(optionalDependencies)) {
                toKeep <- names(officialOptionalDependencies) %in% utils::installed.packages()[, "Package"]
                officialOptionalDependencies <- subset(officialOptionalDependencies, toKeep)
            #}
            packageVersionList <- c(packageVersionList, officialOptionalDependencies)
        }

        if(reverse) {
            packageVersionList <- rev(packageVersionList)
        }
        
        if(list.out) {
            packageVersions <- list(
                packageName = names(packageVersionList), 
                version = unlist(packageVersionList)
            )
        }
        else {
            packageVersions <- getPackageNameAndVersionString(packageVersionList)
        }
        # Add the StoX version as an attribute:
        attr(packageVersions, "StoX") <- official$StoX
        attr(packageVersions, "Official") <- official$Official
        
        if(toJSON) {
            packageVersions <- vector2json(packageVersions)
        }
        
        return(packageVersions)
    }
    else {
        return(NULL)
    }
}

replace4backslashWithOneForward <- function(x) {
    x <- gsub("\\", "/", x, fixed = TRUE)
    return(x)
}


# Updated this to read from our file, after Dave Boyer had problems with the original site = "http://example.com/":
is_online <- function(site = "https://raw.githubusercontent.com/StoXProject/repo/master/README.md") {
    tryCatch({
        readLines(site, n = 1)
        TRUE
    },
    warning = function(w) invokeRestart("muffleWarning"),
    error = function(e) FALSE)
}


getInstallType <- function(repoClass = c("StoX", "CRAN")) {
    repoClass <- match.arg(repoClass)
    platform <- getPlatform()
    if (platform == "linux") {
        type = list(
            StoX = "source", 
            CRAN = "source"
        )
    }
    else if (platform == "macosx") {
        type = list(
            # 2023-04-29: With R 4.3 there are two R distributions on MacOS, which does not seem to be supported in drat. We need to figure this out before enabeling binary install of Rstox packages on MacOs:
            StoX = "source", 
            CRAN = "binary"
        )
    }
    else {
        type = list(
            StoX = "binary", 
            CRAN = "binary"
        )
    }

    return(type[[repoClass]])
}

getPackageFileExt <- function(type = c("binary", "source")) {
    
    type <- match.arg(type)
    platform <- getPlatform()

    # Only source is available for Linux (generally, https://stackoverflow.com/questions/11871394/create-r-binary-packages-for-linux-that-can-be-installed-on-different-machines):
    if (platform == "linux") {
        if(type == "binary") {
            warning("Binary is not available for Linux. Using source.")
            type  <- "source"
        }
    }

    if(type == "source") {
        fileExt <- "tar.gz"
    }
    else {
        if (platform == "windows") {
            fileExt <- "zip"
        }
        else if (platform == "macosx") {
            fileExt <- "tgz"
        }
    }
    
    return(fileExt)
}

getLatestOfficialStoxVersion <- function(officialRstoxPackageVersionsFile) {
    official <- readOfficialRstoxPackageVersionsFile(officialRstoxPackageVersionsFile)
    utils::tail(official[official$Official, ]$StoX, 1)
}



#' Get package status of an Rstox package
#' 
#' @param RstoxPackageName The name of the Rstox package.
#' @param StoXVersion The StoX version string.
#' @inheritParams getNonRstoxDependencies
#' 
#' @export
#' 
RstoxPackageStatus <- function(RstoxPackageName, StoXVersion, officialRstoxPackageVersionsFile) {
    
    # This function returns a status of an Rstox package that is 
    # 3: Package not installed
    # 2: Package is not an official RstoxPackage
    # 1: Package version is not certified
    # 0: Package version IS certified 
    
    # Read the officialRstoxPackageVersionsFile and select the row given by the StoXVersion:
    certifiedTable <- readOfficialRstoxPackageVersionsFile(officialRstoxPackageVersionsFile, optionalDependencies = TRUE, toTable = TRUE)
    RstoxPackageColumnNames <- startsWith(names(certifiedTable), "Rstox")
    certifiedRow <- subset(certifiedTable, certifiedTable$StoX == StoXVersion, select = RstoxPackageColumnNames)
    
    # Check whether the packages are installed.:
    isInstalled <- nzchar(system.file(package = RstoxPackageName))
    #isInstalled <- isTRUE(require(RstoxPackageName))
    if(!isInstalled) {
        return(3)
    }
    
    # Get the installed version:
    currentVersion <- getVersionStringOfPackage(RstoxPackageName)
    
    # Compare to the certified versions:
    if(! RstoxPackageName %in% names(certifiedRow)) {
        return(2)
    }
    
    certifiedVersion <- certifiedRow[[RstoxPackageName]]
    
    status <- as.numeric(certifiedVersion != currentVersion)
    
    return(status)
}







#' Test for whether the given StoX version is an official version
#' 
#' @inheritParams getOfficialRstoxPackageVersion
#' 
#' @export
#' 
isOfficialStoXVersion <- function(StoXVersion, officialRstoxPackageVersionsFile) {
    official <- readOfficialRstoxPackageVersionsFile(officialRstoxPackageVersionsFile, toTable = TRUE)
    officialStoXVersions <- official$StoX[official$Official]
    StoXVersion %in% officialStoXVersions
}










#######################################################################
##### These functions are copyies of functions in RstoxFramework: #####
#######################################################################

# Read the officialRstoxPackageVersionsFile:
readOfficialRstoxPackageVersionsFile <- function(officialRstoxPackageVersionsFile, optionalDependencies = FALSE, toTable = FALSE) {
    # Get the file name:
    if(missing(officialRstoxPackageVersionsFile) || !length(officialRstoxPackageVersionsFile)) {
        officialRstoxPackageVersionsFile = system.file("versions", "OfficialRstoxFrameworkVersions.txt", package = "RstoxFramework")
    }
       
    # Read the officialRstoxPackageVersionsFile:
    official <- tryCatch(
        read.table(
            officialRstoxPackageVersionsFile, 
            header = TRUE, 
            stringsAsFactors = FALSE, 
            sep = "\t"
        ), 
        error = function(e) {
            NULL
        }
    )
    
    if(toTable) {
        officialDependencies <- strsplit(official$Dependencies, "[,]")
        officialDependencies <- lapply(officialDependencies, extractPackageNameAsNames)
        officialDependencies <- data.table::rbindlist(officialDependencies)
        
        if(length(official$OptionalDependencies) && !isFALSE(optionalDependencies)) {
            officialOptionalDependencies <- lapply(official$OptionalDependencies, strsplit, "[,]")
            officialOptionalDependencies <- lapply(official$OptionalDependencies, "[[", 1)
            officialOptionalDependencies <- lapply(officialOptionalDependencies, extractPackageNameAsNames)
            areEmptyString <- !sapply(officialOptionalDependencies, nzchar)
            if(any(areEmptyString)) {
                officialOptionalDependencies[areEmptyString] <- rep(list(list(NA)), sum(areEmptyString))
            }
            
            officialOptionalDependencies <- data.table::rbindlist(officialOptionalDependencies, fill = TRUE)
            
            
            #if(!isFALSE(optionalDependencies)) {
                keep <- names(officialOptionalDependencies) %in% utils::installed.packages()[, "Package"]
                officialOptionalDependencies <- subset(officialOptionalDependencies, select = keep)
            #}
            officialDependencies <- cbind(officialDependencies, officialOptionalDependencies)
        }
        
        official <- data.table::data.table(
            StoX = official$StoX, 
            RstoxFramework = official$RstoxFramework, 
            officialDependencies,
            Official = official$Official
        )
    }
    
    return(official)
}

# Convert a vector to JSON using siple paste (no package dependencies):
vector2json <- function(x) {
    paste0("[", paste(sapply(x, deparse), collapse = ", "), "]")
}

# Small function to parse the string defining officical Rstox-package versions:
extractPackageNameAsNames <- function(x) {
    if(!length(x) || !sum(nchar(x))) {
        return(x)
    }
    x <- strsplit(x, "[_]")
    x <- structure(lapply(x, "[", 2), names = sapply(x, "[", 1))
    
    return(x)
}

getPackageNameAndVersionString <- function(packageName, version, sep = "_") {
    if(is.list(packageName)) {
        version <- packageName
        packageName <- names(packageName)
    }
    paste(packageName, version, sep = sep)
}



getVersionStringOfPackage <- function(packageName) {
    pkgs <- utils::installed.packages()
    vers <- pkgs[, "Version"]
    vers[packageName]
}

