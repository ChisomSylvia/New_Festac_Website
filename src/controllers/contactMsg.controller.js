import {
  createMsg,
  getAllMsgs,
  getMsg,
  deleteMsg
} from "../services/contactMsg.service.js";
import {
  sendNotificationEmail
} from "../utils/sendMail.util.js";


export const createMsgCtrl = async (req, res) => {
  const {
    body
  } = req;
  body.email = body.email.toLowerCase();

  const newMessage = await createMsg(body);
  
  const {
    fullName,
    email,
    phoneNumber,
    message
  } = newMessage;

  const emailResult = await sendNotificationEmail(fullName, email, phoneNumber, message);
  if (!emailResult.success) {
    console.error("Email notification failed", emailResult.message);
    return res.status(500).json({
      success: false,
      message: "Message saved but email motification failed",
      data: newMessage,
    })
  }
  return res.status(201).json({
    success: true,
    message: "Message submitted and notification sent successfully",
    data: newMessage,
  });
}

export const getAllMsgsCtrl = async (req, res) => {
  const messages = await getAllMsgs();

  if (messages.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Message list is empty or have already been deleted!",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Messages retrieved successfully!",
    data: messages,
  });
}

export const getMsgCtrl = async (req, res) => {
  const query = {
    _id: req.params.id
  };

  const message = await getMsg(query);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: "Message not found or has already been deleted!",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Message retrieved successfully!",
    data: message,
  });
}

export const deleteMsgCtrl = async (req, res) => {
  const query = {
    _id: req.params.id
  };

  const message = await getMsg(query);
  if (!message) {
    return res.status(404).json({
      success: false,
      message: "Message not found or already deleted!",
    });
  }

  const delMessage = await deleteMsg(query);

  return res.status(200).json({
    success: true,
    message: "Message deleted successfully!",
    data: delMessage,
  });
}