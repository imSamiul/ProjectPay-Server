import { Request, Response } from 'express';
import Client from '../model/clientModel';

// POST:
// Create a new client
export const createClient = async (req: Request, res: Response) => {
    const { name, email, phone, password, userType } = req.body;

    try {
        const user = await Client.findOne({ email });
        if (user) {
            return res.status(400).send('Email already exists');
        }

        const newClient = new Client({
            name,
            email,
            phone,
            password,
            userType,
        });
        const savedClient = await newClient.save();
        res.status(201).send({ savedClient });
    } catch (error) {
        let errorMessage = 'Failed to do something exceptional';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        res.status(500).send({ message: errorMessage });
    }
};

// GET:

// Get all clients
export async function getClientList(req: Request, res: Response) {
    try {
        const clientsList = await Client.find();
        res.status(200).send({ clientsList });
    } catch (error) {
        let errorMessage = 'Failed to load the client list';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        res.status(500).send({ message: errorMessage });
    }
}
