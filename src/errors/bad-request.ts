import { BaseError } from "./base-error";

export class BadRequestError extends BaseError {
    public readonly status: number;

    constructor(message: string) {
        super(message)
        this.status = 400

    }
}