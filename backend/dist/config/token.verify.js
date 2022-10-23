"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config = process.env;
const verifyToken = (req, res, next) => {
    var _a;
    const token = req.body.token || req.query.token || req.headers["x-access-token"] || ((_a = req.session) === null || _a === void 0 ? void 0 : _a.token);
    console.log('checking token = ');
    console.log(token);
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config.SECRET_TOKEN);
        req.body.user = decoded;
    }
    catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};
exports.default = verifyToken;
