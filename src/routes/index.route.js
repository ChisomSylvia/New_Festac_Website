import Router from "express";
const router = Router();
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import contactMsgRouter from "./contactMsg.route.js";
import subscribeRouter from "./subscribe.route.js";
import fileRouter from "./file.route.js";
import blogPostRouter from "./blogPost.route.js";

router.use("/api/v1/auth", authRouter);
router.use("/api/v1/users", userRouter);
router.use("/api/v1/contact-msg", contactMsgRouter);
router.use("/api/v1/subscribe", subscribeRouter);
router.use("/api/v1/file", fileRouter);
router.use("/api/v1/posts", blogPostRouter);

export default router;