import mongoose from "mongoose";
import PropertyModel from "../models/property.model.js";
import { PROP_ACTION, PROP_STATUS } from "../configs/constants.config.js";
import {
  cleanupTempUploads,
  deleteImage,
  generatePublicIdBase,
  handleImageAppend,
  handleImageUpdate,
  processImageUpload,
} from "./file.service.js";
import { buildFilterQuery, buildSortOptions } from "../utils/property.util.js";
import {
  buildSearchQuery,
  calcPaginationMeta,
  intelligentTitleCase,
} from "../utils/utils.js";
import { AppError } from "../utils/appError.util.js";

const validateImageIndex = (index, arrayLength, operation = "operation") => {
  const idx = parseInt(index);
  if (isNaN(idx) || idx < 0 || idx >= arrayLength) {
    throw new AppError(`Invalid image index for ${operation}: ${index}`, 400);
  }
  return idx;
};

//update property
export const createProperty = async (data, files) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const imageFiles = Array.isArray(files) ? files.filter(Boolean) : [];

  //validate that at least one image is provided
  if (imageFiles.length === 0) {
    throw new AppError("At least one valid image is required.", 400);
  }


  //track all uploaded image publicIds for cleanup on failure
  // const uploadedPublicIds = [];

  try {
    const { action, ...uploadData } = data;

    //generate permanent public ID base
    const publicIdBase = generatePublicIdBase();
    uploadData.originalPublicIdBase = publicIdBase;

    //format fields
    uploadData.title = intelligentTitleCase(uploadData.title);
    uploadData.location = intelligentTitleCase(uploadData.location);
    uploadData.price = intelligentTitleCase(uploadData.price);

    //action dependent modifications
    switch (action) {
      case PROP_ACTION.SAVE:
        uploadData.status = PROP_STATUS.NOT_AVAILABLE;
        uploadData.listedAt = null;
        break;
      case PROP_ACTION.PUBLISH:
      default:
        uploadData.status = PROP_STATUS.AVAILABLE;
        uploadData.listedAt = new Date();
        break;
    }

    //process images with permanent public ID base
    const processedImages = await Promise.allSettled(
      imageFiles.map((file, index) =>
        processImageUpload(
          file, 
          publicIdBase, 
          index, 
          // uploadedPublicIds
        )
      )
    );

    //filter successful uploads and handle failures
    const successfulImages = [];
    const failedUploads = [];

    processedImages.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        successfulImages.push(result.value);
        console.log("Successful processed images", result.value);
      } else {
        failedUploads.push(index);
        console.error(
          `Failed to process image at index ${index}:`,
          result.reason
        );
      }
    });

    if (successfulImages.length === 0) {
      throw new AppError("All image uploads failed", 500);
    }

    if (failedUploads.length > 0) {
      console.warn(
        `${failedUploads.length} image(s) failed to upload and were skipped.`
      );
    }

    uploadData.images = successfulImages;

    const newProperty = await PropertyModel.create([uploadData], {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    const message =
      action === PROP_ACTION.PUBLISH
        ? "Property published successfully"
        : "Property saved as draft";

    return {
      data: newProperty[0],
      message,
    };
  } catch (error) {
    //rollback on error
    await session.abortTransaction();
    session.endSession();

    await cleanupTempUploads(imageFiles);

    // if (imageFiles.length > 0) {
    //   for (const file of imageFiles) {
    //     if (file?.filename) {
    //       await deleteImage(file.filename).catch(console.error);
    //     }
    //   }
    // }

    console.error("Error creating property:", error);
    throw error;
  }
};

