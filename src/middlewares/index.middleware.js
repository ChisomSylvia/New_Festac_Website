import { json, urlencoded } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import indexRoute from "../routes/index.route.js";
import { errorHandler } from "./errorHandler.middleware.js"

export default (app) => {
  //dev logging
  if (process.env.NODE_ENV !== "production") {
    //HTTP request logger
    app.use(morgan("dev"));
  }
  app.use(morgan("combined"));

  const allowedOrigins = ["https://festac-project.vercel.app/", "http://localhost:3000", "https://new-festac-website.onrender.com"]

  //enable CORS for all origins
  app.use(cors({ origin: allowedOrigins, credentials: true}));

  //set secure HTTP headers
  app.use(helmet());

  //parse JSON and form data
  app.use(json());
  app.use(urlencoded({ extended: true }));

  //parse cookies from client requests
  app.use(cookieParser());

  //mount routes
  app.use(indexRoute);

  app.use(errorHandler);
};