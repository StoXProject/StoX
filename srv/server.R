
# read all chunks and throttle with client handshake
read.socket.all <- function(s) {
    maxlen <- 256L
    len <- read.socket(s, maxlen)
    #print(paste('length received ', len))
    write.socket(s, len); # tell client to continue
    nChunks <- ((as.numeric(len) - 1) %/% maxlen) + 1
    buf = ''
    # read nChunks chunks and concatenate
    for(c in 1:nChunks) {
        buf <- paste0(buf, read.socket(s, maxlen))
        #print(paste('throttle step' , buf))
    }
    buf
}

# write all chunks and client handshake (client will throttle)
write.socket.all <- function(s, r){
    respl <- as.character(nchar(r))
    #print(paste('sending response length', respl))
    write.socket(s, respl)
    resplr <- read.socket(s) # wait for client berfore sending response
    #print(paste('received response length handshake', resplr))
    write.socket(s, paste0(r));
    
}

handle <- function(cmd){
    # Service command/response handler
    try(RstoxAPI::runFunction.JSON(cmd))
}

# runFunction service - loop and wait on socket
s <- make.socket(host='localhost',port=6312,server=TRUE)
while(TRUE) {

    cmd <- read.socket.all(s)
    #print(paste0('received cmd ', cmd))
    if (nchar(cmd)==0) {
        # client control command. called when client connection ends
        break
    }
    # Service command/response handler
    r <- handle(cmd)
    write.socket.all(s, r)
}
