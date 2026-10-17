import { RequestValidationError } from "../errors/requestValidation.error.js";

export function handleError(err: unknown): Response {
    if (err instanceof RequestValidationError) {
        return Response.json(
            { status: 400, message: 'Validation failed', issues: err.issues },
            { status: 400 }
        )
    }
    throw err
}