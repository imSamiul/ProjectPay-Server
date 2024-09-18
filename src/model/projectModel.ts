import mongoose from "mongoose";
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  budget: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value < 0) {
        throw new Error("Budget must be a positive number");
      }
    },
  },

  advance: {
    type: Number,
  },
  due: {
    type: Number,
  },
  payment: [
    {
      date: {
        type: Date,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  ],

  client: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Client",
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    required: true,
    default: "pending",
  },

  description: {
    type: String,
  },
});
