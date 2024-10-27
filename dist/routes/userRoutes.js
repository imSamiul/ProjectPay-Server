"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// GET:
router.get('/user/me', auth_1.default, userController_1.getUserDetails);
// POST:
router.post('/user/signUp', userController_1.createUser);
router.post('/user/login', userController_1.loginUser);
router.post('/user/logout', auth_1.default, userController_1.logOutUser);
// PATCH:
// DELETE:
exports.default = router;
