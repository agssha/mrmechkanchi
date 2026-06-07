class ApiResponse {
    /**
     * Send standard success response
     * @param {Object} res Express response object
     * @param {String} message Feedback message
     * @param {Object} data Output payload data
     * @param {Number} statusCode HTTP status code (default 200)
     */
    static success(res, message, data = {}, statusCode = 200) {
        // If data has already custom key or is array, we merge.
        // Let's make sure it matches existing frontend expectations perfectly.
        const responsePayload = {
            message,
            ...data
        };
        return res.status(statusCode).json(responsePayload);
    }

    /**
     * Send standard error response
     * @param {Object} res Express response object
     * @param {String} message Error message
     * @param {Number} statusCode HTTP status code (default 500)
     * @param {Object} details Detailed error information (optional)
     */
    static error(res, message, statusCode = 500, details = null) {
        const responsePayload = {
            message,
            ...(details && { error: details })
        };
        return res.status(statusCode).json(responsePayload);
    }
}

module.exports = ApiResponse;
