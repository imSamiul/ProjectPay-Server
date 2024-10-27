"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../model/userModel"));
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Authentication token is missing or invalid');
        }
        const token = authHeader.replace('Bearer ', '').trim();
        if (!token) {
            throw new Error('Authentication token is missing');
        }
        const jwtSecret = process.env.JWT_TOKEN;
        if (!jwtSecret) {
            throw new Error('JWT secret is missing in environment variables');
        }
        const { id } = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = yield userModel_1.default.findOne({ _id: id, 'tokens.token': token });
        if (!user) {
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message); // Log the error message
            res.status(401).send({ error: error.message });
        }
        else {
            console.log('An unexpected error occurred', error);
            res.status(401).send({ error: 'Not authorized to access this resource' });
        }
    }
});
exports.default = auth;
