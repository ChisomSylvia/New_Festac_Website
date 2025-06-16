import mongoose from "mongoose";

const connectToDb = () => {
  if (!process.env.MONGODB_URI) {
    console.error("DB_URI environment variable is not defined.");
    return;
  }

  const uri = process.env.MONGODB_URI;
  mongoose.connect(uri).then(() => {
    console.log("Mongodb is connected!");
  }).catch((error) => {
    console.log("Error detected", error);
  })
};

export default connectToDb;