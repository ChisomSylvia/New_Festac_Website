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
    // const { validatedQuery: query } = req;
    const { validatedQuery: validatedParams } = req;
    const user = req.user || null;

    //call the service function
    const properties = await getAllProperties(validatedParams, user);

    return res.status(200).json({
      success: true,
      message: `Found ${properties.properties.length} properties`,
      data: properties.properties,
      total: properties.pagination,
      totalData,
      pagination: properties.pagination,
      filters: properties.appliedFilters,
    });
  } catch (error) {
    console.error("getAllPropertiesCtrl Error:", error.message);
    next(error);
  }
};

//get property controller
export const getPropertyCtrl = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;

    const property = await getProperty(id);

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
    // const { validatedParams: id } = req;
    const { id } = req.validatedParams;
    const { validatedBody: data } = req;
    const { files } = req;

    const updatedProperty = await updateProperty(id, data, files);

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
    // const { validatedParams: id } = req; //id here is an object not a string
    const { id } = req.validatedParams;

    const updatedStatus = await updatePropStatus(id);

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
    const { id } = req.validatedParams;

    const deletedProperty = await deleteProperty(id);

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