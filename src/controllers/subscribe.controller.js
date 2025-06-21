import {
  createSubscriber,
  getSubscriber,
  getSubscribers,
  deleteSubscriber,
} from "../services/subscribe.service.js";
import {
  sendSubscribedEmail
} from "../utils/sendMail.util.js";

export const createSubscriberCtrl = async (req, res) => {
  const {
    body
  } = req;
  body.email = body.email.toLowerCase();

  const subscriber = await getSubscriber({
    email: body.email
  });
  if (subscriber) {
    return res.status(401).json({
      success: false,
      message: "You've already subscribed!",
    });
  }

  const newSubscriber = await createSubscriber(body);

  const { email } = newSubscriber;

  const emailResult = await sendSubscribedEmail (email);

  if (!emailResult.success) {
    console.error("Email notification failed", emailResult.message);
    return res.status(500).json({
      success: false,
      message: "User subscribed but email motification failed",
      data: newSubscriber,
    })
  }

  return res.status(201).json({
    success: true,
    message: "A new subscriber created successfully!",
    data: newSubscriber,
  });
};

export const getSubscribersCtrl = async (req, res) => {
  const subscribers = await getSubscribers();

  if (subscribers.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Subscribers list is empty or have already been deleted!",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Subscribers retrieved successfully!",
    data: subscribers,
  });
};

export const getSubscriberCtrl = async (req, res) => {
  const query = {
    _id: req.params.id
  };

  const subscriber = await getSubscriber(query);
  if (!subscriber) {
    return res.status(404).json({
      success: false,
      message: "Subscriber not found or already deleted!",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Subscriber retrieved successfully!",
    data: subscriber,
  });
};

export const deleteSubscriberCtrl = async (req, res) => {
  const query = {
    _id: req.params.id
  };

  const subscriber = await getSubscriber(query);
  if (!subscriber) {
    return res.status(404).json({
      success: false,
      message: "Subscriber not found or already deleted!",
    });
  }

  const delSubscriber = await deleteSubscriber(query);
  return res.status(200).json({
    success: true,
    message: "Subscriber deleted successfully!",
    data: delSubscriber,
  });
};