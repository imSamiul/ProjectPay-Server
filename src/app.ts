import express from "express";
import cors from "cors";
import clientRoutes from "./routes/clientRoutes";
import path from "path";

require("dotenv").config({
  path: path.resolve(__dirname, "../config/dev.env"),
});

require("./db/mongoose");

const app = express();
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(clientRoutes);

export default app;
