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
exports.searchProject = searchProject;
exports.getProjectDetails = getProjectDetails;
exports.createNewProject = createNewProject;
exports.updateProjectStatus = updateProjectStatus;
exports.updateProjectDetails = updateProjectDetails;
exports.deleteProject = deleteProject;
const projectModel_1 = __importDefault(require("../model/projectModel"));
const managerModel_1 = __importDefault(require("../model/managerModel"));
const uuidGenerator_1 = require("../utils/uuidGenerator");
const fuse_js_1 = __importDefault(require("fuse.js"));
const paymentModel_1 = __importDefault(require("../model/paymentModel"));
// Helper function to extract allowed updates
const extractAllowedUpdates = (body) => {
    const allowedUpdates = [
        'name',
        'budget',
        'advance',
        'clientName',
        'clientPhone',
        'clientEmail',
        'clientAddress',
        'clientDetails',
        'endDate',
        'demoLink',
        'typeOfWeb',
        'description',
    ];
    return allowedUpdates.reduce((acc, key) => {
        if (key in body) {
            acc[key] = body[key];
        }
        return acc;
    }, {});
};
// GET: search project for manager
function searchProject(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const searchQuery = req.query.q;
        if (!searchQuery || typeof searchQuery !== 'string') {
            return res.status(400).json({ message: 'Search query is required' });
        }
        try {
            const projectManagerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const projects = yield projectModel_1.default.find({
                projectManager: projectManagerId,
            });
            const options = {
                includeScore: true,
                keys: ['name', 'projectCode'],
                threshold: 0.3,
            };
            const fuse = new fuse_js_1.default(projects, options);
            const result = fuse.search(searchQuery);
            const matchedProjects = result.map((res) => res.item);
            res.status(200).json(matchedProjects);
        }
        catch (error) {
            res.status(500).send({
                message: error instanceof Error ? error.message : 'Failed to fetch projects',
            });
        }
    });
}
// GET: get the project details
function getProjectDetails(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const projectCode = req.params.projectCode;
            const project = yield projectModel_1.default.findOne({ projectCode })
                .populate({
                path: 'projectManager',
                select: '-_id -managerProjects -phone -userType -clientList',
            })
                .populate('paymentList');
            if (!project) {
                return res.status(404).send('Project not found');
            }
            res.status(200).send(project);
        }
        catch (error) {
            res.status(500).send({
                message: error instanceof Error
                    ? error.message
                    : 'Failed to fetch project details',
            });
        }
    });
}
// POST: create a new project
function createNewProject(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const projectData = extractAllowedUpdates(req.body);
            const { startDate, status } = req.body;
            let projectCode;
            let existingProjectCode;
            do {
                projectCode = (0, uuidGenerator_1.generateUUID)();
                existingProjectCode = yield projectModel_1.default.findOne({ projectCode });
            } while (existingProjectCode);
            const newProject = new projectModel_1.default(Object.assign(Object.assign({ projectCode }, projectData), { startDate,
                status, projectManager: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }));
            const existingProject = yield projectModel_1.default.findOne({ name: projectData.name });
            if (existingProject) {
                return res.status(400).send('Project already exists');
            }
            const savedProject = yield newProject.save();
            if (savedProject) {
                yield managerModel_1.default.findOneAndUpdate({
                    _id: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
                    userType: 'project manager',
                }, {
                    $push: { managerProjects: savedProject._id },
                });
            }
            res.status(201).send(savedProject);
        }
        catch (error) {
            res.status(500).send({
                message: error instanceof Error ? error.message : 'Failed to create project',
            });
        }
    });
}
// PATCH: Update project complete status
function updateProjectStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const projectCode = req.params.projectCode;
            const { status } = req.body;
            const updatedProject = yield projectModel_1.default.findOneAndUpdate({ projectCode }, { status }, { new: true });
            if (!updatedProject) {
                return res.status(404).send('Project not found');
            }
            res.status(200).send(updatedProject);
        }
        catch (error) {
            res.status(500).send({
                message: error instanceof Error
                    ? error.message
                    : 'Failed to update project status',
            });
        }
    });
}
// PATCH: update project details
function updateProjectDetails(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const projectCode = req.params.projectCode;
        const updates = extractAllowedUpdates(req.body);
        if (Object.keys(updates).length === 0) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }
        try {
            const project = yield projectModel_1.default.findOne({ projectCode });
            if (!project) {
                return res.status(404).send({ error: 'Project not found' });
            }
            const updatedProject = yield projectModel_1.default.findOneAndUpdate({ projectCode }, Object.assign(Object.assign({}, updates), { due: updates.budget
                    ? updates.budget - ((_a = updates.advance) !== null && _a !== void 0 ? _a : 0) - project.totalPaid
                    : project.due }), { new: true, runValidators: true });
            res.status(200).send(updatedProject);
        }
        catch (error) {
            res.status(500).send({
                message: error instanceof Error
                    ? error.message
                    : 'Failed to update project details',
            });
        }
    });
}
// DELETE: delete project
function deleteProject(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const projectId = req.params.projectId;
            const project = yield projectModel_1.default.findOneAndDelete({ _id: projectId });
            if (!project) {
                return res.status(404).send('Project not found');
            }
            // Get payment IDs from the deleted project's paymentList field
            const paymentIds = project.paymentList;
            // Delete all payments related to the project using the IDs in paymentList
            yield paymentModel_1.default.deleteMany({ _id: { $in: paymentIds } });
            res.status(200).send(project);
        }
        catch (error) {
            res.status(500).send({
                message: error instanceof Error ? error.message : 'Failed to delete project',
            });
        }
    });
}
