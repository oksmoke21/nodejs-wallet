import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
    {
        senderBalance: {
            type: Number,
            required: true,
        },
        receiverBalance: {
            type: Number,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    },
    { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);