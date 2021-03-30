export class SubjectAction {

    action: string;
    data: any;

    public constructor(action: string, data: any) {
        this.action = action;
        this.data = data;
    }

    public static of(action: string, data: any) {
        return new SubjectAction(action, data);
    }
}