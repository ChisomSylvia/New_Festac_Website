import cloudinary from "../libs/cloudinary.lib.js";
import { AppError } from "../utils/appError.util.js";
import { v4 as uuidv4 } from "uuid";

//generate permanent public ID
export const generatePublicIdBase = () => {
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  return `public-${timestamp}-${uuid}`;
};

//extracts url and publicId from cloudinary upload
export const formatCloudinaryFile = (file) => {
  if (!file || (!file.path && !file.secure_url) || !file.filename) {
    return null;
  }

  // console.log("File incoming in formatCloudinaryFile", file);

  const url = file.secure_url || file.path;
  const publicId = file.filename;

  return {
    url,
    publicId,
  };
};

//rename temporary uploaded image to final public ID
export const renameCloudinaryImage = async (tempPublicId, finalPublicId) => {
  try {
    const result = await cloudinary.uploader.rename(
      tempPublicId,
      finalPublicId,
      {
        overwrite: true,
        invalidate: true,
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("renameCloudinaryImage failed:", error.message);

    //clean up temp file if rename fails
    await deleteImage(tempPublicId).catch(console.error);

    throw new AppError("Image processing failed", 500);
  }
};

//process uploaded image from multer with permanent ID
export const processImageUpload = async (file, publicIdBase, index) => {
  if (!file) return null;

  let tempPublicId = null;

  try {
    const tempImage = formatCloudinaryFile(file);

    if (!tempImage || !tempImage.publicId || !tempImage.url) {
      throw new AppError("Invalid file upload", 400);
    }

    tempPublicId = tempImage.publicId;

    //create permanent public ID
    const finalPublicId = `${publicIdBase}-${index}`;

    //rename from temp to final public ID
    const finalImage = await renameCloudinaryImage(tempPublicId, finalPublicId);

    return finalImage;
  } catch (error) {
    console.error("processImageUpload failed:", error.message);

    throw new AppError("Image processing failed", 500);
  }
};

//update image
export const handleImageUpdate = async (
  file,
  existingImage,
  publicIdBase,
  targetIndex
) => {
  // console.log("Incoming file in handleImageUpdate:", file);

  if (!file) return existingImage;

  //create permanent public ID
  const targetPublicId = `${publicIdBase}-${targetIndex}`;

  let tempImagePublicId = null;

  try {
    //check if this file was already uploaded by multer
    if (file.filename) {
      tempImagePublicId = file.filename;
      
      //rename the existing temp image publicId to target publicId
      const finalImage = await renameCloudinaryImage(
        tempImagePublicId,
        targetPublicId
      );

      console.log("Renamed temp image ID to targetID:", finalImage.publicId);

      return finalImage;
    }
  } catch (error) {
    console.error("handleImageUpdate failed:", error.message);
    throw new AppError("Image update failed", 500);
  }
};

//handle image append using public ID base
export const handleImageAppend = async (
  file,
  publicIdBase,
  nextIndex
) => {
  if (!file) return null;

  let tempPublicId = null;

  try {
    const tempImage = formatCloudinaryFile(file);
    if (!tempImage || !tempImage.publicId || !tempImage.url) {
      throw new AppError("Image append failed", 400);
    }

    tempPublicId = tempImage.publicId;

    //use permanent public ID base
    const finalPublicId = `${publicIdBase}-${nextIndex}`;

    //rename to final public ID
    const finalImage = await renameCloudinaryImage(tempPublicId, finalPublicId);

    return finalImage;
  } catch (error) {
    console.error("handleImageAppend failed:", error.message);
    throw new AppError("Image processing failed", 500);
  }
};

//delete any image by public ID
export const deleteImage = async (publicId) => {
  if (!publicId) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: "image",
    });
    console.log("cloudinary deletion result:", result);
    return result;
  } catch (error) {
    console.error("deleteImage failed:", error.message);
    throw new AppError("Image deletion failed", 500);
  }
};

//clean temp files on operation failure
export const cleanupTempUploads = async (input) => {
  if (!input) return;

  const files = Array.isArray(input) ? input : [input];

  const deletions = files
    .filter((file) => file?.filename)
    .map((file) =>
      deleteImage(file.filename).catch((err) =>
        console.error("Failed to delete image:", err.message)
      )
    );

  await Promise.allSettled(deletions);
};