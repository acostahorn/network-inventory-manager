const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'email required'],
        unique: true
    },
    // --- Added for Password Reset Flow ---
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    // -------------------------------------
    //Gatekeeper propriety here:
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // The cart is an array of objects
    cart: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product', // Links to your Product model
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity cannot be less than 1.'],
                default: 1
            }
        }
    ],
    designState: {
        type: String,
        default: "{}"
    },
    designStatus: {
        type: String,
        enum: ['None', 'Pending Approval', 'Approved', 'Rejected'],
        default: 'None'
    },
     labourCost: {
        type: Number,
        default: 0
    }
});

// Note: passport-local-mongoose automatically handles hashing and adds 
// 'username' and 'hash' fields to the schema behind the scenes.
userSchema.plugin(passportLocalMongoose.default);

const User = mongoose.model('User', userSchema);

module.exports = User;