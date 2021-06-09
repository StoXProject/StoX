#' Tools to download and install Rstox packages and dependen packages.
#' 
#' \code{getNonRstoxDependencies} gets all package dependencies ("Depends", "Imports" and "LinkingTo") of the packages given by \code{packageName}, excluding any Rstox-packages. \cr \cr
#' \code{installOfficialRstoxPackagesWithDependencies} installs the corrrect versions of Rstox-packages, and other packages that these packages depend on. This function is used by the StoX GUI. \cr \cr
#' \code{getOfficialRstoxPackageVersion} reads the OfficialRstoxFrameworkVersions.txt file for the given StoX GUI version \cr \cr
#' 
#' @inheritParams utils::install.packages
#' @param packageName The packages to get dependencies from.
#' @param dependencyTypes A character vector listing the dependencies to get, with possible values "Depends", "Imports", "LinkingTo", "Suggests", "Enhances". Default is NA, implying c("Depends", "Imports", "LinkingTo").
#' @param Rstox.repos,nonRstox.repos Either NULL to search for packages locally, or a repository passed to \code{\link[utils]{available.packages}}, where \code{Rstox.repos} is used to locate direct dependencies of the Rstox packages, and \code{nonRstox.repos} is used to get the dependencies of the direct dependencies recursively, defaulted to the CRAN repository.
#' @param download.repos The repository to download from.
#' @param sort Logical: If TRUE sort the dependent packages, defaulted to FALSE to enable installing the most basic dependencies first.
#' @param StoXGUIVersion The version of the StoX GUI defining the combination of official Rstox package versions.
#' @param officialRstoxPackageVersionsFile The path to the file holding the link between StoX GUI version and Rstox package versions.
#' @param destdir The directory to download binaries to, defaulted to NA which implies tempdir().
#' @param platform The platform to download binaries for, defaulted to the current platform, but with the option to download for other platforms (possible values are "windows" and "macosx").
#' @param twoDigitRVersion The two digit R version to downoad binaries for, defaulted to the current version, but with the option to download for other versions such as 3.6.
#' @param packageName The packages considered official Rstox pakcages, "RstoxFramework","RstoxBase" and "RstoxData".
#' @param include.optional Logical: If TRUE inclcude optional packages. Currently not used.
#' @param toJSON Logical: If TRUE output a JSON string.
#' @param skip.identical Logical: If TRUE do not install packages that are already installed with the exact same version.
#' @param list.out Logical: If TRUE wrap the output of \code{getOfficialRstoxPackageVersion} in a list with packageName and version.
#' 
#' @name installPackages
#' 
NULL





