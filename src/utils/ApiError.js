class ApiError extends Error {
    constructor(
        statusCode,
        title = "Error",
        message = "Something Went Wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.success = false;
        this.errors = errors;
        this.title = title;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
