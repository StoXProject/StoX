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

export class AcousticLayer {
    Layer : string;
    MinLayerDepth : string;
    MaxLayerDepth : string;
}

export class AcousticLayerData {
    AcousticLayer : AcousticLayer[];
}

export class BioticAssignment {
    PSU : string;
    Layer : string;
    Haul : string; 
    WeightingFactor : string; // Must be string pga R Inf
}

export class BioticAssignmentData {
    BioticAssignment : BioticAssignment[];
}
