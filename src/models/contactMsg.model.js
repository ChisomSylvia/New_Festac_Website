import { Schema, model } from "mongoose";


const contactMsgSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const ContactMsgModel = new model("contact-message", contactMsgSchema);
export default ContactMsgModel;