//get all properties from db
export const getAllProperties = async (validatedParams, user = null) => {
  try {
    const filterQuery = buildFilterQuery(validatedParams, user);
    const searchQuery = buildSearchQuery({
      keyword: validatedParams.keyword,
    });

    const combinedQuery = {
      ...filterQuery,
      ...searchQuery,
    };

    const sortOptions = buildSortOptions(
      validatedParams.sortBy,
      validatedParams.sortOrder
    );

    const skip = (validatedParams.page - 1) * validatedParams.limit;

    const sort = validatedParams.keyword
      ? { score: { $meta: "textScore" }, ...sortOptions }
      : sortOptions;

    const projection = validatedParams.keyword
      ? { score: { $meta: "textScore" } }
      : {};

    const properties = await PropertyModel.find(combinedQuery, projection)
      .sort(sort)
      .skip(skip)
      .limit(validatedParams.limit)
      .lean({ virtuals: true });

    const total = await PropertyModel.countDocuments(combinedQuery);

    const paginationMeta = calcPaginationMeta(
      total,
      validatedParams.page,
      validatedParams.limit
    );

    const appliedFilters = Object.fromEntries(
      Object.entries({
        status: validatedParams.status,
        type: validatedParams.type,
        size: validatedParams.size,
        bedrooms: validatedParams.bedrooms,
        bathrooms: validatedParams.bathrooms,
        min_price: validatedParams.min_price,
        max_price: validatedParams.max_price,
        search: validatedParams.keyword,
        sort: {
          field: validatedParams.sortBy,
          order: validatedParams.sortOrder,
        },
      }).filter(([_, v]) => v !== undefined)
    );

    return {
      properties,
      pagination: paginationMeta,
      appliedFilters,
    };
  } catch (error) {
    console.error("Error fetching properties:", error.message);
    throw error;
  }
};

//get a single property
export const getProperty = async (id) => {
  try {
    const property = await PropertyModel.findById(id);

    if (!property) {
      throw new AppError(`Property with ID: ${id} not found`, 404);
    }

    return property;
  } catch (error) {
    console.error("Error fetching property:", error.message);
    throw error;
  }
};

//update property
export const updateProperty = async (id, data, files) => {

  const imageFiles = Array.isArray(files) ? files.filter(Boolean) : [];

  const session = await mongoose.startSession();
  session.startTransaction();

  // const uploadedPublicIds = []; // track any images to clean up on failure

  const { replaceIndex, deleteIndex, append, action, ...updateData } = data;

  try {
    //retrieve property from db
    const existingProperty = await PropertyModel.findById(id).session(session);
    if (!existingProperty) throw new AppError("Property not found", 404);

    if (updateData.title) {
      updateData.title = intelligentTitleCase(updateData.title);
    }

    if (updateData.location) {
      updateData.location = intelligentTitleCase(updateData.location);
    }

    if (updateData.price) {
      updateData.price = intelligentTitleCase(updateData.price);
    }

    //use original public ID base
    const publicIdBase = existingProperty.originalPublicIdBase;

    //run action dependant modifications
    switch (action) {
      case PROP_ACTION.SAVE:
        updateData.status = PROP_STATUS.NOT_AVAILABLE;
        updateData.listedAt = null;
        break;
      case PROP_ACTION.PUBLISH:
        updateData.status = PROP_STATUS.AVAILABLE;
        updateData.listedAt = new Date();
        break;
    }

    /*** Handle image operations ***/

    //create a working copy of the existing property images array
    let imagesToSave = [...existingProperty.images];

    //delete images at index(es) - process in reverse order to avoid index shifting
    const deleteIndexes = Array.isArray(deleteIndex)
      ? deleteIndex
          .map((i) => parseInt(i))
          .filter((i) => !isNaN(i))
          .sort((a, b) => b - a)
      : [deleteIndex]
          .filter((i) => i !== undefined)
          .map((i) => parseInt(i))
          .filter((i) => !isNaN(i));

    for (const index of deleteIndexes) {
      if (index >= 0 && index < imagesToSave.length) {
        const image = imagesToSave[index];
        if (image?.publicId) {
          await deleteImage(image.publicId).catch(console.error);
        }
        imagesToSave.splice(index, 1);
      }
    }

    //handle replace - replace images at index(es)
    const replaceIndexes = Array.isArray(replaceIndex)
      ? replaceIndex.map((i) => parseInt(i)).filter((i) => !isNaN(i))
      : [replaceIndex]
          .filter((i) => i !== undefined)
          .map((i) => parseInt(i))
          .filter((i) => !isNaN(i));

    //replace one or more images at specified indexes
    if (
      replaceIndexes.length > 0 &&
      imageFiles.length === replaceIndexes.length
    ) {
      for (let i = 0; i < replaceIndexes.length; i++) {
        const index = replaceIndexes[i];

        validateImageIndex(index, imagesToSave.length, "replace");

        const oldImage = imagesToSave[index];

        //replace with new image using original public ID base
        try {
          imagesToSave[index] = await handleImageUpdate(
            imageFiles[i],
            oldImage,
            publicIdBase,
            index
            // uploadedPublicIds
          );
        } catch (error) {
          await cleanupTempUploads(imageFiles);
          throw new AppError("Image update failed", 500);
        }
      }

      //throw error if replaceindexes is not equal to uploaded files
    } else if (
      replaceIndexes.length > 0 &&
      imageFiles.length !== replaceIndexes.length
    ) {
      console.log("Image file index mismatch detected. Cleaning up...");

      //delete all uploaded images from Cloudinary
      await cleanupTempUploads(imageFiles);

      throw new AppError(
        "replaceIndex count must match number of uploaded image files",
        400
      );

      //append new images without replacing or deleting any
    } else if (append === "true" || append === true) {
      const startIndex = imagesToSave.length;
      const newImages = await Promise.allSettled(
        imageFiles.map((file, idx) =>
          handleImageAppend(
            file,
            publicIdBase,
            startIndex + idx
            // uploadedPublicIds
          )
        )
      );

      const successfulAppends = newImages
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => result.value);

      imagesToSave = [...imagesToSave, ...successfulAppends];

      //replace all images if replaceindex, append, deleteindex were not provided and image files are present
    } else if (!replaceIndex && !append && imageFiles.length > 0) {
      //replace all images
      for (const img of imagesToSave) {
        if (img.publicId) {
          await deleteImage(img.publicId).catch(console.error);
        }
      }

      const newImages = await Promise.allSettled(
        imageFiles.map((file, index) =>
          processImageUpload(
            file,
            publicIdBase,
            index
            // uploadedPublicIds
          )
        )
      );

      imagesToSave = newImages
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => result.value);
    }

    //validate final images array
    if (imagesToSave.length === 0) {
      throw new AppError("Property must have at least one image", 400);
    }

    //save updated property
    updateData.images = imagesToSave;

    const updatedProperty = await PropertyModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        session,
      }
    );

    await session.commitTransaction();
    session.endSession();

    return updatedProperty;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    await cleanupTempUploads(imageFiles);

    // //rollback all newly uploaded images
    // if (uploadedPublicIds.length > 0) {
    //   await Promise.allSettled(
    //     uploadedPublicIds.map((publicId) =>
    //       deleteImage(publicId).catch(console.error)
    //     )
    //   );
    // }

    console.error("Update property error:", error);
    throw error;
  }
};

