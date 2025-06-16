import ContactMsgModel from "../models/contactMsg.model.js";

export const createMsg = async (data) => {
  const newMessage = await ContactMsgModel.create(data);
  return newMessage;
};

export const getAllMsgs = async () => {
  const messages = await ContactMsgModel.find();
  return messages;
};

export const getMsg = async (query) => {
  const message = await ContactMsgModel.findOne(query);
  return message;
};

export const deleteMsg = async (query) => {
  const delMessage = await ContactMsgModel.findOneAndDelete(query);
  return delMessage;
};