import cloudinary from "../libs/cloudinary.lib.js";

//extracts url and publicId from cloudinary upload
export const formatCloudinaryFile = (file) => {
  if(!file) return null;

  console.log("File service", file);
  console.log("Uploading file at path:", file.path);

  // const versionlessUrl = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/image/upload/${file.filename}`;

  // return {
  //   url: `${versionlessUrl}?v=${Date.now()}`, // ✅ unversioned + cache busting
  //   publicId: file.filename,
  // };

  return {
    url: `${file?.path}?v=${ Date.now() }` || file?.secure_url || null,
    publicId: file?.filename || file?.public_id || null,
  }
};


//update image
export const handleImageUpdate = async (file, existingImage) => {
  console.log("Incoming file in handleImageUpdate:", file);

  if (file && existingImage?.publicId) {
    await deleteImage(existingImage.publicId);
  }

    // 🌐 Small delay to let Cloudinary finish processing overwrite
    if (file) {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3s
    }

  return file ? formatCloudinaryFile(file) : existingImage;
};



//delete any image by public ID
export const deleteImage = async (publicId) => {
  if (!publicId) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: "image",
    });
    console.log("✅ Cloudinary deletion result:", result);
    return result;
  } catch (error) {
    console.error("❌ Cloudinary deletion failed:", error);
    throw error;
  }
}