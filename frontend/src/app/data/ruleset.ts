export class RuleBase {
    negate?: boolean;
}

export class RuleCollection extends RuleBase {
    condition: string;
    rules: RuleBase[];
}

export class Rule extends RuleBase {
    field: string;
    operator: string;
    value: string;
}

