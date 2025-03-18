export declare class WailsEventType<T> {
    name: string;
    data: T;
    sender?: string;
    constructor(name: string, data: T);
}