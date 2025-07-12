import mongoose, { Query } from "mongoose";
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

//update property
export const createProperty = async (data, files) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const imageFiles = Array.isArray(files) ? files.filter(Boolean) : [];

  //validate that at least one image is provided
  if (imageFiles.length === 0) {
    throw new AppError("At least one valid image is required.", 400);
  }

  try {
    const { action, ...uploadData } = data;

    //generate permanent public ID base
    const publicIdBase = generatePublicIdBase();
    uploadData.publicIdBase = publicIdBase;

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
        processImageUpload(file, publicIdBase, index)
      )
    );

    //filter successful uploads and handle failures
    const successfulUploads = [];
    const failedUploads = [];

    processedImages.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        successfulUploads.push(result.value);

        console.log("Successful processed images", result.value.publicId);
      } else {
        failedUploads.push(index);
        console.error(
          `Failed to process image at index ${index}:`,
          result.reason
        );
      }
    });

    if (successfulUploads.length === 0) {
      throw new AppError("All image uploads failed", 500);
    }

    if (failedUploads.length > 0) {
      console.warn(
        `${failedUploads.length} image(s) failed to upload and were skipped.`
      );
    }

    uploadData.images = successfulUploads;

    const newProperty = await PropertyModel.create([uploadData], { session });

    await session.commitTransaction();

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

    await cleanupTempUploads(imageFiles);

    console.error("Error creating property:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

//get all properties from db
export const getAllProperties = async (query, user = null) => {
  try {
    const filterQuery = buildFilterQuery(query, user);
    const searchQuery = buildSearchQuery({
      keyword: query.keyword,
    });

    const combinedQuery = {
      ...filterQuery,
      ...searchQuery,
    };

    const sortOptions = buildSortOptions(query.sortBy, query.sortOrder);

    const skip = (query.page - 1) * query.limit;

    const sort = query.keyword
      ? { score: { $meta: "textScore" }, ...sortOptions }
      : sortOptions;

    const projection = query.keyword ? { score: { $meta: "textScore" } } : {};

    const properties = await PropertyModel.find(combinedQuery, projection)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .lean({ virtuals: true });

    if (properties.length === 0) {
      throw new AppError("No properties found!", 404);
    }

    const total = await PropertyModel.countDocuments(combinedQuery);

    const paginationMeta = calcPaginationMeta(total, query.page, query.limit);

    const appliedFilters = Object.fromEntries(
      Object.entries({
        status: query.status,
        category: query.category,
        size: query.size,
        bedrooms: query.bedrooms,
        bathrooms: query.bathrooms,
        min_price: query.min_price,
        max_price: query.max_price,
        search: query.keyword,
        sort: {
          field: query.sortBy,
          order: query.sortOrder,
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
export const getProperty = async (query) => {
  try {
    const property = await PropertyModel.findOne(query);

    if (!property) {
      throw new AppError(`Property with ID: ${query._id} not found`, 404);
    }

    return property;
  } catch (error) {
    console.error("Error fetching property:", error.message);
    throw error;
  }
};

//fxn to validate index type
const validateImageIndex = (index, arrayLength, operation = "operation") => {
  const idx = parseInt(index);
  if (isNaN(idx) || idx < 0 || idx >= arrayLength) {
    throw new AppError(`Invalid image index for ${operation}: ${index}`, 400);
  }
  return idx;
};

//fxn to split image files for replace and append
const splitImagesFiles = (imageFiles, replaceIndexes = []) => {
  const replaceCount = replaceIndexes.length;
  const replaceImages = imageFiles.slice(0, replaceCount);
  const appendImages = imageFiles.slice(replaceCount);

  return { replaceImages, appendImages };
};

//replace image(s) fxn
const applyReplaceImages = async (
  imagesToSave,
  replaceImages,
  replaceIndexes,
  publicIdBase
) => {
  for (let i = 0; i < replaceIndexes.length; i++) {
    const index = replaceIndexes[i];
    validateImageIndex(index, imagesToSave.length, "replace");

    const oldImage = imagesToSave[index];

    imagesToSave[index] = await handleImageUpdate(
      replaceImages[i],
      oldImage,
      publicIdBase,
      index
    );
  }

  return imagesToSave;
};

//append image(s) fxn
const applyAppendImages = async (imagesToSave, appendImages, publicIdBase) => {
  const startIndex = imagesToSave.length;

  const newImages = await Promise.allSettled(
    appendImages.map((file, idx) =>
      handleImageAppend(file, publicIdBase, startIndex + idx)
    )
  );

  const successfulAppends = newImages
    .filter((res) => res.status === "fulfilled" && res.value)
    .map((res) => res.value);

  return [...imagesToSave, ...successfulAppends];
};

//update property
export const updateProperty = async (query, data, files) => {
  const imageFiles = Array.isArray(files) ? files.filter(Boolean) : [];

  const session = await mongoose.startSession();
  session.startTransaction();

  const { replaceIndex, deleteIndex, append, action, ...updateData } = data;

  try {
    //retrieve property from db
    const existingProperty = await PropertyModel.findOne(query).session(
      session
    );
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
    const publicIdBase = existingProperty.publicIdBase;

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

    //handle replace and append - replace and append images at index(es)
    const replaceIndexes = Array.isArray(replaceIndex)
      ? replaceIndex.map(Number).filter((i) => !isNaN(i))
      : [replaceIndex]
          .filter(Boolean)
          .map(Number)
          .filter((i) => !isNaN(i));

    const { replaceImages, appendImages } = splitImagesFiles(
      imageFiles,
      replaceIndexes
    );

    //validate if replaceImages are enough
    if ( replaceIndexes.length > 0 && replaceImages.length < replaceIndexes.length
    ) {
      throw new AppError("Not enough images for the given replaceIndex", 400);
    }

    //more images than replaceIndexes when append is not enabled
    if ( replaceIndexes.length > 0 && replaceImages.length < imageFiles.length && !(append === "true" || append === true)
    ) {
      throw new AppError("Extra image(s) provided but append not enabled. Set `append = true` to append.", 400);
    }

    //replace existing images
    if (replaceIndexes.length > 0) {
      try {
        imagesToSave = await applyReplaceImages(
          imagesToSave,
          replaceImages,
          replaceIndexes,
          publicIdBase
        );
      } catch (error) {
        throw new AppError("Failed to replace images", 500);
      }
    }

    //append new images
    if (appendImages.length > 0 && (append === "true" || append === true)) {
      imagesToSave = await applyAppendImages(
        imagesToSave,
        appendImages,
        publicIdBase
      );
    }

    //replace all images if replaceindex, append, deleteindex were not provided and image files are present
    if (!replaceIndex && !append && imageFiles.length > 0) {
      //replace all images
      for (const img of imagesToSave) {
        if (img.publicId) {
          await deleteImage(img.publicId).catch(console.error);
        }
      }

      const newImages = await Promise.allSettled(
        imageFiles.map((file, index) =>
          processImageUpload(file, publicIdBase, index)
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

    const updatedProperty = await PropertyModel.findOneAndUpdate(
      query,
      updateData,
      {
        new: true,
        session,
      }
    );

    await session.commitTransaction();

    return updatedProperty;
  } catch (error) {
    await session.abortTransaction();

    await cleanupTempUploads(imageFiles);

    console.error("Update property error:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

//update property status
export const updatePropStatus = async (query) => {
  try {
    //retrieve property from db
    const existingProperty = await PropertyModel.findOne(query);
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

    const updatedStatus = await PropertyModel.findOneAndUpdate(
      query,
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
export const deleteProperty = async (query) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    //retrieve property from db
    const existingProperty = await PropertyModel.findOne(query).session(session);
    if (!existingProperty) throw new AppError("Property not found", 404);

    //extract publicIds from the images array if not empty
    const publicIds = Array.isArray(existingProperty.images)
      ? existingProperty.images.map((img) => img.publicId).filter(Boolean)
      : [];

    //delete cloudinary images first
    if (publicIds.length > 0) {
      try {
        const deletionPromises = publicIds.map((publicId) =>
          deleteImage(publicId)
        );
        await Promise.allSettled(deletionPromises);
      } catch (cloudError) {
        throw new AppError(
          "Image deletion failed. Deletion was rolled back.",
          500
        );
      }
    }

    const deletedProperty = await PropertyModel.findOneAndDelete(query).session( session );

    if (!deletedProperty) throw new AppError("Property deletion failed", 500);

    await session.commitTransaction();

    return deletedProperty;
  } catch (error) {
    await session.abortTransaction();
 
    console.error("Property deletion error:", error);
    throw error;
  } finally {
    session.endSession();
  }
};