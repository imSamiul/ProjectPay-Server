import mongoose from "mongoose";
import { ProjectType } from "../types/project-document-type";

const projectSchema = new mongoose.Schema<ProjectType>(
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
    startDate: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split("T")[0],
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
    clients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "client",
      },
    ],
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paymentList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
  },
  {
    timestamps: true,
  },
);

projectSchema.index({ projectManager: 1, createdAt: -1 });
projectSchema.index({ name: "text", projectCode: "text" });

projectSchema.pre("save", function (next) {
  if (this.isNew) {
    this.due = this.budget - this.advance;
  }
  next();
});

projectSchema.path("budget").validate(function (value: number) {
  return value >= 0;
}, "Budget must be a positive number");

projectSchema.path("advance").validate(function (value: number) {
  return value >= 0 && value <= this.get("budget");
}, "Advance must be a positive number and less than or equal to the budget");

projectSchema.path("due").validate(function (value: number) {
  return value >= 0 && value <= this.get("budget");
}, "Due must be a positive number and less than or equal to the budget");

projectSchema.path("totalPaid").validate(function (value: number) {
  return (
    value >= 0 &&
    value <= this.get("budget") &&
    value <= this.get("budget") - this.get("advance")
  );
}, "Total Paid must be a positive number and less than or equal to the budget");

projectSchema.methods.reCalculateAll = async function () {
  const result = await this.model("Payment").aggregate([
    {
      $match: {
        projectId: this._id,
      },
    },
    {
      $group: {
        _id: "$projectId",
        totalPaid: {
          $sum: "$paymentAmount",
        },
      },
    },
  ]);

  this.totalPaid = result[0]?.totalPaid || 0;
  this.due = this.budget - this.advance - this.totalPaid;

  await this.save();
  return this;
};

const Project = mongoose.model<ProjectType>("Project", projectSchema);

export default Project;
