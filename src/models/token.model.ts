import { model, Schema } from 'mongoose';

import ms from 'ms';
import { Token, TokenMethods, TokenModel } from '../types/token.type';

// Define base UserType schema
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE ?? '7d';
const tokenSchema = new Schema<Token, TokenModel, TokenMethods>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expirationTime: {
      type: Date,
      expires: ms(refreshTokenLife) / 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Create the base model
const TokenModel = model<Token, TokenModel>('Token', tokenSchema);

export default TokenModel;
