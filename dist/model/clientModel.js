"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("./userModel"));
const clientSchema = new mongoose_1.default.Schema({
    // Specific fields for the client
    projects: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Project',
        },
    ], // List of project IDs connected to the client
}, {
    timestamps: true,
});
// Use discriminator to extend the base schema for clients
const Client = userModel_1.default.discriminator('client', clientSchema);
exports.default = Client;
