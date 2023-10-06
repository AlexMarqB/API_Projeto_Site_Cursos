import { BaseError } from "./base-error";

export class NotFoundError extends BaseError {
    public readonly status: number;

    constructor(message: string) {
        super(message)
        this.status = 404
    }
}