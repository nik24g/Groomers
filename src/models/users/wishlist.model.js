const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');


// wishlist Schema
const wishlistSchema = new schema({
    wishlist_uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4()
    },
    wishlist_user_uuid: {
        type: String,
        required: true,
    },
    wishlist_salon_uuid: {
        type: String,
        required: true,
    },
    wishlist_service_name: {
        type: String,
        required: true        
    }
}, { timestamps: true })

// End of the modal

module.exports = mongoose.model("Wishlist", wishlistSchema, "wishlists");