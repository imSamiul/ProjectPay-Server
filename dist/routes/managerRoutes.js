"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const managerController_1 = require("../controller/managerController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// GET:
router.get('/manager/projects', auth_1.default, managerController_1.getManagerProjects);
// POST:
// PATCH:
// DELETE:
exports.default = router;
