import express from "express";
import { createClient } from "../controller/clientController";

const router = express.Router();

router.post("/client", createClient);

export default router;
