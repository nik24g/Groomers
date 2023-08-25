const mongoose = require("mongoose")
const schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');
// uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

const salonSchema = new schema({
    salon_uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4()
    },
    salon_username: {
        type: String,
        required: true,
        unique: true,
    },
    salon_password: {
        type: String,
        required: true,
    },
    salon_code: {
        type: String,
        required: true,
        unique: true,
    },
    salon_name: {
        type: String,
        required: true,
    },
    salon_address: {
        type: String,
        required: true,
    },
    salon_city: {
        type: String,
    },
    salon_state: {
        type: String,
    },
    salon_location: {
        type: { type: String },
        coordinates: []
    },
    salon_franchise: {
        type: Boolean,
        required: true,
    },
    salon_franchise_list: [
        {
            type: String
        }
    ],
    salon_slots: {
        type: String,
        required: true,
    },
    salon_services: [
        {
            service_name: {
                type: String,
                required: true
            },
            service_discount: {
                type: String
            },
            service_original_price: {
                type: String,
                required: true
            },
            service_duration: {
                type: String,
                required: true
            }
        }
    ],
    salon_combo_services: [
        {   
            combo_name: {
                type: String,
                required: true
            },
            combo_services_name: [
                {
                    type: String,
                    required: true
                }
            ],
            combo_price: {
                type: String,
                required: true
            },
            combo_duration: {
                type: String,
                required: true
            }
        }
    ],
    salon_opening_time: {
        type: String,
        required: true,
    },
    salon_closing_time: {
        type: String,
        required: true,
    },
    salon_lunch_time: {
        type: String,
        required: true,
    },
    salon_photos: [{
        type: String
    }],
    salon_features:
    {
        feature_wifi: {
            type: Boolean,
            default: false
        },
        feature_parking: {
            type: Boolean,
            default: false
        },
        feature_AC: {
            type: Boolean,
            default: false
        }
    },

    salon_languages:
    {
        language_hindi: {
            type: Boolean,
            default: false
        },
        language_english: {
            type: Boolean,
            default: false
        },
        language_telugu: {
            type: Boolean,
            default: false
        },
    }
    ,
    salon_owner_name: {
        type: String,
        required: true
    },
    salon_owner_mobile: {
        type: String,
        required: true
    },
    salon_owner_pancard_number: {
        type: String,
        required: true
    },
    salon_bank_name: {
        type: String,
        required: true
    },
    salon_bank_account_number: {
        type: String,
        required: true
    },
    salon_bank_IFSC_code: {
        type: String,
        required: true
    },
    salon_block_dates: [
        {
            type: String
        }    
    ]
},
    { timestamps: true }
);
module.exports = mongoose.model("salon", salonSchema, "salons");