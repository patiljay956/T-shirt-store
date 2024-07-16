// try-catch wrapper for async middlewares || use promises

const bigPromise = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            next(err);
        });
    };
};

export { bigPromise };
