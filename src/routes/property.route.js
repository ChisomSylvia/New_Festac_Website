import { Router } from "express";
const router = Router();
import { USER_TYPES } from "../configs/constants.config.js";
import { createPropertyCtrl, deletePropertyCtrl, getAllPropertiesCtrl, getPropertyCtrl, updatePropertyCtrl, updatePropStatusCtrl } from "../controllers/property.controller.js";
import { propertyUpload } from "../libs/multer.lib.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createPropertySchema, getAllPropertiesSchema, updatePropertySchema, } from "../schemas/property.schema.js";
import { objectIdSchema } from "../schemas/schemas.js";

//create property
router.post(
  "/",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  propertyUpload.array("images", 10),
  validate({
    body: createPropertySchema,
  }),
  createPropertyCtrl
);

//get all properties with selected queries
router.get(
  "/",
  optionalAuth,
  validate({
    query: getAllPropertiesSchema,
  }),
  getAllPropertiesCtrl
);

//get property by id
router.get(
  "/:id",
  optionalAuth,
  validate({
    params: objectIdSchema,
  }),
  getPropertyCtrl
);

//update property
router.patch(
  "/update/:id",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  propertyUpload.array("images", 10),
  validate({
    body: updatePropertySchema,
    params: objectIdSchema,
  }),
  updatePropertyCtrl
);

//update property status
router.patch(
  "/update-status/:id",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  validate({
    params: objectIdSchema,
  }),
  updatePropStatusCtrl
);

//delete property
router.delete(
  "/delete/:id",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  validate({
    params: objectIdSchema,
  }),
  deletePropertyCtrl
);

export default router;