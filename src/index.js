//load env values into process.env
import { config } from "dotenv";
config();

//start the app
import express from "express";
const app = express();

//connect to database
import connectToDb from "./configs/db.config.js";

//apply middleware
import indexMiddleware from "./middlewares/index.middleware.js";
indexMiddleware(app)


const PORT = process.env.PORT;


app.listen(PORT, () => {
  connectToDb();
  console.log(`App is currently running on port ${PORT}`);
});