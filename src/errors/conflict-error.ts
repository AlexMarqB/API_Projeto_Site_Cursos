import { BaseError } from "./base-error";

export class ConflictError extends BaseError {
    public readonly status: number;

    constructor(message: string) {
        super(message)
        this.status = 409

    }
}