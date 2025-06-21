import cloudinary from "../libs/cloudinary.lib.js";
import { deleteImage, formatCloudinaryFile } from "../services/file.service.js";

//upload a blog featured image
export const uploadFile = async (req, res) => {
  try {
    const { file } = req
    const image = formatCloudinaryFile(file);
    return res.status(201).json({
          success: true,
          message: "Image uploaded successfully",
          data: image,
    })
  } catch (error) {
    return res.status(500).json({
      error: "Upload failed",
      message: error.message,
    });
  }
}

export const updateFeaturedImage = async (req, res) => {
  try {
    const { oldPublicId } = req.body;
    if (oldPublicId) {
      await deleteImage(oldPublicId);
    }

    const updatedImage = formatCloudinaryFile(req.file);
    return res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: updatedImage, 
    })
  } catch (error) {
    return res.status(500).json({
      error: "Update failed",
      message: error.message,
    });
  }
}

export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;

    await deleteImage(publicId);

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    })
  } catch (error) {
    return res.status(500).json({
      error: "Deletion failed",
      message: error.message,
    });
  }
}