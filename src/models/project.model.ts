import mongoose from 'mongoose';
import { Project, ProjectMethods, ProjectModel } from '../types/project.type';

const projectSchema = new mongoose.Schema<
  Project,
  ProjectModel,
  ProjectMethods
>(
  {
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
      },
    ],
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

projectSchema.pre('save', function (next) {
  if (this.isNew) {
    // Only calculate due when creating a new project
    this.due = this.budget - this.advance;
  }

  next();
});

projectSchema.path('budget').validate(function (value: number) {
  return value >= 0;
}, 'Budget must be a positive number');

projectSchema.path('advance').validate(function (value: number) {
  return value >= 0 && value <= this.get('budget');
}, 'Advance must be a positive number and less than or equal to the budget');

projectSchema.path('due').validate(function (value: number) {
  return value >= 0 && value <= this.get('budget');
}, 'Due must be a positive number and less than or equal to the budget');

projectSchema.path('totalPaid').validate(function (value: number) {
  return (
    value >= 0 &&
    value <= this.get('budget') &&
    value <= this.get('budget') - this.get('advance')
  );
}, 'Total Paid must be a positive number and less than or equal to the budget');

projectSchema.methods.reCalculateAll = async function () {
  // this.due = this.budget - this.advance;

  const result = await this.model('Payment').aggregate([
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

  this.totalPaid = result[0]?.totalPaid || 0;
  this.due = this.budget - this.advance - this.totalPaid;

  await this.save();
  return this;
};

const ProjectModel = mongoose.model<Project, ProjectModel>(
  'Project',
  projectSchema
);

export default ProjectModel;
