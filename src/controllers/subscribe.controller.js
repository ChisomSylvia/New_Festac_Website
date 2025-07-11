import {
  createSubscriber,
  getSubscriber,
  getSubscribers,
  deleteSubscriber,
} from "../services/subscribe.service.js";

//create subscriber ctrl
export const createSubscriberCtrl = async (req, res, next) => {
  try {
    const { validatedBody: body } = req;

    const newSubscriber = await createSubscriber(body);

    return res.status(201).json({
      success: true,
      message: "A new subscriber created successfully!",
      data: newSubscriber,
    });
  } catch (error) {
    console.error("createSubscriberCtrl error:", error.message);

    next(error);
  }
};

//retrieve subscribers ctrl
export const getSubscribersCtrl = async (req, res, next) => {
  try {
    const subscribers = await getSubscribers();

    return res.status(200).json({
      success: true,
      message: "Subscribers retrieved successfully!",
      count: subscribers.length,
      data: subscribers,
    });
  } catch (error) {
    console.error("getSubscribersCtrl error:", error.message);

    next(error);
  }
};

//retrieve a single subscriber ctrl
export const getSubscriberCtrl = async (req, res) => {
  try {
    const query = {
      _id: req.validatedParams.id,
    };

    const subscriber = await getSubscriber(query);

    return res.status(200).json({
      success: true,
      message: "Subscriber retrieved successfully!",
      data: subscriber,
    });
  } catch (error) {
    console.error("getSubscriberCtrl error:", error.message);

    next(error);
  }
};

//delete subscriber ctrl
export const deleteSubscriberCtrl = async (req, res, next) => {
  try {
    const query = {
      _id: req.validatedParams.id,
    };

    const delSubscriber = await deleteSubscriber(query);

    return res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully!",
      data: delSubscriber,
    });
  } catch (error) {
    console.error("deleteSubscriberCtrl error:", error.message);

    next(error);
  }
};