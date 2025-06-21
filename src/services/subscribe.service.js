import SubscribeModel from "../models/subscribe.model.js";

export const createSubscriber = async (data) => {
  const newSubscriber = await SubscribeModel.create(data);
  return newSubscriber;
}

export const getSubscribers = async () => {
  const subscribers = await SubscribeModel.find();
  return subscribers
}

export const getSubscriber = async (query) => {
  const subscriber = await SubscribeModel.findOne(query);
  return subscriber
}

export const deleteSubscriber = async (query) => {
  const deletedSubscriber = await SubscribeModel.findOneAndDelete(query);
  return deletedSubscriber
}