//update property status
export const updatePropStatus = async (id) => {
  try {
    //retrieve property from db
    const existingProperty = await PropertyModel.findById(id);
    if (!existingProperty) throw new AppError("Property not found", 404);

    //update status
    let newStatus;

    if (existingProperty.status === PROP_STATUS.AVAILABLE) {
      newStatus = PROP_STATUS.SOLD;
    } else if (existingProperty.status === PROP_STATUS.SOLD) {
      newStatus = PROP_STATUS.AVAILABLE;
    } else {
      throw new AppError("Status cannot be toggled", 400);
    }

    const updatedStatus = await PropertyModel.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    return updatedStatus;
  } catch (error) {
    console.error("Update property status  error:", error);
    throw error;
  }
};

//delete property
export const deleteProperty = async (id) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    //retrieve property from db
    const existingProperty = await PropertyModel.findById(id).session(session);
    if (!existingProperty) throw new AppError("Property not found", 404);

    //extract publicIds from the images array if not empty
    const publicIds = Array.isArray(existingProperty.images)
      ? existingProperty.images.map((img) => img.publicId).filter(Boolean)
      : [];

    //delete cloudinary images first
    if (publicIds.length > 0) {
      try {
        // for (const publicId of publicIds) {
        //   await deleteImage(publicId);
        // }
        const deletionPromises = publicIds.map((publicId) =>
          deleteImage(publicId)
        );
        await Promise.allSettled(deletionPromises);
      } catch (cloudError) {
        await session.abortTransaction();
        session.endSession();
        console.error("Cloudinary error:", cloudError.message);
        throw new AppError(
          "Image deletion failed. Deletion was rolled back.",
          500
        );
      }
    }

    const deletedProperty = await PropertyModel.findByIdAndDelete(id).session(
      session
    );
    if (!deletedProperty) throw new AppError("Property deletion failed", 500);

    await session.commitTransaction();
    session.endSession();

    return deletedProperty;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Property deletion error:", error);
    throw error;
  }
};