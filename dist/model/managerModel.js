"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("./userModel"));
const managerSchema = new mongoose_1.default.Schema({
    managerProjects: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Project',
        },
    ], // List of project IDs connected to the client
    clientList: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Client',
        },
    ],
}, {
    timestamps: true,
});
// Update: Pass UserModel instead of IUser
const ProjectManager = userModel_1.default.discriminator('project manager', managerSchema);
exports.default = ProjectManager;
