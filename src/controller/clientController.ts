import { Request, Response } from "express";
import { Client } from "../model/clientModel";

export const createClient = async (req: Request, res: Response) => {
  console.log(req.body);

  const { clientName, clientEmail, clientPhone } = req.body;
  const createClient = new Client({
    name: clientName,
    email: clientEmail,
    phone: clientPhone,
  });
  try {
    const user = await Client.findOne({ email: clientEmail });
    if (user) {
      return res.status(400).send("Email already exists");
    }
    const newClient = await createClient.save();
    res.status(201).send({ newClient });
  } catch (error) {
    let errorMessage = "Failed to do something exceptional";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).send({ message: errorMessage });
  }
};
