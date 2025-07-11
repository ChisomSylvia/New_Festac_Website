import { Router } from "express";
const router = Router();
import {
  createSubscriberCtrl,
  getSubscribersCtrl,
  getSubscriberCtrl,
  deleteSubscriberCtrl,
} from "../controllers/subscribe.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { subscribeSchema } from "../schemas/subscribe.schema.js";
import { objectIdSchema } from "../schemas/schemas.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { USER_TYPES } from "../configs/constants.config.js";

//create subscriber
router.post("/", validate({ body: subscribeSchema }), createSubscriberCtrl);

//get all subscribers
router.get(
  "/",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  getSubscribersCtrl
);
//get a subscriber
router.get(
  "/:id",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  validate({
    params: objectIdSchema,
  }),
  getSubscriberCtrl
);

//delete subscriber
router.delete(
  "/delete/:id",
  validate({ params: objectIdSchema }),
  deleteSubscriberCtrl
);

export default router;