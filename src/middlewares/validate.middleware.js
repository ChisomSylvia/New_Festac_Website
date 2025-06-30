import cloudinary from "../libs/cloudinary.lib.js";

const rollbackCloudinaryTempUploads = async (input) => {
    if (!input) return;

  const files = Array.isArray(input) ? input : [input];

  await Promise.all(
    files.map((file) => {
      const publicId = file?.filename;
      console.log("Filename", publicId);
      
      if (publicId?.startsWith("festac-")) {
        return cloudinary.uploader.destroy(publicId).catch(() => null);
      }
    })
  );
};

const getUploadedFiles = (req) => {
  if (Array.isArray(req.files)) return req.files; // multer.array
  if (req.file) return [req.file]; // multer.single
  return [];
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const validate = (schemas) => async (req, res, next) => {
  const toValidate = {
    body: req.body,
    query: req.query,
    params: req.params,
  };

  for (const key in schemas) {
    if (schemas[key]) {
      const { error, value } = schemas[key].validate(toValidate[key], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        //rollback temp Cloudinary uploads
        const files = getUploadedFiles(req);
        await rollbackCloudinaryTempUploads(files);

        console.log("Files uploaded", files);
        
        const formattedErrors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
        });
      }

      // req[key] = value;
      req[`validated${capitalize(key)}`] = value;
    }
  }
  next();
};

export default validate;