export class StratumPSU {
    stratum : string;
    psu : string;
}

export class PSUEDSU {
    psu : string;
    edsu : string;
}

export class AcousticPSU {
    stratumPSU : StratumPSU[];
    psuEdsu : StratumPSU[];
    stratum : string; // should be array.
}