#' 
#' @export
#' @rdname installPackages
#' 
getNonRstoxDependencies <- function(
    packageName = c("RstoxFramework","RstoxBase", "RstoxData"), 
    dependencyTypes = NA, 
    Rstox.repos = NULL, 
    nonRstox.repos = "https://cloud.r-project.org", 
    sort = FALSE
) {

    # Get non-Rstox dependencies:
    nonRstoxDependencies <- lapply(
        packageName, 
        getDependencies, 
        repos = Rstox.repos, 
        dependencyTypes = dependencyTypes, 
        excludeStartingWith = "Rstox", 
        recursive = FALSE, 
        sort = sort
    )
    # The order of the pakcages is defined in getRstoxFrameworkDefinitions("officialStoxLibraryPackagesAll"), and is kept if sort = FALSE:
    nonRstoxDependencies <- unique(unlist(nonRstoxDependencies))
    
    # Get also dependencies of dependencies:
    allNonRstoxDependencies <- getDependencies(
        packageName = nonRstoxDependencies, 
        repos = nonRstox.repos, 
        dependencyTypes = dependencyTypes, 
        append = TRUE, 
        sort = sort
    )
    
    return(allNonRstoxDependencies)
}
#'
#' @export
#' @rdname installPackages
#'
installOfficialRstoxPackagesWithDependencies <- function(
    StoXGUIVersion, 
    officialRstoxPackageVersionsFile, 
    destdir = NA, 
    Rstox.repos = "https://stoxproject.github.io/repo", 
    download.repos = "https://cloud.r-project.org", 
    dependencyTypes = NA, 
    sort = FALSE, 
    platform = NA, 
    skip.identical = FALSE, 
    twoDigitRVersion = NA, 
    toJSON = FALSE, 
    quiet = FALSE
) {
    
    res <- tryCatch({
        
        originalTimeout <- options("timeout")
        options(timeout = 24*60*60)
        # First install the officical Rstox pakcage versions with no dependencies:
        RstoxPackageBinaryFiles <- installOfficialRstoxPackages(
            StoXGUIVersion = StoXGUIVersion, 
            officialRstoxPackageVersionsFile = officialRstoxPackageVersionsFile, 
            include.optional = FALSE, 
            dependencyTypes = FALSE, 
            Rstox.repos = Rstox.repos, 
            platform = platform, 
            twoDigitRVersion = twoDigitRVersion, 
            quiet = quiet
        )
        
        # Then install non-Rstox dependencies using no repo to list the dependencies (Rstox.repos = NULL):
        nonRstoxPackageBinaryFiles <- installNonRstoxDependencies(
            destdir = destdir, 
            dependencyTypes = dependencyTypes, 
            Rstox.repos = NULL, 
            download.repos = download.repos, 
            sort = FALSE, 
            platform = platform, 
            skip.identical = skip.identical, 
            twoDigitRVersion = twoDigitRVersion, 
            quiet = quiet
        )
        options(timeout = originalTimeout)
        
        binaryFiles <- c(RstoxPackageBinaryFiles, nonRstoxPackageBinaryFiles)
        
        if(toJSON) {
            binaryFiles <- vector2json(binaryFiles)
        }
    },
    error=function(e) {
        e
    })
    binaryFiles <- res
    return(binaryFiles)
}
#'
#' @export
#' @rdname installPackages
#'
getOfficialRstoxPackageVersion <- function(
    StoXGUIVersion = NULL, 
    officialRstoxPackageVersionsFile = system.file("versions", "OfficialRstoxFrameworkVersions.txt", package = "RstoxFramework"), 
    packageName = c("RstoxFramework","RstoxBase", "RstoxData"), 
    include.optional = FALSE, 
    toJSON = FALSE, 
    list.out = FALSE
) {
    
    # Read the officialRstoxPackageVersionsFile:
    official <- readOfficialRstoxPackageVersionsFile(officialRstoxPackageVersionsFile)
    
    if(length(official)) {
        # Get rows of RstoxFrameworkVersions within the minimum and maximum StoXGUI version:
        if(length(StoXGUIVersion)) {
            if(!StoXGUIVersion %in% official$StoX) {
                stop("StoX GUI version ", StoXGUIVersion, " not present in the file ", officialRstoxPackageVersionsFile, ".")
            }
            official <- subset(official, StoX == StoXGUIVersion)
        }
        else {
            official <- utils::tail(official, 1)
        }
        
        # Split the Dependencies:
        dependencies <- strsplit(official$Dependencies, "[,]")[[1]]
        dependencies <- extractPackageNameAsNames(dependencies)
        packageVersionList <- c(list(RstoxFramework = official$RstoxFramework), dependencies)
        
        # This is a bit complicated, but takes care of package names and versions either pasted to strings or as separate values in a list:
        if(!include.optional) {
            packageVersionList <- packageVersionList[intersect(packageName, names(packageVersionList))]
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




installNonRstoxDependencies <- function(
    destdir = NA, 
    dependencyTypes = NA, 
    Rstox.repos = NULL, 
    download.repos = "https://cloud.r-project.org", 
    sort = FALSE, 
    platform = NA, 
    twoDigitRVersion = NA, 
    skip.identical = FALSE, 
    quiet = FALSE
) {
    
    # Get the dependencies:
    binaryLocalFiles <- downloadNonRstoxDependencies(
        destdir = destdir, 
        dependencyTypes = dependencyTypes, 
        Rstox.repos = Rstox.repos, 
        download.repos = download.repos, 
        sort = sort, 
        platform = platform, 
        twoDigitRVersion = twoDigitRVersion, 
        skip.identical = skip.identical, 
        quiet = quiet
    )
    if(!length(binaryLocalFiles)) {
        return(NULL)
    }
    
    # For a clean install remove the packages first:
    packagesToRemove <- getOnlyPackageName(basename(binaryLocalFiles))
    removeExistingPackages(packagesToRemove)
    
    # Then install:
    installBinaryRemove00LOCK(
        rev(binaryLocalFiles), 
        repos = NULL, 
        quiet = quiet
    )
    #lapply(rev(binaryLocalFiles), install.packages, repos = NULL)
    
    return(binaryLocalFiles)
}

downloadNonRstoxDependencies <- function(
    packageName = c("RstoxFramework","RstoxBase", "RstoxData"), 
    destdir = NA, 
    dependencyTypes = NA, 
    Rstox.repos = NULL, 
    download.repos = "https://cloud.r-project.org", 
    sort = FALSE, 
    platform = NA, 
    twoDigitRVersion = NA, 
    skip.identical = FALSE, 
    quiet = FALSE) {
    
    # Get the dependencies:
    nonRstoxDependencies <- getNonRstoxDependencies(
        packageName = packageName, 
        dependencyTypes = dependencyTypes, 
        Rstox.repos = Rstox.repos, 
        nonRstox.repos = download.repos, 
        sort = sort
    )
    
    # Download the files to the specified directory (or to the tempdir() if not specified):
    if(length(destdir) && is.na(destdir)) {
        destdir <- replace4backslashWithOneForward(tempdir())
    }
    
    # Using the path to the relevant binaries:
    binaries <- getPackageBinaryURL(
        packageName = nonRstoxDependencies, 
        repos = download.repos, 
        platform = platform, 
        twoDigitRVersion = twoDigitRVersion, 
        skip.identical = skip.identical
    )
    if(!length(binaries)) {
        return(NULL)
    }
    
    # Download:
    binaryLocalFiles <- paste(destdir, basename(binaries), sep = "/")
    mapply(
        download.file, 
        replace4backslashWithOneForward(binaries), 
        destfile = replace4backslashWithOneForward(binaryLocalFiles), 
        quiet = quiet
    )
    
    return(binaryLocalFiles)
}

installOfficialRstoxPackages <- function(
    StoXGUIVersion, 
    officialRstoxPackageVersionsFile, 
    destdir = NA, 
    include.optional = FALSE, 
    dependencyTypes = NA, 
    Rstox.repos = "https://stoxproject.github.io/repo", 
    platform = NA, 
    twoDigitRVersion = NA, 
    quiet = FALSE
) {
    
    # Get the official versions defined by the officialRstoxPackageVersionsFile for the particular StoXGUIVersion:
    officialRstoxPackageNameAndVersion <- getOfficialRstoxPackageVersion(
        StoXGUIVersion = StoXGUIVersion, 
        officialRstoxPackageVersionsFile = officialRstoxPackageVersionsFile,
        packageName = c("RstoxFramework","RstoxBase", "RstoxData"), 
        include.optional = include.optional, 
        toJSON = FALSE
    )
    officialRstoxPackageName <- getOnlyPackageName(officialRstoxPackageNameAndVersion)
    officialRstoxPackageVersionList <- extractPackageNameAsNames(officialRstoxPackageNameAndVersion)
    
    # Download and then install the official Rstox package versions from the StoXProject repo:
    #binaries <- getPackageBinaryURL(
    #    packageName = officialRstoxPackageName, 
    #    version = officialRstoxPackageVersionList, 
    #    repos = Rstox.repos, 
    #    platform = platform, 
    #    twoDigitRVersion = twoDigitRVersion, 
    #    skip.identical = FALSE
    #)
    supportedRVersion <- getSupportedRVersions()
    binaries <- lapply(
        supportedRVersion, function(Rver) getPackageBinaryURL(
            packageName = officialRstoxPackageName, 
            version = officialRstoxPackageVersionList, 
            repos = Rstox.repos, 
            platform = platform, 
            twoDigitRVersion = Rver, 
            skip.identical = FALSE
        )
    )
    binaries <- unlist(binaries)
    
    # Check that the URLs exist:
    suppressWarnings(URLExists <- lapply(binaries, tryDownload))
    URLExists <- URLExists %in% 0
    binaries <- binaries[URLExists]
    
    # Get the latest possible:
    binaries <- binaries[!duplicated(names(binaries))]
    if(!all(officialRstoxPackageName %in% names(binaries))) {
        stop("The following Rstox packages could not be found: ", paste(setdiff(officialRstoxPackageName, names(binaries)), collapse = ", "))
    }
    
    if(length(destdir) && is.na(destdir)) {
        destdir <- replace4backslashWithOneForward(tempdir())
    }
    binaryLocalFiles <- paste(destdir, basename(binaries), sep = "/")
    system.time(mapply(download.file, binaries, destfile = binaryLocalFiles, quiet = quiet))
    
    # For a clean install remove the packages first:
    packagesToRemove <- getOnlyPackageName(basename(binaryLocalFiles))
    removeExistingPackages(packagesToRemove)
    
    ## Then install:
    #lapply(
    #    rev(binaryLocalFiles), 
    #    install.packages, 
    #    repos = NULL, 
    #    dependencies = dependencies
    #)
    # Then install:
    installBinaryRemove00LOCK(
        rev(binaryLocalFiles), 
        repos = NULL, 
        quiet = quiet
    )
    
    
    return(binaryLocalFiles)
}


getSupportedRVersions <- function() {
    supportedRVersion <- c(
        "4.1", 
        "4.0", 
        "3.6"
        )
    #supportedRVersion <- getRstoxFrameworkDefinitions("supportedRVersion")
    twoDigitRVersion <- getTwoDigitRVersion()
    supportedRVersion <- supportedRVersion[supportedRVersion <= twoDigitRVersion]
    return(supportedRVersion)
}

tryDownload <- function(URL) {
    tryCatch(
        download.file(URL, destfile = tempfile(), quiet = TRUE), 
        error = function(e) {
            e
        }
    )
}

installBinaryRemove00LOCK <- function(binaryPath, lib = NULL, repos = NULL, quiet = FALSE) {
    # Select the first library if not specified:
    if(!length(lib)) {
        lib <- .libPaths()[1]
    }
    
    # Locate lockced folders:
    dirs <- list.dirs(lib, recursive = FALSE)
    lockedDirs <- subset(dirs, startsWith(basename(dirs), "00LOCK"))
    unlink(lockedDirs, recursive = TRUE, force = TRUE)
    
    # Then install into first of .libPaths():
    install.packages(binaryPath, type = "binary", repos = repos, quiet = quiet, lib = lib)
    
    return(binaryPath)
}


subsetBinaryPathsByIdenticallyInstalled <- function(binaryPath, lib = NULL) {
    # Select the first library if not specified:
    if(!length(lib)) {
        lib <- .libPaths()[1]
    }
    
    # Cannot use data.table, as it is not shipped with R:
    ### # Install only the packages that are not already installed with the exact same version:
    ### installed <- data.table::as.data.table(installed.packages(lib))
    ### # Create a table of the pakcages to install:
    ### toInstall <- data.table::data.table(
    ###     Package = getOnlyPackageName(basename(binaryPath)), 
    ###     newVersion = getOnlyPackageVersion(basename(binaryPath)), 
    ###     binaryPath = binaryPath
    ### )
    ### # Match the packcage names:
    ### toInstall <- merge(installed, toInstall, all.y = TRUE)
    ### # Select only those with new version different from installed version:
    ### toInstall <- subset(toInstall, Version != newVersion | is.na(Version))
    
    # Install only the packages that are not already installed with the exact same version:
    installed <- as.data.frame(utils::installed.packages(lib), stringsAsFactors = FALSE)
    # Create a table of the pakcages to install:
    toInstall <- data.frame(
        Package = getOnlyPackageName(basename(binaryPath)), 
        newVersion = getOnlyPackageVersion(basename(binaryPath)), 
        binaryPath = binaryPath, 
        stringsAsFactors = FALSE
    )
    # Match the packcage names:
    toInstall <- merge(installed, toInstall, all.y = TRUE)
    # Select only those with new version different from installed version:
    toInstall <- subset(toInstall, Version != newVersion | is.na(Version))
    
    return(toInstall$binaryPath)
}


removeExistingPackages <- function(pkgs, lib = NULL) {
    # Select the first library if not specified:
    if(!length(lib)) {
        lib <- .libPaths()[1]
    }
    # Remove only installed packages to avoid error in remove.packages():
    installed <- utils::installed.packages(lib.loc = lib)[, "Package"]
    packagesToRemove <- intersect(pkgs, installed)
    lapply(packagesToRemove, remove.packages, lib = lib)
}




getOnlyPackageName <- function(packageNameAndVersionString) {
    sub("\\_.*", "", packageNameAndVersionString)
}
getOnlyPackageVersion <- function(packageNameAndVersionString) {
    sub('.+_(.+)', '\\1', packageNameAndVersionString)
}




readOfficialRstoxPackageVersionsFile <- function(officialRstoxPackageVersionsFile) {
    # Get the file name:
    if(!length(officialRstoxPackageVersionsFile)) {
        officialRstoxPackageVersionsFile = system.file("versions", "OfficialRstoxFrameworkVersions.txt", package = "RstoxFramework")
    }
       
    # Read the officialRstoxPackageVersionsFile:
    official <- tryCatch(
        read.table(
            officialRstoxPackageVersionsFile, 
            header = TRUE, 
            stringsAsFactors = FALSE
        ), 
        error = function(e) {
            NULL
        }
    )
    
    return(official)
}

# Small function to extract package name from strings:
extractPackageName <- function(x) {
    x <- strsplit(x, "[_]")
    x <- sapply(x, "[", 1)
    return(x)
}
# Small function to parse the string defining officical Rstox-package versions (for each RstoxFramwork):
extractPackageNameAsNames <- function(x) {
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





# Function to read the description file of an RstoxPackage
getDependencies <- function(packageName, repos = "https://cloud.r-project.org", dependencyTypes = NA, excludeStartingWith = NULL, recursive = TRUE, append = FALSE, sort = FALSE) {
    
    # Get the dependencies of the Rstox packages:
    if(identical(NA, dependencyTypes)) {
        dependencyTypes <- c("Depends", "Imports", "LinkingTo")
    }
    
    # Read the available packages:
    allAvail <- getAvailablePackages(repos = repos)
    
    # Get the dependent packages
    dependentPackages <- unique(
        unlist(
            extractDependencies(
                packageName = packageName, 
                allAvail = allAvail, 
                dependencyTypes = dependencyTypes, 
                recursive = recursive
            )$child
        )
    )
    
    if(!length(dependentPackages)) {
        return(NULL)
    }
    # Remove the intitial packageName:
    if(append) {
        dependentPackages <- c(packageName, dependentPackages)
    }
    
    # Remove other starting patterns:
    for(pattern in excludeStartingWith) {
        dependentPackages <- subset(dependentPackages, !startsWith(dependentPackages, pattern))
    }
    
    dependentPackages <- unique(dependentPackages)
    if(sort) {
        dependentPackages <- sort(dependentPackages)
    }
    
    return(dependentPackages)
}








extractDependencies <- function(packageName, allAvail, dependencyTypes, recursive = TRUE) {
    
    if(!length(packageName)) {
        return(list())
    }
    
    # Extract the dependencies of the packageName:
    onlyDependencies <- subset(allAvail, Package %in% packageName)[dependencyTypes]
    if(!nrow(onlyDependencies)) {
        warning("Package ", paste(packageName, collapse = ", "), " not present in the repos.")
    }
    
    # Paste together to prepare for parsing:
    onlyDependencies <- apply(onlyDependencies, 1, paste, collapse = ", ")
    
    # Remove annoying line spaces:
    onlyDependencies <- gsub("\n", " ", onlyDependencies)
    # Split by comma:
    onlyDependencies <- strsplit(onlyDependencies, ", |,")
    # Remove R and NA:
    onlyDependencies <- lapply(onlyDependencies, function(x) subset(x, !startsWith(x, "R ") & !startsWith(x, "R(") & x != "NA"))
    
    # Get only package names:
    #onlyDependencies <- unique(unlist(lapply(onlyDependencies, function(x) gsub(" .*$", "", x))))
    onlyDependencies <- lapply(onlyDependencies, function(x) gsub(" .*$", "", x))
    
    # Exlude base packages:
    #onlyDependencies <- exlcudeBasePackages(onlyDependencies)
    onlyDependencies <- lapply(onlyDependencies, exlcudeBasePackages)
    onlyDependencies <- onlyDependencies[lengths(onlyDependencies) > 0]
    onlyDependencies <- unique(unlist(onlyDependencies))
    
    if(length(packageName) == 1) {
        onlyDependencies <- data.table::data.table(
            parent = packageName, 
            child = onlyDependencies
        )
    }
    else if(length(packageName) > 1) {
        onlyDependencies <- data.table::data.table(
            parent = NA, 
            child = onlyDependencies
        )
    }
    
    
    if(recursive) {
        if(length(onlyDependencies)) {
            for(dep in onlyDependencies$child) {
                children <- extractDependencies(
                    dep, 
                    allAvail = allAvail, 
                    dependencyTypes = dependencyTypes
                )
                # Discard children with no children:
                children <- subset(children, lengths(children$child) > 0)
                
                if(NROW(children)) {
                    onlyDependencies <- rbind(
                        onlyDependencies, 
                        children
                    )
                }
            }
            
            return(onlyDependencies)
        }
        else {
            return(packageName)
        }
    }
    else {
        return(onlyDependencies)
    }
}





getAvailablePackages <- function(packageName = NULL, repos = "https://cloud.r-project.org", platform = NA, twoDigitRVersion = NA) {
    
    # Get the available packages in the repos:
    if(length(repos)) {
        URL <- buildReposContrib(
            repos = repos, 
            platform = platform, 
            twoDigitRVersion = twoDigitRVersion
        )
        #avail <- utils::available.packages(utils::contrib.url(repos, type = type))
        avail <- utils::available.packages(URL)
    }
    # Or locally:
    else {
        avail <- utils::installed.packages()
    }
    
    # For convenience convert to data.frame:
    avail <- as.data.frame(avail, stringsAsFactors = FALSE)
    
    ## Check for packageName not in the repos:
    #notPresent <- setdiff(packageName, avail$Package)
    #if(length(notPresent)) {
    #    if(length(repos)) {
    #        warning("The following packages were not found in the rpeos ", URL, ": ", paste(notPresent, collapse = ", "))
    #    }
    #    else {
    #        warning("The following packages are not installed: ", paste(notPresent, collapse = ", "))
    #    }
    #}
    
    # Extract the packages:
    if(length(packageName)) {
        avail <- subset(avail, Package %in% packageName)
    }
    
    return(avail)
}

exlcudeBasePackages <- function(x) {
    setdiff(x, rownames(utils::installed.packages(priority="base")))
}

# Funcction to get platform code used in the path to the package binarry:
getPlatformCode <- function(platform = NA, twoDigitRVersion = NA) {
    # Declare the output:
    platformCode <- getPlatform(platform)
    
    # Append "el-capitan" if R_3.6 on mac:
    if (platformCode == "macosx") {
        if(getTwoDigitRVersion(twoDigitRVersion) == "3.6") {
            platformCode <- paste(platformCode, "el-capitan", sep = "/")
        }
    }
    
    return(platformCode)
}

getBinaryType <- function(platform = NA, twoDigitRVersion = NA) {
    # Declare the output:
    binaryType <- paste(substr(getPlatform(platform), 1, 3), "binary", sep = ".")
    
    # Append "el-capitan" if R_3.6 on mac:
    if (platform == "macosx") {
        if(getTwoDigitRVersion(twoDigitRVersion) == "3.6") {
            binaryType <- paste(binaryType, "el-capitan", sep = ".")
        }
    }
    
    return(binaryType)
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
    
    return(platform)
}


getTwoDigitRVersion <- function(twoDigitRVersion = NA, coerceToCRANContrib = TRUE) {
    if(is.na(twoDigitRVersion)) {
        RMajor <- R.Version()$major
        RMinor <- gsub("(.+?)([.].*)", "\\1", R.Version()$minor)
        twoDigitRVersion <- paste(RMajor, RMinor, sep = ".")
    }
    
    # Conver e.g. 3.7 to 3.6 as per the listing on 
    #   url <- 'https://cloud.r-project.org/bin/windows/contrib/'
    #   filenames = getURL(url, ftp.use.epsv = FALSE, dirlistonly = TRUE)
    #   strsplit(filenames, "\n", fixed = TRUE)[[1]]
    # and on
    #   url <- 'https://cloud.r-project.org/bin/macosx/el-capitan/contrib/'
    #   filenames = getURL(url, ftp.use.epsv = FALSE, dirlistonly = TRUE)
    #   strsplit(filenames, "\n", fixed = TRUE)[[1]]
    # and
    #   url <- 'https://cloud.r-project.org/bin/macosx/contrib/'
    #   filenames = getURL(url, ftp.use.epsv = FALSE, dirlistonly = TRUE)
    #   strsplit(filenames, "\n", fixed = TRUE)[[1]]
    
    if(coerceToCRANContrib) {
        if(twoDigitRVersion < "3.6") {
            stop("R 3.6 is the minimum required R version for StoX")
        }
        else if(twoDigitRVersion >= "3.6" && twoDigitRVersion < "4.0") {
            twoDigitRVersion <- "3.6"
        }
        if(twoDigitRVersion > "4.1") {
            stop("StoX does not support R > 4.1")
        }
    }
    
    return(twoDigitRVersion)
}



# Function to build one installation line with install.packages():
getPackageBinaryURL <- function(packageName, version = NULL, repos = "https://cloud.r-project.org", platform = NA, twoDigitRVersion = NA, skip.identical = FALSE) {
    # https://stoxproject.github.io/repo/bin/windows/contrib/4.0/RstoxData_1.0.9.zip
    # windows:
    # https://stoxproject.github.io/repo/bin/windows/contrib/<R-ver>/<package_name>_<ver>.zip
    # macos-R3.6:
    # https://stoxproject.github.io/repo/bin/macosx/el-capitan/contrib/3.6/<package_name>_<ver>.tgz
    # macos-R4.0:
    # https://stoxproject.github.io/repo/bin/macosx/contrib/4.0/<package_name>_<ver>.tgz
    
    # Get the available packages in the repos:
    avail <- getAvailablePackages(
        packageName = packageName, 
        repos = repos, 
        #type = getBinaryType(
        platform = platform, 
        twoDigitRVersion = twoDigitRVersion
        #)
    ) 
    
    
    # Overwrite versions if given:
    for(ind in seq_along(version)) {
        if(names(version)[ind] %in% avail$Package) {
            avail[avail$Package == names(version)[ind], ]$Version <- version[[ind]]
        }
    }
    
    # Get the R version as two digit string:
    twoDigitRVersion <- getTwoDigitRVersion(twoDigitRVersion)
    
    # Get the file extension:
    fileExt <- getBinaryFileExt(platform)
    
    # Build the path to the package binary:
    pathSansExt <- paste(
        buildReposContrib(
            repos = repos, 
            platform = platform, 
            twoDigitRVersion = twoDigitRVersion
        ), 
        getPackageNameAndVersionString(avail$Package, avail$Version), 
        sep = "/"
    )
    names(pathSansExt) <- rownames(avail)
    
    # Subset to only those that differ from the installed version:
    if(skip.identical) {
        pathSansExt <- subsetBinaryPathsByIdenticallyInstalled(pathSansExt)
    }
    
    if(length(pathSansExt)) {
        # Add file extension:
        path <- structure(paste(pathSansExt, fileExt, sep = "."), names = names(pathSansExt))
    }
    else {
        return(NULL)
    }
    
    return(path)
}

getBinaryFileExt <- function(platform = NA) {
    platform <- getPlatform(platform)
    
    if (platform == "windows") {
        fileExt <- "zip"
    }
    else if (platform == "macosx") {
        fileExt <- "tgz"
    }
    
    return(fileExt)
}

buildReposContrib <- function(repos = "https://cloud.r-project.org", platform = NA, twoDigitRVersion = NA) {
    
    # Get the two digit R version, as it is used several places below:
    twoDigitRVersion <- getTwoDigitRVersion(twoDigitRVersion)
    
    reposContrib <- paste(
        repos, 
        "bin", 
        getPlatformCode(
            platform = platform, 
            twoDigitRVersion = twoDigitRVersion
        ), 
        "contrib", 
        twoDigitRVersion, 
        sep = "/"
    )
    
    return(reposContrib)
}


vector2json <- function(x) {
    paste0("[", paste(sapply(x, deparse), collapse = ","), "]")
}


replace4backslashWithOneForward <- function(x) {
    x <- gsub("\\", "/", x, fixed = TRUE)
    return(x)
}



initLocalLibrary <- function() {
    # Check that we are on Windows:
    if (.Platform$OS.type == "windows") {
        # If no non-programfiles libraries, create the same that Rstudio creates:
        lib <- .libPaths()
        
        writable <- file.access(lib, mode = 2) == 0
        #if(!any(writable) || !writable[1]) {
        if(!writable[1]) {
            homeFolder <- utils::readRegistry(key="Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders", hive="HCU")$Personal
            twoDigitRVersion <- paste(R.Version()$major, gsub("(.+?)([.].*)", "\\1", R.Version()$minor), sep = ".")
            #newLib <- paste(path.expand('~'), 'R', 'win-library', paste(R.Version()$major, gsub("(.+?)([.].*)", "\\1", R.Version()$minor), sep = "."), sep="/")
            newLib <- paste(homeFolder, 'R', 'win-library', twoDigitRVersion, sep="/")
            
            # Add the local library as the first:
            if(!dir.exists(newLib)) {
                dir.create(newLib, recursive = TRUE)
            }
            
            # Add the locacl library in this session:
            .libPaths(newLib)
        }
        else {
            newLib <- .libPaths()
        }
        
        return(newLib)
    }
    else {
        return(NA)
    }
}


