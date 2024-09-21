import mongoose from 'mongoose';
import User from './userModel';

const clientSchema = new mongoose.Schema({
    // Specific fields for the client
    projects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
    ], // List of project IDs connected to the client
});

// Use discriminator to extend the base schema for clients
const Client = User.discriminator('client', clientSchema);

export default Client;
