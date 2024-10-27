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
const mongoose_1 = __importDefault(require("mongoose"));
const projectSchema = new mongoose_1.default.Schema({
    projectCode: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    advance: {
        type: Number,
        required: true,
    },
    due: {
        type: Number,
        default: 0,
    },
    totalPaid: {
        type: Number,
        default: 0,
    },
    clientName: {
        type: String,
        required: true,
        ref: 'Client',
    },
    clientPhone: {
        type: String,
        required: true,
    },
    clientEmail: {
        type: String,
        required: true,
    },
    clientAddress: {
        type: String,
    },
    clientDetails: {
        type: String,
    },
    startDate: {
        type: String,
        required: true,
        default: new Date().toISOString().split('T')[0],
    },
    endDate: {
        type: String,
        required: true,
    },
    demoLink: {
        type: String,
    },
    typeOfWeb: {
        type: String,
    },
    description: {
        type: String,
    },
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
    verifiedClientList: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Client',
        },
    ],
    projectManager: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    paymentList: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Payment',
        },
    ],
}, {
    timestamps: true,
});
projectSchema.pre('save', function (next) {
    if (this.isNew) {
        // Only calculate due when creating a new project
        this.due = this.budget - this.advance;
    }
    next();
});
projectSchema.path('budget').validate(function (value) {
    return value >= 0;
}, 'Budget must be a positive number');
projectSchema.path('advance').validate(function (value) {
    return value >= 0 && value <= this.get('budget');
}, 'Advance must be a positive number and less than or equal to the budget');
projectSchema.path('due').validate(function (value) {
    return value >= 0 && value <= this.get('budget');
}, 'Due must be a positive number and less than or equal to the budget');
projectSchema.path('totalPaid').validate(function (value) {
    console.log(this.get('budget'), this.get('advance'), value);
    return (value >= 0 &&
        value <= this.get('budget') &&
        value <= this.get('budget') - this.get('advance'));
}, 'Total Paid must be a positive number and less than or equal to the budget');
projectSchema.methods.reCalculateAll = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // this.due = this.budget - this.advance;
        var _a;
        const result = yield this.model('Payment').aggregate([
            {
                $match: {
                    projectId: this._id,
                },
            },
            {
                $group: {
                    _id: '$projectId',
                    totalPaid: {
                        $sum: '$paymentAmount',
                    },
                },
            },
        ]);
        this.totalPaid = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalPaid) || 0;
        this.due = this.budget - this.advance - this.totalPaid;
        yield this.save();
        return this;
    });
};
const Project = mongoose_1.default.model('Project', projectSchema);
exports.default = Project;
