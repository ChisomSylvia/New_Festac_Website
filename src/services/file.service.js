import cloudinary from "../libs/cloudinary.lib.js";
import { AppError } from "../utils/appError.util.js";

//extracts url and publicId from cloudinary upload
export const formatCloudinaryFile = (file) => {
  if (!file || !file.path || !file.filename) {
    return null;
  }

  console.log("File service", file);
  console.log("Uploading file at path:", file.path);

  const url = `${file?.path}?v=${Date.now()}`;
  const publicId = file?.filename;

  // const url = file?.path
  //   ? `${file?.path}?v=${Date.now()}`
  //   : file?.secure_url || null;

  // const publicId = file?.filename || file?.public_id || null;

  return { url, publicId };
};

//update image
export const handleImageUpdate = async (file, existingImage) => {
  console.log("Incoming file in handleImageUpdate:", file);

  if (!file) return existingImage;

  try {
    //small delay to let Cloudinary finish processing overwrite
    await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3s

    return formatCloudinaryFile(file);
  } catch (error) {
    console.error("handleImageUpdate failed:", err.message);
    throw new AppError("Image update failed", 500);
  }
};

// export const handleImageUpdate = async (file, existingImage) => {
//   console.log("Incoming file in handleImageUpdate:", file);

//   if (file && existingImage?.publicId) {
//     try {
//       await deleteImage(existingImage.publicId);
//     } catch (error) {
//       console.error("Failed to delete old Cloudinary image:", error.message);
//     }
//   }

//   // 🌐 Small delay to let Cloudinary finish processing overwrite
//   if (file) {
//     await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3s
//   }

//   return file ? formatCloudinaryFile(file) : existingImage;
// };


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
    console.error("cloudinary deletion failed:", error.message);
    throw new AppError("Image deletion failed", 500);
  }
};