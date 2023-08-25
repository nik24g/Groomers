const express = require("express");
const router = express.Router();
const { successResponse, errorResponse } = require("../utils/response");
const messages = require("../utils/constant")
const tokenAuthentication = require("../middleware/users/verifyToken")
const registerUser = require("../controller/users/registration.controller");
const registrationValidator = require("../middleware/users/registration.joi.validator.js")
const generateOtpValidator = require("../middleware/users/generateOTP.joi.validator")
const OtpGenerate = require("../controller/users/OtpGenerate.controller");
const verifyNewUser = require("../controller/users/verifyNewUser.controller");
const verifyOtp = require("../middleware/users/verifyOTP.joi.validator");
const loginUser = require("../controller/users/loginUser.controller");
const loginJoiValidator = require("../middleware/users/login.joi.validator");
const showTimming = require("../controller/users/showTimming.controller")
const {createWishList, getWishList, deleteWishList} = require("../controller/users/wishlist.controller")
const {createFeedback, getFeedback} = require("../controller/users/feedback.controller")
const ContactModel = require("../models/users/contactUs.model")
const HomeServiceModel = require("../models/users/homeService.model")
const { v4: uuidv4 } = require('uuid');
const SalonModel = require("../models/client/salon.model")

// router for user or customer registration
router.post("/registration", registrationValidator, async (req, res) => {
    try {
        const newUser = await registerUser(req);
        res.send(successResponse(201, messages.success.USER_CREATED, newUser));
    } catch (error) {
        res.send(errorResponse(409, error));
    }
});
//otp generation for new account sending to email id
router.post("/registration/generateOtp", generateOtpValidator, async (req, res) => {
    let response;
    try {
        response = await OtpGenerate(req, res);
        res.send(response)
    } catch (error) {
        res.send(errorResponse(500, messages.error.WRONG))
    }
})
//otp verification for new users after registration
router.post("/registration/verification", verifyOtp, async (req, res) => {
    let response;
    try {
        response = await verifyNewUser(req, res);
        res.send(response)
    } catch (error) {
        res.send(errorResponse(500, messages.error.WRONG))
    }
})

//otp generation for login and sending to email id
router.post("/login/generateOtp", generateOtpValidator, async (req, res) => {
    let response;
    try {
        response = await OtpGenerate(req, res);
        res.send(response)
    } catch (error) {
        res.send(errorResponse(500, messages.error.WRONG))
    }
})
// login verification through email and otp
router.post("/login/verification", loginJoiValidator, async (req, res) => {
    let response;
    try {
        response = await loginUser(req, res);
        return res.send(response);
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
});
router.get("/auth-salons", tokenAuthentication, async (req, res) => {
    try {
        const city = req.query.city
        const salons = await SalonModel.find({salon_city: city}).select("-_id salon_name salon_address salon_city salon_state salon_languages salon_features salon_photos")
        return res.send(successResponse(201, messages.success.SUCCESS, salons))
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.get("/salons", async (req, res) => {
    try {
        const city = req.query.city
        const salons = await SalonModel.find({salon_city: city}).select("-_id salon_name salon_address salon_city salon_state salon_languages salon_features salon_photos")
        return res.send(successResponse(201, messages.success.SUCCESS, salons))
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.get("/search/salon", async (req, res) => {
    try {
        const salonName = req.query.name
        const salons = await SalonModel.find({"salon_name": { "$regex": salonName, "$options": "i"}}).select("-_id salon_name salon_address salon_city salon_state salon_languages salon_features salon_photos")
        return res.send(successResponse(201, messages.success.SUCCESS, salons))
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.get("/showtimings/:uuid", tokenAuthentication,async (req, res) => {
    let response;
    try {
        response = await showTimming(req)
        return res.send(response)
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.post("/wishlist/create", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await createWishList(req)
        return res.send(response)
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.get("/wishlist/getwishlist", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await getWishList(req)
        return res.send(response)
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.delete("/wishlist/delete", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await deleteWishList(req)
        return res.send(response)
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})

router.post("/feedback/create", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await createFeedback(req)
        return res.send(response)
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.get("/feedback/getFeedback", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await getFeedback(req)
        return res.send(response)
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.get("/homeService", tokenAuthentication, async (req, res) => {
    try {
        const homeService = new HomeServiceModel({home_uuid: uuidv4(), home_email: req.email, home_mobile: req.mobile})
        await homeService.save()
        return res.send(successResponse(201, messages.success.SUCCESS, {}))
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.post("/contactUs", async (req, res) => {
    const email = req.body.email
    const name = req.body.name
    const message = req.body.message
    try {
        const contact = new ContactModel({contact_uuid: uuidv4(), contact_email: email, contact_name: name, contact_message: message})
        await contact.save()
        return res.send(successResponse(201, messages.success.SUCCESS, {}))
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})

module.exports = router;