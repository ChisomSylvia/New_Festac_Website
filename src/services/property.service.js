import mongoose from "mongoose";
import PropertyModel from "../models/property.model.js";
import { PROP_ACTION, PROP_STATUS } from "../configs/constants.config.js";
import {
  deleteImage,
  formatCloudinaryFile,
  handleImageUpdate,
} from "./file.service.js";
import { buildFilterQuery, buildSortOptions } from "../utils/property.util.js";
import { buildSearchQuery, calcPaginationMeta, intelligentTitleCase } from "../utils/utils.js";
import { AppError } from "../utils/appError.util.js";

//create property
export const createProperty = async (data, files) => {
  const imageFiles = Array.isArray(files) ? files : [];

  //format and filter valid images before transaction starts
  const formattedImages = imageFiles
    .map((file) => formatCloudinaryFile(file))
    .filter(Boolean);

  //strictly enforce at least one valid image
  if (formattedImages.length === 0) {
    throw new AppError("At least one valid image is required.", 400);
  }

  // Optional: Warn if some files were invalid
  if (formattedImages.length !== imageFiles.length) {
    console.warn("Some files were invalid and ignored.");
  }

  //begin MongoDB session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { action, ...uploadData } = data;

    // if (uploadData.contactInfo.email) {
    //   uploadData.contactInfo.email = uploadData.contactInfo?.email.toLowerCase();
    // }
    // console.log("Email", uploadData.contactInfo.email);
    

    uploadData.title = intelligentTitleCase(uploadData.title);

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

    uploadData.images = formattedImages;

    const newProperty = await PropertyModel.create([uploadData], { session });

    //commit transaction
    await session.commitTransaction();
    session.endSession();

    //return success message appropriately
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

    //clean up cloudinary images already uploaded
    for (const image of formattedImages) {
      if (image.publicId) {
        try {
          await deleteImage(image.publicId);
        } catch (cleanupErr) {
          console.log(
            "Cleanup failed for image:",
            image.publicId,
            cleanupErr.message
          );
        }
      }
    }
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { replaceIndex, deleteIndex, append, action, ...updateData } = data;
    const imageFiles = Array.isArray(files) ? files : [];
    updateData.contactInfo.email = updateData.contactInfo?.email.toLowerCase();

    //retrieve property from db
    const existingProperty = await PropertyModel.findById(id).session(session);
    if (!existingProperty) throw new AppError("Property not found", 404);

    updateData.title = intelligentTitleCase(updateData.title);

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

    //handle image operations
    //create a working copy of the existing prperty images array
    let imagesToSave = [...existingProperty.images];

    //delete images at indexes
    const deleteIndexes = Array.isArray(deleteIndex)
      ? deleteIndex
      : [deleteIndex].filter((i) => i !== undefined);
    for (const i of deleteIndexes) {
      const index = parseInt(i);
      const image = imagesToSave[index];
      if (image) {
        await deleteImage(image.publicId).catch(console.error);
        imagesToSave.splice(index, 1);
      }
    }

    //replace images at indexes
    const replaceIndexes = Array.isArray(replaceIndex)
      ? replaceIndex
      : [replaceIndex].filter((i) => i !== undefined);
    //replace one or more images at specified indexes
    if (replaceIndexes.length && imageFiles.length === replaceIndexes.length) {
      for (let i = 0; i < replaceIndexes.length; i++) {
        const index = parseInt(replaceIndexes[i]);
        const oldImage = imagesToSave[index];
        if (oldImage?.publicId) {
          await deleteImage(oldImage.publicId).catch(console.error);
        }
        imagesToSave[index] = await handleImageUpdate(imageFiles[i], oldImage);
      }
      //append new images without replacing or deleting any
    } else if (
      replaceIndexes.length &&
      imageFiles.length !== replaceIndexes.length
    ) {
      throw new AppError(
        "replaceIndex count must match number of uploaded image files",
        400
      );
    } else if (append === "true" || append === true) {
      const newImages = await Promise.all(
        imageFiles.map((file) => formatCloudinaryFile(file))
      );
      imagesToSave = [...imagesToSave, ...newImages];
      //replace all images if replaceindexes were not provided and image files are present
    } else if (!replaceIndex && !append && imageFiles.length > 0) {
      for (const img of imagesToSave) {
        if (img.publicId) {
          await deleteImage(img.publicId).catch(console.error);
        }
      }
      imagesToSave = await Promise.all(
        imageFiles.map((file) => formatCloudinaryFile(file))
      );
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
        for (const publicId of publicIds) {
          await deleteImage(publicId);
        }
      } catch (cloudError) {
        await session.abortTransaction();
        session.endSession();
        console.error("Cloudinary error:", cloudError.message);
        throw new AppError(
          "Image deletion failed. deletion was rolled back.",
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