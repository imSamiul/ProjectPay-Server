import mongoose from 'mongoose';
import { ProjectType } from '../types/projectDocumentType';

const projectSchema = new mongoose.Schema<ProjectType>(
  {
    projectId: {
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
      validate: {
        validator: function (value: number) {
          return value >= 0;
        },
        message: 'Budget must be a positive number',
      },
    },
    advance: {
      type: Number,
      required: true,
      validate: {
        validator: function (value: number) {
          return value >= 0 && value <= this.budget;
        },
        message:
          'Advance must be a positive number and less than or equal to the budget',
      },
    },
    due: {
      type: Number,

      validate: {
        validator: function (value: number) {
          return value >= 0 && value <= this.budget;
        },
        message:
          'Due must be a positive number and less than or equal to the budget',
      },
    },

    client: {
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
      },
    ],
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.pre('save', function (next) {
  this.due = this.budget - this.advance;
  next();
});

const Project = mongoose.model<ProjectType>('Project', projectSchema);

export default Project;
