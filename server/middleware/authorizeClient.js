const asyncHandler  = require('express-async-handler');


const authorizeClient = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "client") {
        res.status(403);
        throw new Error(`You are not authorized to view this page as a ${req.user.role}`);
    }
    next();
});

module.exports = authorizeClient;