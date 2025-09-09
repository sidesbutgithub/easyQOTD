import { Schema, model } from "mongoose"
const channelSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    serverId: {
        type: String,
        required: true
    },
    scheduledNext: {
        type: Number,
        required: true,
        default: () => -1
    },
    scheduleInterval: {
        type: Number,
        required: true,
        default: () => -1
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    }
});
const RegisteredChannel = model('RegisteredChannel', channelSchema);
export { RegisteredChannel }