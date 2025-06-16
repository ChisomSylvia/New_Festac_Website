import Router from "express";
const router = Router();
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import contactMsgRouter from "./contactMsg.route.js";

router.use("/api/v1/auth", authRouter);
router.use("/api/v1/users", userRouter);
router.use("/api/v1/contact-msg", contactMsgRouter);

export default router;