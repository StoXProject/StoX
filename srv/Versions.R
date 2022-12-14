# To install Rstox-packages like in the GUI, run something like the following:
#source ("https://raw.githubusercontent.com/StoXProject/RstoxFramework/master/R/Versions.R")
#installOfficialRstoxPackagesWithDependencies("3.4.0")


StoxInstallSettings <- list(
    supportedRVersion = c(
        "4.2", 
        "4.1", 
        "4.0", 
        "3.6"
    )
)


#' Tools to download and install Rstox packages and dependent packages.
#' 
#' \code{getNonRstoxDependencies} gets all package dependencies ("Depends", "Imports" and "LinkingTo") of the packages given by \code{packageName}, excluding any Rstox-packages. \cr \cr
#' \code{installOfficialRstoxPackagesWithDependencies} installs the corrrect versions of Rstox-packages, and other packages that these packages depend on. This function is used by the StoX GUI. \cr \cr
#' \code{getOfficialRstoxPackageVersion} reads the OfficialRstoxFrameworkVersions.txt file for the given StoX GUI version \cr \cr
#' 
#' @inheritParams utils::install.packages
#' @param packageName The packages to get dependencies from.
#' @param dependencyTypes A character vector listing the dependencies to get, with possible values "Depends", "Imports", "LinkingTo", "Suggests", "Enhances". Default is NA, implying c("Depends", "Imports", "LinkingTo").
#' @param Rstox.repos,nonRstox.repos Either NULL to search for packages locally, or a repository passed to \code{\link[utils]{available.packages}}, where \code{Rstox.repos} is used to locate direct dependencies of the Rstox packages, and \code{nonRstox.repos} is used to get the dependencies of the direct dependencies recursively, defaulted to the CRAN repository.
#' @param dependency.repos The repository to download from.
#' @param sort Logical: If TRUE sort the dependent packages, defaulted to FALSE to enable installing the most basic dependencies first.
#' @param StoXGUIVersion The version of the StoX GUI defining the combination of official Rstox package versions.
#' @param officialRstoxPackageVersionsFile The path to the file holding the link between StoX GUI version and Rstox package versions. If missing, the file on the RstoxFramework master on GitHub is used ("https://raw.githubusercontent.com/StoXProject/RstoxFramework/master/inst/versions/OfficialRstoxFrameworkVersions.txt").
#' @param destdir The directory to download binaries to, defaulted to NA which implies tempdir().
#' @param platform The platform to download binaries for, defaulted to the current platform, but with the option to download for other platforms (possible values are "windows" and "macosx").
#' @param packageName The packages considered official Rstox pakcages, "RstoxFramework","RstoxBase" and "RstoxData".
#' @param toJSON Logical: If TRUE output a JSON string.
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
getStoxDependencies <- function(
    StoXGUIVersion, 
    officialRstoxPackageVersionsFile, 
    Rstox.repos = "https://stoxproject.github.io/repo", 
    dependency.repos = "https://cloud.r-project.org", 
    dependencyTypes = NA, 
    platform = NA, 
    quiet = FALSE
) {
    
    # Use the GitHub master as default if missing:
    if(missing(officialRstoxPackageVersionsFile)) {
        officialRstoxPackageVersionsFile <- "https://raw.githubusercontent.com/StoXProject/RstoxFramework/master/inst/versions/OfficialRstoxFrameworkVersions.txt"
    }
    
    # Set timeout to the maximum value of 24 hours:
    originalTimeout <- options("timeout")
    options(timeout = 24*60*60)
    on.exit(options(timeout = originalTimeout))
    
    #### # Step 1: Identify the Rstox-packages available for the current R version and lower supported versions: ####
    # Get the table of Rstox packages to be installed, for the current R version or lower supported R versions if the requested package version 
    
    twoDigitRVersion <- getTwoDigitRVersionForDownload()
    officialRstoxPackagesInfo <- getOfficialRstoxPackagesInfo(
        StoXGUIVersion = StoXGUIVersion, 
        officialRstoxPackageVersionsFile = officialRstoxPackageVersionsFile, 
        dependencyTypes = dependencyTypes, 
        Rstox.repos = Rstox.repos, 
        platform = platform, 
        twoDigitRVersion = twoDigitRVersion, 
        quiet = quiet
    )
    
    # Step 2: Get the list of dependencies of the Rstox-packages.
    # Make sure to use recursive = FALSE, as the table 'binaries' only contains the Rstox packages:
    direct_dependencies <- getDependencies(
        packageName = officialRstoxPackagesInfo$Package, 
        packageTable = officialRstoxPackagesInfo, 
        recursive = FALSE, 
        excludeStartingWith = "Rstox"
    )
    
    # Step 3: Install the dependencies
    dependencies <- remotes::package_deps(direct_dependencies, dependencies = c("Depends", "Imports", "LinkingTo"), repos = dependency.repos, type = getInstallType())
    
    return(
        list(
            officialRstoxPackagesInfo = officialRstoxPackagesInfo, 
            direct_dependencies = direct_dependencies,
            dependencies = data.table::as.data.table(dependencies)
        )
    )
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
    dependency.repos = "https://cloud.r-project.org", 
    dependencyTypes = NA, 
    lib = NULL, 
    sort = FALSE, 
    platform = NA, 
    toJSON = FALSE, 
    quiet = FALSE
) {
    
    # We install only binaries.
    # Step 1: Identify the Rstox-packages available for the current R version and lower supported versions, and the list of dependencies of the Rstox-packages.
    # Step 2: Install the dependencies
    # Step 3: Install the downloaded Rstox packages
    
    if(!is_online()) {
        stop("Internet connection is needed to install Rstox-packages.")
    }
    
    # Set timeout to the maximum value of 24 hours:
    originalTimeout <- options("timeout")
    options(timeout = 24*60*60)
    on.exit(options(timeout = originalTimeout))
    
    #### # Step 1: Identify the Rstox-packages available for the current R version and lower supported versions: ####
    # Get the table of Rstox packages to be installed, for the current R version or lower supported R versions if the requested package version 
    StoxDependencies <- getStoxDependencies(
        StoXGUIVersion = StoXGUIVersion, 
        officialRstoxPackageVersionsFile = officialRstoxPackageVersionsFile, 
        Rstox.repos = Rstox.repos, 
        dependency.repos = dependency.repos, 
        dependencyTypes = dependencyTypes, 
        platform = platform, 
        quiet = quiet
    )
    officialRstoxPackagesInfo <- StoxDependencies$officialRstoxPackagesInfo
    toInstall <- StoxDependencies$dependencies
    # Install only packages with lower locally installed version:
    toInstall <- subset(toInstall, toInstall$diff < 0)
    toInstall <- toInstall$package
    
    
    # Select the first library if not specified:
    if(!length(lib)) {
        lib <- .libPaths()[1]
    }
    #removeExistingPackages(toInstall$package, lib = lib)
    # Locate lockced folders:
    dirs <- list.dirs(lib, recursive = FALSE)
    lockedDirs <- subset(dirs, startsWith(basename(dirs), "00LOCK"))
    if(length(lockedDirs)) {
        warning("The directory ", lib, " contains locked folders (name starting with 00LOCK). If problems are expreienced during installation of the R pacckcages, you may try deleting such folders manually.")
    }
    if(length(toInstall)) {
        utils::install.packages(toInstall, repos = dependency.repos, type = getInstallType(), quiet = quiet, lib = lib)
    }
    
    
    # If Linux, all packages are installed from source above. Otherwise a check is made for non-installed binary packages, and an attempt to install from source:
    if (getPlatform(platform) !=  "linux") {
        installed <- utils::installed.packages()[, "Package"]
        missing <- setdiff(toInstall, installed)
        if(length(missing)) {
            message("Installing the following packages using default type:\n", paste0(missing, collapse = ", "))
            utils::install.packages(missing, repos = dependency.repos, dependencies = TRUE)
        }
    }
    
    # Step 3: Install the Rstox packages
    # Download the files to the specified directory (or to the tempdir() if not specified):
    if(length(destdir) && is.na(destdir)) {
        destdir <- replace4backslashWithOneForward(tempdir())
    }
    
    binaryLocalFiles <- paste(destdir, basename(officialRstoxPackagesInfo$Package), sep = "/")
    mapply(
        utils::download.file, 
        replace4backslashWithOneForward(officialRstoxPackagesInfo$path), 
        destfile = replace4backslashWithOneForward(binaryLocalFiles), 
        quiet = quiet
    )
    
    
    # Locate lockced folders:
    dirs <- list.dirs(lib, recursive = FALSE)
    lockedDirs <- subset(dirs, startsWith(basename(dirs), "00LOCK"))
    if(length(lockedDirs)) {
        warning("The directory ", lib, " contains locked folders (name starting with 00LOCK). If problems are expreienced during installation of the R pacckcages, you may try deleting such folders manually.")
    }
    # Then install into first of .libPaths():
    installedRstoxPackages <- utils::install.packages(binaryLocalFiles, type = getInstallType(), repos = NULL, quiet = quiet, lib = lib)
    
    allInstalledPackages <- c(
        toInstall, 
        officialRstoxPackagesInfo$Package
    )
    
    if(toJSON) {
        allInstalledPackages <- vector2json(allInstalledPackages)
    }
    return(allInstalledPackages)
}
#'
#' @export
#' @rdname installPackages
#'
getOfficialRstoxPackageVersion <- function(
    StoXGUIVersion = NULL, 
    officialRstoxPackageVersionsFile = system.file("versions", "OfficialRstoxFrameworkVersions.txt", package = "RstoxFramework"), 
    packageName = c("RstoxFramework","RstoxBase", "RstoxData"), 
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








getSupportedRVersions <- function() {
    supportedRVersion <- StoxInstallSettings$supportedRVersion
    twoDigitRVersion <- getTwoDigitRVersionForDownload()
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


subsetBinaryPathsByIdenticallyInstalled <- function(packageTable, lib = NULL) {
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
    
    # Add the
    
    
    # Create a table of the packages to install:
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




readOfficialRstoxPackageVersionsFile <- function(officialRstoxPackageVersionsFile, toTable = FALSE) {
    # Get the file name:
    if(missing(officialRstoxPackageVersionsFile) || !length(officialRstoxPackageVersionsFile)) {
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
    
    if(toTable) {
        dependencies <- strsplit(official$Dependencies, "[,]")
        dependencies <- lapply(dependencies, extractPackageNameAsNames)
        official <- data.table::data.table(
            RstoxFramework = official$RstoxFramework, 
            data.table::rbindlist(dependencies),
            Official = official$Official
        )
    }
    
    return(official)
}

## Small function to extract package name from strings:
#extractPackageName <- function(x) {
#    x <- strsplit(x, "[_]")
#    x <- sapply(x, "[", 1)
#    return(x)
#}
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



get_deps <- function(package, dependencyTypes, not = c("R", "Rstox")) {
    dcf <- read.dcf(system.file(package = package, "DESCRIPTION"))
    jj <- intersect(dependencyTypes, colnames(dcf))
    val <- unlist(strsplit(dcf[, jj], ","), use.names=FALSE)
    package <- gsub("\\s.*", "", trimws(val))
    version <- gsub(".*\\s|\\)+$", "", val)
    hits <- mapply(startsWith, prefix = not, MoreArgs = list(x = package))
    keep <- rowSums(hits) == 0
    out <- data.table::data.table(
        package = package, 
        version = version
    )
    out <- subset(out, keep)
    out
}

# Function to read the description file of an RstoxPackage
getDependencies <- function(packageName, packageTable = NULL, repos = "https://cloud.r-project.org", dependencyTypes = NA, excludeStartingWith = NULL, recursive = TRUE, append = FALSE, sort = FALSE) {
    
    # Get the dependencies of the Rstox packages:
    if(identical(NA, dependencyTypes)) {
        dependencyTypes <- c("Depends", "Imports", "LinkingTo")
    }
    if(length(repos) && is.na(repos)) {
        if(recursive)  {
            stop("repos must be given if recursive is TRUE")
        }
        
        dependentPackages <- exlcudeBasePackages(get_deps("RstoxFramework", dependencyTypes = dependencyTypes)$package)
        
    }
    else {
        # Read the available packages:
        if(!length(packageTable)) {
            packageTable <- getAvailablePackages(repos = repos)
        }
        
        # Get the dependent packages
        dependentPackages <- unique(
            unlist(
                extractDependencies(
                    packageName = packageName, 
                    packageTable = packageTable, 
                    dependencyTypes = dependencyTypes, 
                    recursive = recursive
                )$child
            )
        )
        
    }
    
    
    
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








extractDependencies <- function(packageName, packageTable, dependencyTypes, recursive = TRUE) {
    
    if(!length(packageName)) {
        return(list())
    }
    
    # Extract the dependencies of the packageName:
    onlyDependencies <- subset(packageTable, Package %in% packageName, select = dependencyTypes)
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
    onlyDependencies <- exlcudeBasePackages(onlyDependencies)
    
    if(length(packageName) == 1) {
        if(length(onlyDependencies)) {
            onlyDependencies <- data.frame(
                parent = packageName, 
                child = onlyDependencies, 
                stringsAsFactors = FALSE
            )
        }
        else {
            return(NULL)
        }
    }
    else if(length(packageName) > 1) {
        onlyDependencies <- data.frame(
            parent = NA, 
            child = onlyDependencies, 
            stringsAsFactors = FALSE
        )
    }
    
    
    if(recursive) {
        if(length(onlyDependencies)) {
            for(dep in onlyDependencies$child) {
                children <- extractDependencies(
                    dep, 
                    packageTable = packageTable, 
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


exlcudeBasePackages <- function(packageName)  {
    packageName <- lapply(packageName, exlcudeBasePackagesOne)
    packageName <- packageName[lengths(packageName) > 0]
    packageName <- unique(unlist(packageName))
    packageName
}

exlcudeBasePackagesOne <- function(packageName) {
    setdiff(packageName, rownames(utils::installed.packages(priority="base")))
}

getAvailablePackages <- function(packageName = NULL, repos = "https://cloud.r-project.org", platform = NA, twoDigitRVersion = NA) {
    
    # Get the available packages in the repos:
    if(length(repos)) {
        URL <- getBinaryPackageListURL(
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



# Function to get platform code used in the path to the package (binary if not on Linux):
getPlatformCode <- function(platform = NA, twoDigitRVersion = NA) {
    # Declare the output:
    platformCode <- getPlatform(platform)
    
    # Append "el-capitan" if R_3.6 on mac:
    if (platformCode == "macosx") {
        if(getTwoDigitRVersionForDownload(twoDigitRVersion) == "3.6") {
            platformCode <- paste(platformCode, "el-capitan", sep = "/")
        }
    }
    
    return(platformCode)
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


getTwoDigitRVersionForDownload <- function(twoDigitRVersion = NA) {
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
    
    supportedRVersion <- StoxInstallSettings$supportedRVersion
    
    if(twoDigitRVersion < min(supportedRVersion)) {
        stop("R ", min(supportedRVersion), " is the minimum supported R version for StoX")
    }
    else if(twoDigitRVersion >= min(supportedRVersion) && twoDigitRVersion <= max(supportedRVersion) && ! twoDigitRVersion %in% supportedRVersion) {
        newTwoDigitRVersion <- max(supportedRVersion[supportedRVersion <= twoDigitRVersion])
        warning("Requested R (minor) version (", twoDigitRVersion, ") was downgraded to the closest supported version (", newTwoDigitRVersion, ") when downlooading Rstox-packages.")
        twoDigitRVersion <- newTwoDigitRVersion
    }
    if(twoDigitRVersion > max(supportedRVersion)) {
        warning("R ", max(supportedRVersion), " is the latest supported R version for StoX. This was used when downloading Rstox-packages instead of the requested (", twoDigitRVersion, ").")
        twoDigitRVersion <- max(supportedRVersion)
    }

    return(twoDigitRVersion)
}



# Function to build one installation line with install.packages():
getPackageBinaryURL <- function(packageName, version = NULL, repos = "https://cloud.r-project.org", platform = NA, twoDigitRVersion = NA) {
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
    twoDigitRVersion <- getTwoDigitRVersionForDownload(twoDigitRVersion)
    
    # Build the path to the URL of the package source or binary:
    path <- getPackageURL(avail$Package, avail$Version, repos = repos, platform = platform, twoDigitRVersion = twoDigitRVersion)
    
    
    if(NROW(avail)) {
        # Add file extension:
        avail$path <- path
    }
    else {
        return(NULL)
    }
    
    return(avail)
}

getPackageFileExt <- function(platform = NA, type = c("binary", "source")) {
    
    type <- match.arg(type)
    platform <- getPlatform(platform)
    
    if (platform == "windows") {
        fileExt <- "zip"
    }
    else if (platform == "macosx") {
        fileExt <- "tgz"
    }
    else if (platform == "linux") {
        # Only source is available for Linux (generally, https://stackoverflow.com/questions/11871394/create-r-binary-packages-for-linux-that-can-be-installed-on-different-machines):
        if(type == "binary") {
            warning("Binary is not available for Linux. Using source.")
            type  <- "source"
        }
        if(type == "source") {
            fileExt <- "tar.gz"
        }
    }
    
    return(fileExt)
}



getBinaryPackageListURL <- function(repos = "https://cloud.r-project.org", platform = NA, twoDigitRVersion = NA) {
    
    # Get the two digit R version, as it is used several places below:
    twoDigitRVersion <- getTwoDigitRVersionForDownload(twoDigitRVersion)
    
    platform <- getPlatform(platform = platform)
    # Find package versions on macosx if Linux, as there are no binaries for Linux and macosx is closer to Linux than Windows:
    if (platform == "linux") {
        platform <- "macosx"
    }
    
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

getPackageURL <- function(packageName, version = NULL, repos = "https://cloud.r-project.org", platform = NA, twoDigitRVersion = NA) {
    
    # Get the two digit R version, as it is used several places below:
    twoDigitRVersion <- getTwoDigitRVersionForDownload(twoDigitRVersion)
    
    platform <- getPlatform(platform = platform)
    if (platform == "linux") {
        reposContrib <- paste(
            repos, 
            "src", 
            "contrib", 
            sep = "/"
        )
    }
    else {
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
    }
    
    pathSansExt <- paste(
        reposContrib, 
        getPackageNameAndVersionString(packageName, version), 
        sep = "/"
    )
    
    # Get the file extension:
    fileExt <- getPackageFileExt(platform)
    
    path <- paste(pathSansExt, fileExt, sep = ".")
    
    return(path)
}



















vector2json <- function(x) {
    paste0("[", paste(sapply(x, deparse), collapse = ","), "]")
}


replace4backslashWithOneForward <- function(x) {
    x <- gsub("\\", "/", x, fixed = TRUE)
    return(x)
}














#############################################################
# Used by the GUI:
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
            #newLib <- paste(homeFolder, 'R', 'win-library', twoDigitRVersion, sep="/")
            # As of R 4.2.0 the folder for the packages changed:
            # The default personal library on Windows, folder ‘R\win-library\x.y’ where ‘x.y’ stands for R release ‘x.y.z’, is now a subdirectory of Local Application Data directory (usually a hidden directory ‘C:\Users\username\AppData\Local’). Use shell.exec(.libPaths()[1]) from R to open the personal library in Explorer when it is first in the list (PR#17842).
            # Chekc R version 4.2.0 or newer:
            if(getRversion() >= "4.2.0") {
                newLib <- paste(Sys.getenv("USERPROFILE"), "AppData", "Local", "R", "win-library", twoDigitRVersion, sep="/")
            }
            else {
                newLib <- paste(homeFolder, 'R', 'win-library', twoDigitRVersion, sep="/")
            }
            
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














#############################################################
getOfficialRstoxPackagesInfo <- function(
    StoXGUIVersion, 
    officialRstoxPackageVersionsFile, 
    dependencyTypes = NA, 
    Rstox.repos = "https://stoxproject.github.io/repo", 
    platform = NA, 
    twoDigitRVersion = NA, 
    quiet = FALSE
) {
    
    # Get the official versions defined by the officialRstoxPackageVersionsFile for the particular StoXGUIVersion:
    packageHierarchy <- c("RstoxFramework","RstoxBase", "RstoxData")
    officialRstoxPackageNameAndVersion <- getOfficialRstoxPackageVersion(
        StoXGUIVersion = StoXGUIVersion, 
        officialRstoxPackageVersionsFile = officialRstoxPackageVersionsFile,
        packageName = packageHierarchy, 
        toJSON = FALSE
    )
    officialRstoxPackageName <- getOnlyPackageName(officialRstoxPackageNameAndVersion)
    officialRstoxPackageVersionList <- extractPackageNameAsNames(officialRstoxPackageNameAndVersion)
    officialRstoxPackageVersionList <- officialRstoxPackageVersionList[rev(packageHierarchy)]
    
    # If the StoX version is not official, report an error with info on how to install manually from source in R:
    if(isFALSE(as.logical(attr(officialRstoxPackageNameAndVersion, "Official")))) {
        packageHierarchy
        installCommands <- paste0(
            "remotes::install_github(repo = \"stoxproject/", 
            names(officialRstoxPackageVersionList), 
            "\", ref = \"", 
            names(officialRstoxPackageVersionList), 
            "-v", 
            unlist(officialRstoxPackageVersionList), 
            "\")"
        )
        stop("The StoX version ", StoXGUIVersion, " is not an official version. Installation of Rstox packages for non-official versions is no longer supported in the StoX GUI. It is highly recommended to use the latest official version StoX ", getLatestOfficialStoxVersion(officialRstoxPackageVersionsFile), ".\nTo install the Rstox packages for this non-official version, the following lines must be run in R. If you are using Rstudio, it is adviced to restart R before installing the Rstox packages. Also, on Windows Rtools must be installed, as the Rstox packages are installed from source by these lines:\n", paste0(installCommands, collapse = "\n"))
    }
    
    # Get the table of official Rstox package versions from the Rstox.repos:
    supportedRVersion <- getSupportedRVersions()
    binaries <- mapply(
        FUN = getPackageBinaryURL, 
        twoDigitRVersion = supportedRVersion, 
        MoreArgs = list(
            packageName = officialRstoxPackageName, 
            version = officialRstoxPackageVersionList, 
            repos = Rstox.repos, 
            platform = platform
        ), 
        SIMPLIFY = FALSE
    )
    buildRVersion <- rep(supportedRVersion, sapply(binaries, NROW))
    binaries <- do.call(rbind, binaries)
    binaries$buildRVersion <- buildRVersion
    
    # The following was slow, as it actually downloads:
    suppressWarnings(URLExists <- lapply(binaries$path, tryDownload))
    URLExists <- URLExists %in% 0
    # Check that the URLs exist and subset to only those that exist. This did not work on VPN, so we abandon it until proven r   obust:
    #URLExists <- RCurl::url.exists(binaries$path)
    binaries <- binaries[URLExists, ]
    
    # Get the latest possible:
    binaries <- binaries[!duplicated(binaries$Package), ]
    if(!all(officialRstoxPackageName %in% binaries$Package)) {
        stop("The following Rstox packages could not be found: ", paste(setdiff(officialRstoxPackageName, binaries$Package), collapse = ", "))
    }
    
    # 2022-05-11: This was rather put in as a warning in getTwoDigitRVersionForDownload(), instead of an error in getTwoDigitRVersionForDownload() as before:
    ## Give a warning if the buildRVersion not identical to the requested:
    #notIdenticalTwoDigitRVersion <- binaries$buildRVersion != twoDigitRVersion
    #if(any(notIdenticalTwoDigitRVersion)) {
    #    warning("The following Rstox packages were built under older (two digit) R versions than the current (R ", twoDigitRVersion, "): ", paste0(binaries$Package[notIdenticalTwoDigitRVersion], " v", binaries$Version[notIdenticalTwoDigitRVersion], " (R ", binaries$buildRVersion[notIdenticalTwoDigitRVersion],  ")", collapse = ", "))
    #}
    
    # Order hierarchcically:
    binaries <- binaries[match(rev(packageHierarchy), binaries$Package), ]
    
    return(binaries)
}


getLatestOfficialStoxVersion <- function(officialRstoxPackageVersionsFile) {
    official <- readOfficialRstoxPackageVersionsFile(officialRstoxPackageVersionsFile)
    utils::tail(official[official$Official, ]$StoX, 1)
}





getInstallType <- function() {
    platform <- getPlatform()
    if (platform == "linux") {
        type = "source"
    }
    else {
        type = "binary"
    }
    return(type)
}



is_online <- function(site="http://example.com/") {
    tryCatch({
        readLines(site,n=1)
        TRUE
    },
    warning = function(w) invokeRestart("muffleWarning"),
    error = function(e) FALSE)
}

