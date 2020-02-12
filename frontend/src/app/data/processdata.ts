export class Stratum_PSU {
    Stratum : string;
    PSU : string;
}

export class EDSU_PSU {
    PSU : string;
    EDSU : string;
}
export class Stratum {
    Stratum : string;
}

export class AcousticPSU {
    Stratum_PSU : Stratum_PSU[];
    EDSU_PSU : EDSU_PSU[];
    Stratum : Stratum[];
}
