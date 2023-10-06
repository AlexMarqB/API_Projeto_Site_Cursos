import { BaseError } from "./base-error";

export class UnauthorizedError extends BaseError {
    public readonly status: number;

    constructor(message: string) {
        super(message)
        this.status = 401

    }
}