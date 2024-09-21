import mongoose from 'mongoose';
import validator from 'validator';

// Define base user schema
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            trim: true,
            validate: (value: string) => {
                if (validator.contains(value.toLowerCase(), 'password')) {
                    throw new Error('Password cannot contain "password"');
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        phone: {
            type: String,
            required: true,
            trim: true,
        },
    },

    {
        discriminatorKey: 'userType',
        timestamps: true,
    }
);

// Create the base model
const User = mongoose.model('User', userSchema);

export default User;
