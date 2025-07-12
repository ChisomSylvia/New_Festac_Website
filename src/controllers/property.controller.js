import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getProperty,
  updateProperty,
  updatePropStatus,
} from "../services/property.service.js";

//create property controller
export const createPropertyCtrl = async (req, res, next) => {
  try {
    const { validatedBody: body } = req;
    const { files } = req;

    const newProperty = await createProperty(body, files);

    return res.status(201).json({
      success: true,
      message: newProperty.message || "Property created successfully",
      data: newProperty.data,
    });
  } catch (error) {
    console.error("createPropertyCtrl Error:", error.message);
    next(error);
  }
};

//get all properties controller
export const getAllPropertiesCtrl = async (req, res, next) => {
  try {
    const { validatedQuery: query } = req;
    const user = req.user || null;

    const result = await getAllProperties(query, user);

    return res.status(200).json({
      success: true,
      message: `Found ${result.properties.length} properties`,
      data: result.properties,
      total: result.pagination,
      pagination: result.pagination,
      filters: result.appliedFilters,
    });
  } catch (error) {
    console.error("getAllPropertiesCtrl Error:", error.message);
    next(error);
  }
};

//get property controller
export const getPropertyCtrl = async (req, res, next) => {
  try {
    // const { id } = req.validatedParams;
    const query = {
      _id: req.validatedParams.id,
    };
    // console.log("ID", query);

    const property = await getProperty(query);

    return res.status(200).json({
      success: true,
      message: "Property retrieved successfully",
      data: property,
    });
  } catch (error) {
    console.error("getPropertyCtrl Error:", error.message);
    next(error);
  }
};

//update property controller
export const updatePropertyCtrl = async (req, res, next) => {
  try {
    const query = {
      _id: req.validatedParams.id,
    };
    const { validatedBody: data } = req;
    const { files } = req;

    const updatedProperty = await updateProperty(query, data, files);

    return res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: updatedProperty,
    });
  } catch (error) {
    console.error("updatePropertyCtrl Error:", error.message);
    next(error);
  }
};

//update property status controller
export const updatePropStatusCtrl = async (req, res, next) => {
  try {
    const query = {
      _id: req.validatedParams.id,
    };

    const updatedStatus = await updatePropStatus(query);

    return res.status(200).json({
      success: true,
      message: "Property status updated successfully",
      data: updatedStatus,
    });
  } catch (error) {
    console.error("updatePropStatusCtrl Error:", error.message);
    next(error);
  }
};

//delete property controller
export const deletePropertyCtrl = async (req, res, next) => {
  try {
    const query = {
      _id: req.validatedParams.id,
    };

    const deletedProperty = await deleteProperty(query);

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully",
      data: deletedProperty,
    });
  } catch (error) {
    console.error("deletePropertyCtrl Error:", error.message);
    next(error);
  }
};