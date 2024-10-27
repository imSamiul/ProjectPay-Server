"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectController_1 = require("../controller/projectController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// GET:
router.get('/projects/search', auth_1.default, projectController_1.searchProject);
router.get('/projects/details/:projectCode', auth_1.default, projectController_1.getProjectDetails);
// POST:
// create a new project
router.post('/projects/create', auth_1.default, projectController_1.createNewProject);
// PATCH:
router.patch('/projects/updateProjectStatus/:projectCode', auth_1.default, projectController_1.updateProjectStatus);
router.patch('/projects/updateProjectDetails/:projectCode', auth_1.default, projectController_1.updateProjectDetails);
// DELETE:
router.delete('/projects/delete/:projectId', auth_1.default, projectController_1.deleteProject);
exports.default = router;
