import {
  createMsg,
  getAllMsgs,
  getMsg,
  deleteMsg,
} from "../services/contactMsg.service.js";

//create message ctrl
export const createMsgCtrl = async (req, res, next) => {
  try {
    const { validatedBody: body } = req;

    const newMessage = await createMsg(body);

    return res.status(201).json({
      success: true,
      message: "Message submitted and notification sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("createMsgCtrl error:", error.message);

    next(error);
  }
};

//retrieve all messages ctrl
export const getAllMsgsCtrl = async (req, res, next) => {
  try {
    const messages = await getAllMsgs();

    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully!",
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("getAllMsgsCtrl error:", error.message);

    next(error);
  }
};

//retrieve single message ctrl
export const getMsgCtrl = async (req, res, next) => {
  try {
    const query = {
      _id: req.validatedParams.id,
    };

    const message = await getMsg(query);

    return res.status(200).json({
      success: true,
      message: "Message retrieved successfully!",
      data: message,
    });
  } catch (error) {
    console.error("getMsgCtrl error:", error.message);

    next(error);
  }
};

//delete message ctrl
export const deleteMsgCtrl = async (req, res, next) => {
  try {
    const query = {
      _id: req.validatedParams.id,
    };

    const delMessage = await deleteMsg(query);

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully!",
      data: delMessage,
    });
  } catch (error) {
    console.error("deleteMsgCtrl error:", error.message);

    next(error);
  }
};