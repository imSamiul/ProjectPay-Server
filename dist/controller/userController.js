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
exports.createUser = void 0;
exports.getClientList = getClientList;
exports.getUserDetails = getUserDetails;
exports.loginUser = loginUser;
exports.logOutUser = logOutUser;
const clientModel_1 = __importDefault(require("../model/clientModel"));
const managerModel_1 = __importDefault(require("../model/managerModel"));
const userModel_1 = __importDefault(require("../model/userModel"));
// GET:
// Get all clients
function getClientList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const clientsList = yield clientModel_1.default.find();
            res.status(200).send({ clientsList });
        }
        catch (error) {
            let errorMessage = 'Failed to load the client list';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(500).send({ message: errorMessage });
        }
    });
}
// Get the user details
function getUserDetails(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.status(200).send({ user: req.user });
        }
        catch (error) {
            let errorMessage = 'Failed to load the client list';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(500).send({ message: errorMessage });
        }
    });
}
// POST:
// Create a new client
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, password, userType } = req.body;
    console.log(req.body);
    try {
        let newUser;
        switch (userType) {
            case 'client':
                newUser = new clientModel_1.default({
                    name,
                    email,
                    phone,
                    password,
                });
                break;
            case 'project manager':
                newUser = new managerModel_1.default({
                    name,
                    email,
                    phone,
                    password,
                });
                break;
            default:
                return res.status(400).send('Invalid user type');
        }
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already exists');
        }
        if (!newUser) {
            return res.status(500).send('Failed to create user');
        }
        const token = yield newUser.generateAuthToken();
        if (!token) {
            return res.status(500).send('Failed to generate token');
        }
        const savedUser = yield newUser.save();
        res.status(201).send({ user: savedUser, token });
    }
    catch (error) {
        let errorMessage = 'Failed to do something exceptional';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).send({ message: errorMessage });
    }
});
exports.createUser = createUser;
// Login User
function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        try {
            const loginSuccessful = yield userModel_1.default.findByCredentials(email, password);
            if (!loginSuccessful) {
                return res.status(400).send('Invalid email or password');
            }
            const token = yield loginSuccessful.generateAuthToken();
            res.status(201).send({ user: loginSuccessful, token });
        }
        catch (error) {
            let errorMessage = 'Failed to do something exceptional';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(500).send({ message: errorMessage });
        }
    });
}
// Logout User
function logOutUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const checkIfTokenExists = req.user.tokens.find((token) => {
                return token.token === req.token;
            });
            if (!checkIfTokenExists) {
                throw new Error('Token does not exist');
            }
            req.user.tokens = req.user.tokens.filter((token) => {
                return token.token !== req.token;
            });
            yield req.user.save();
            res.status(200).send('Logged out successfully');
        }
        catch (error) {
            let errorMessage = 'Failed to do something exceptional';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(500).send({ message: errorMessage });
        }
    });
}
// PATCH:
// DELETE:
