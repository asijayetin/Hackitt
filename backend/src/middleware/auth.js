const jwt = require("jsonwebtoken");

function protect(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Please login first" });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

function organizerOnly(req, res, next) {
    if (!req.user || req.user.role !== "organizer") {
        return res.status(403).json({ message: "Organizer access required" });
    }
    next();
}

function studentOnly(req, res, next) {
    if (!req.user || req.user.role !== "student") {
        return res.status(403).json({ message: "Student access required" });
    }
    next();
}

module.exports = { protect, organizerOnly, studentOnly };
