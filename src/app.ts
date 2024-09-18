import express from "express";
import clientRoutes from "./routes/clientRoutes";
import path from "path";

require("dotenv").config({
  path: path.resolve(__dirname, "../config/dev.env"),
});

require("./db/mongoose");

const app = express();

app.use(express.json());
app.use(clientRoutes);

export default app;
