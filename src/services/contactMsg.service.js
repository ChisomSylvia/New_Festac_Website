import mongoose from "mongoose";
import ContactMsgModel from "../models/contactMsg.model.js";
import { AppError } from "../utils/appError.util.js";
import { sendNotificationEmail } from "../utils/sendMail.util.js";

//create message with notification
export const createMsg = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    data.email = data.email.toLowerCase();

    const newMessage = await ContactMsgModel.create([data], { session });

    const { fullName, email, phoneNumber, message } = newMessage[0];

    const emailResult = await sendNotificationEmail(
      fullName,
      email,
      phoneNumber,
      message
    );

    if (!emailResult.success) {
      throw new AppError(
        "Message saved but email motification failed. Rollback activated",
        500
      );
    }

    await session.commitTransaction();

    return newMessage;
  } catch (error) {
    await session.abortTransaction();

    console.error("Error in createMsg:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

//retrieve all messages
export const getAllMsgs = async () => {
  try {
    const messages = await ContactMsgModel.find();
    if (messages.length === 0) {
      throw new AppError("No messages found!", 404);
    }
    return messages;
  } catch (error) {
    console.error("Error in getAllMsgs:", error);
    throw error;
  }
};

//retrieve a single message
export const getMsg = async (query) => {
  try {
    const message = await ContactMsgModel.findOne(query);

    if (!message) {
      throw new AppError("Message not found or already deleted!", 404);
    }

    return message;
  } catch (error) {
    console.error("Error in getMsg:", error);
    throw error;
  }
};

//delete message frm db
export const deleteMsg = async (query) => {
  try {
    const message = await getMsg(query);

    if (!message) {
      throw new AppError("Message not found or already deleted!", 404);
    }
    const delMessage = await ContactMsgModel.findOneAndDelete(query);

    return delMessage;
  } catch (error) {
    console.error("Error in deleteMsg:", error);
    throw error;
  }
};