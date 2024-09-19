import express from "express";
import { createClient, getClientList } from "../controller/clientController";

const router = express.Router();

router.route("/client").post(createClient).get(getClientList);

export default router;
