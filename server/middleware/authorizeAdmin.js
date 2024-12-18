const asyncHandler  = require('express-async-handler');


const authorizeAdmin = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "admin") {
        res.status(403);
        throw new Error(`You are not authorized to view this page as an  ${req.user.role}`);
    }
    next();
});

module.exports = authorizeAdmin;