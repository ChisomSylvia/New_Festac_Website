import { Router } from "express";
const router = Router();
import {
  createMsgCtrl,
  getAllMsgsCtrl,
  getMsgCtrl,
  deleteMsgCtrl,
} from "../controllers/contactMsg.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { contactMsgSchema } from "../schemas/contactMsg.schema.js";
import { objectIdSchema } from "../schemas/schemas.js";
import { USER_TYPES } from "../configs/constants.config.js";

//create contact message
router.post("/", validate({ body: contactMsgSchema }), createMsgCtrl);

//get all contact messages
router.get(
  "/",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  getAllMsgsCtrl
);
//get a contact message
router.get(
  "/:id",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  validate({ params: objectIdSchema }),
  getMsgCtrl
);

//delete contact message
router.delete(
  "/delete/:id",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  validate({ params: objectIdSchema }),
  deleteMsgCtrl
);

export default router;