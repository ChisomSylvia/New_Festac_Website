import {
  Schema,
  model
} from "mongoose";

const subscribeSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
}, {
  versionKey: false,
  timestamps: true,
});

const SubscribeModel = new model("subscriber", subscribeSchema);
export default SubscribeModel;