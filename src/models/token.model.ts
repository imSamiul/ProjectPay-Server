import { model, Schema } from 'mongoose';

import ms from 'ms';
import { TokenModel, TToken, TTokenMethods } from '../types/token.type';

// Define base UserType schema
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE ?? '7d';
const tokenSchema = new Schema<TToken, TokenModel, TTokenMethods>(
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
const Token = model<TToken, TokenModel>('Token', tokenSchema);

export default Token;
