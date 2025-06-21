import cloudinary from "../libs/cloudinary.lib.js";

//extracts url and publicId from cloudinary upload
export const formatCloudinaryFile = (file) => ({
  url: file?.path,
  publicId: file?.filename,
});


// image.service.js
export const handleImageUpdate = async (newFile, existingImage) => {
  if (newFile && existingImage?.publicId) {
    await deleteImage(existingImage.publicId);
  }

  return newFile ? formatCloudinaryFile(newFile) : existingImage;
};



//delete any image by public ID
export const deleteImage = async (publicId) => {
  if (!publicId) return null;
  return await cloudinary.uploader.destroy(publicId);
}