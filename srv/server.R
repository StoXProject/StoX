# windows doesnt have native encoding UTF-8, (R uses native encoding)
# options ensures that project.json is written as utf-8
options(encoding = "UTF-8")
# Reading resource files in rstoxdata requires locale utf8 on all os.
Sys.setlocale(category = "LC_ALL", locale = "UTF-8")
# convert hexa string to char
hex2char <- function(h){
  s <- strsplit(h, "")[[1]]
  out <- rawToChar(as.raw(as.hexmode(paste0(s[c(TRUE, FALSE)], s[c(FALSE, TRUE)]))))
  # encode data retrieved from socket as utf8, so that gui can i.e create projects with æøå
  Encoding(out) <- "UTF-8"
  return(out);
}
# convert char to hexa string
char2hex <- function(c) {
   # encode data sent to socket as utf8, so that gui can view projects (including filter and project name) with æøå
    Encoding(c) <- "UTF-8"
    paste0(charToRaw(c), collapse='')
}

# read and decode client chunks with length handshake
# client must send in hexa mode
read.socket.all <- function(s) {
    maxlen <- 256L
    len <- read.socket(s, maxlen)
    #print(paste('length received ', len))
    write.socket(s, len); # tell client to continue
    nChunks <- ((as.numeric(len) - 1) %/% maxlen) + 1
    buf = ''
    # read nChunks chunks and concatenate
    for(c in 1:nChunks) { #throttle
        buf <- paste0(buf, read.socket(s, maxlen))
        #print(paste('throttle step' , buf))
    }
    hex2char(buf) # decode hexa mode
}

# write to client
write.socket.all <- function(s, r){
    r <- char2hex(r) #Encoding string in hex
    # sending the number of characters in the content.
    respl <- as.character(nchar(r)) 
    #print(paste('sending response length', respl))
    write.socket(s, respl)
    resplr <- read.socket(s) # wait for client berfore sending response
    #print(paste('received response length handshake', resplr))
    write.socket(s, r);
}

handle <- function(cmd){
    # Service command/response handler
    eval(parse(text=cmd))
}

# runFunction service - loop and wait on socket 
#Sys.sleep(5) #socket creation delay to test the connection timeout
s <- make.socket(host='localhost',port=6312,server=TRUE)
while(TRUE) {

    cmd <- read.socket.all(s)
    #print(paste0('received cmd ', cmd))
    if (nchar(cmd)==0) {
        # client control command. called when client connection ends
        break
    }
    # Service command/response handler
    r <- NULL
    tryCatch({
       r <- handle(cmd)
    },error=function(e){
       r <- e
    })
    # Transfer bytes as text over socket
    r <- as.character(r)
    # handle empty value - socket needs something in response, at least one byte
    # NA, character(0) or character=""
    if(is.na(r) || length(r) == 0 || !nchar(r)) { 
        r <- " " # avoid empty string which leads to hang of application. 
    }
    write.socket.all(s, r)
}
