export abstract class BaseError extends Error {
    public readonly status: number;
    constructor(message: string) {
        super(message);
        this.status = 500;
    }
}