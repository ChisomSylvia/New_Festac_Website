import { Schema, model } from "mongoose";
import { CATEGORY, PROP_STATUS, TYPE } from "../configs/constants.config.js";

const propertySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    originalPublicIdBase: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    keyFeatures: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: String,
      required: true,
      trim: true,
      default: "0 Naira",
    },

    contactInfo: {
      phoneNumber: { type: String, default: "08134560933" },
      whatsappNo: { type: String, default: "+2348126594320" },
      email: { type: String, lowercase: true, default: "info@nfpdcl.com" },
    },

    category: [
      {
        type: String,
        enum: Object.values(CATEGORY),
        default: null,
        required: true,
      },
    ],

    type: {
      type: String,
      enum: Object.values(TYPE),
      default: null,
      required: true,
    },

    images: [
      {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
      },
    ],

    bedrooms: {
      type: String,
      required: function () {
        return this.category === CATEGORY.RESIDENTIAL;
      },
    },

    bathrooms: {
      type: String,
      required: function () {
        return this.category === CATEGORY.RESIDENTIAL;
      },
    },

    status: {
      type: String,
      enum: Object.values(PROP_STATUS),
      default: PROP_STATUS.AVAILABLE,
      required: true,
    },

    listedAt: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

// propertySchema.index({ status: 1 });
// propertySchema.index({ type: 1 });
// propertySchema.index({ bedrooms: 1 });
// propertySchema.index({ bathrooms: 1 });
// propertySchema.index({ size: 1 });
// propertySchema.index({ price: 1 });
// propertySchema.index({ listedAt: 1 });

propertySchema.index({ status: 1, type: 1, bedrooms: 1, price: 1, listedAt: -1 });

propertySchema.index({
  title: "text",
  description: "text",
  keyFeatures: "text",
  location: "text",
});

const PropertyModel = new model("property", propertySchema);
export default PropertyModel;