import mongoose from "mongoose";
import BlogPostModel from "../models/blogPost.model.js";
// import ContactMsgModel from "../models/contactMsg.model.js";
import PropertyModel from "../models/property.model.js";


const connectToDb = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("DB_URI environment variable is not defined.");
    return;
  }

  const uri = process.env.MONGODB_URI;

  try {
    await mongoose.connect(uri);
    console.log("MongoDB is connected!");

    // Ensure indexes are created
    await BlogPostModel.createIndexes();
    console.log("Indexes synced");

    await PropertyModel.createIndexes();
    console.log(" Property Indexes synced");

    // //remove index
    // await BlogPostModel.collection.dropIndex("tags_1");
    // console.log("index dropped");
    

    // Log the indexes
    
    const indexes = await PropertyModel.collection.getIndexes();
    console.log("Indexes on PropertyModel:", indexes);
  } catch (error) {
    console.error("Error detected:", error);
  }
};

export default connectToDb;


// const connectToDb = () => {
//   if (!process.env.MONGODB_URI) {
//     console.error("DB_URI environment variable is not defined.");
//     return;
//   }

//   const uri = process.env.MONGODB_URI;

//   mongoose.connect(uri).then(() => {
//     console.log("Mongodb is connected!");

//     //create indexes after successful connection
//     return BlogPostModel.createIndexes();
//   }).then(() => {
//     console.log("Indexes synced");
//     const indexes = BlogPostModel.collection.getIndexes();
//     console.log("Indexes on BlogPostModel: ");
//     console.log(indexes);


//   }).catch((error) => {
//     console.log("Error detected", error);
//   })
// };

// export default connectToDb;