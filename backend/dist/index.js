"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const products_routes_1 = __importDefault(require("./routes/products.routes"));
const app = (0, express_1.default)();
var corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(routes_1.default);
app.use((0, cookie_session_1.default)({
    name: "shop-session",
    secret: "COOKIE_SECRET",
    httpOnly: true,
    sameSite: 'strict'
}));
app.use('/user', user_routes_1.default);
app.use('/products', products_routes_1.default);
app.listen(process.env.PORT, () => {
    console.log(`listening port number #${process.env.PORT}`);
});
