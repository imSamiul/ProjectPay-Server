import mongoose from 'mongoose';
import { TokenType } from '../types/tokenType';

// Define base UserType schema
const tokenSchema = new mongoose.Schema<TokenType>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expirationTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the base model
const Token = mongoose.model<TokenType>('Token', tokenSchema);

export default Token;
