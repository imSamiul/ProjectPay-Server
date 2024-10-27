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
exports.getManagerProjects = getManagerProjects;
const projectModel_1 = __importDefault(require("../model/projectModel"));
// GET:
// get all projects for manager
function getManagerProjects(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { pageParam = 1, limit = 10 } = req.query;
        const pageNumber = Number(pageParam);
        const limitNumber = Number(limit);
        try {
            const projects = yield projectModel_1.default.find({ projectManager: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber);
            res.status(200).send({ projects });
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
// POST:
// PATCH:
// DELETE:
