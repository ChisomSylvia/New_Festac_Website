import mongoose from "mongoose";
import SubscribeModel from "../models/subscribe.model.js";
import { AppError } from "../utils/appError.util.js";
import { sendSubscribedEmail } from "../utils/sendMail.util.js";

//create subscriber
export const createSubscriber = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    data.email = data.email.toLowerCase();

    const subscriber = await SubscribeModel.findOne({
      email: data.email,
    }).session(session);

    if (subscriber) {
      throw new AppError("You've already subscribed!", 409);
    }

    const newSubscriber = await SubscribeModel.create([data], { session });

    const { email } = newSubscriber[0];
    
    const emailResult = await sendSubscribedEmail(email);

    if (!emailResult.success) {
      throw new AppError("Email notification failed", 500);
    }

    await session.commitTransaction();

    return newSubscriber;
  } catch (error) {
    await session.abortTransaction();

    console.error("Error in createSubscriber:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

//retrieve all subscribers
export const getSubscribers = async () => {
  try {
    const subscribers = await SubscribeModel.find();

    if (subscribers.length === 0) {
      throw new AppError(
        "Subscribers list is empty or have already been deleted!",
        404
      );
    }

    return subscribers;
  } catch (error) {
    console.error("Error in getSubscribers:", error);
    throw error;
  }
};

//retrieve a single subscriber
export const getSubscriber = async (query) => {
  try {
    const subscriber = await SubscribeModel.findOne(query);

    if (!subscriber) {
      throw new AppError(
        "Subscriber not found or had already been deleted!",
        404
      );
    }
    return subscriber;
  } catch (error) {
    console.error("Error in getSubscriber:", error);
    throw error;
  }
};

//delete subscriber
export const deleteSubscriber = async (query) => {
  try {
    const subscriber = await getSubscriber(query);

    if (!subscriber) {
      throw new AppError(
        "Subscriber not found or had already been deleted!",
        404
      );
    }

    const deletedSubscriber = await SubscribeModel.findOneAndDelete(query);

    return deletedSubscriber;
  } catch (error) {
    console.error("Error in deleteSubscriber:", error);
    throw error;
  }
};