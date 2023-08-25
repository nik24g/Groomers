const success = {
    SUCCESS: "success..",
    USER_CREATED: "User is created.",
    ADMIN_CREATED: "Admin is created.",
    NO_USER_FOUND: "No User Found Please do Sign Up first",
    OTP_CREATED: "OTP sent to your email Id. Now Please verify with OTP",
    USER_VERIFIED: "OTP verified, Now You can Login.",
    REGISTRATION_OTP_CREATED: "OTP sent to your email Id. Now Please Verify your account with OTP.",
    OTP_EXPIRED: "OTP is expired now. Please generate New OTP",
    LOGGED_IN: "User logged in successfully",
    INVALID_OTP: "OTP is Invalid. Try again...",
    OTP_LIMIT: "You exceed your Wrong OTP limit. Now generate New OTP after 2 Minutes",
    ADMIN_LOGIN: "Logged in successfully",
    SALON_ADDED: "Salon added successfully.",
    ALREADY_SALON: "Salon already found with this salon code.",
    SALON_UPDATED: "Salon updated successfully.",
    SLOTS_CREATED_ONBOARD: "Slots Created for 7 days including today.",
    SLOTS_CREATED_DAILY: "Slots created for all salons.",
    WISHLIST_DELETED: "Wishlist is deleted.",
    DELETED: "Deleted.",
    SLOT_DISABLE: "Slot is disable",
    SLOT_ENABLE: "Slot is enable",
    REACHED_LIMIT: "Limit reached."
}
const error = {
    WRONG: "Something went wrong..",
    ALREADY_USER: "User is already registered..",
    ALREADY_ADMIN: "Admin is already registered.",
    NO_OTP: "Please Generate OTP First.",
    INVALID_JWT: "Unauthorized access",
    WRONG_PASSWORD: "Wrong password.",
    WRONG_WITH_JWT: "Something went wrong with jwt token",
    USER_NOT_FOUND: "This is user not registerd. Please do sign Up first..",
    ADMIN_NOT_FOUND: "Admin not found. Please create new Admin",
    NO_USER: "User not found.",
    NOT_AUTHORIZED: "You are not authorized to perform this.",
    NO_ITEM: "No item found.",
    NO_JWT: "Token not found",
    MISSING_INPUTS: "Required input for registration are not found",
    NO_SALON_FOUND: "No Salon found with this Salon code.",
    NO_SALON_UUID: "No Salon found with this uuid.",
    WRONG_SALON_CODE: "Salon code is wrong or salon not available, check salon code.",
    OTHER_SALON_INFO: "You are not authorise to perform this task.",
    SLOT_NOT_FOUND: "Slot not found with this uuid.",
    NOT_FOUND: "Not found"
}


module.exports = { success, error};