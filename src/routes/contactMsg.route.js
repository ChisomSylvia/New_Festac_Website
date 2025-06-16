import { Router } from "express";
const router = Router();
import {
  createMsgCtrl,
  getAllMsgsCtrl,
  getMsgCtrl,
  deleteMsgCtrl
} from "../controllers/contactMsg.controller.js";
import validate from "../middlewares/validate.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import { contactMsgSchema } from "../schemas/contactMsg.schema.js";
import { USER_TYPES } from "../utils/user.util.js";


//create contact message
router.post("/", validate(contactMsgSchema), createMsgCtrl);

//get all contact messages
router.get("/", authenticate([USER_TYPES.ADMIN]), getAllMsgsCtrl);
//get a contact message
router.get("/:id", authenticate([USER_TYPES.ADMIN]), getMsgCtrl);

//delete contact message
router.delete("/:id", authenticate([USER_TYPES.ADMIN]), deleteMsgCtrl);

export default router;