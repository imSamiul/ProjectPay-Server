"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const managerRoutes_1 = __importDefault(require("./routes/managerRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("./db/mongoose"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../config/dev.env'),
});
(0, mongoose_1.default)();
const app = (0, express_1.default)();
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(userRoutes_1.default);
app.use(projectRoutes_1.default);
app.use(managerRoutes_1.default);
app.use(paymentRoutes_1.default);
exports.default = app;
