const express = require("express");
const router = express.Router();
const { successResponse, errorResponse } = require("../utils/response");
const messages = require("../utils/constant")
const loginClient = require("../controller/client/loginClient.controller")
const clientLoginJoiValidator = require("../middleware/client/login.joi.validator")
const salonInfo = require("../controller/client/salonInfo.controller")
const tokenAuthentication = require("../middleware/client/verifyTokenClient")
const {disableSlot} = require("../controller/client/toggleSlot.controller.js")
const {enableSlot} = require("../controller/client/toggleSlot.controller.js")
const toggleSalon = require("../controller/client/toggleSalonHoliday.controller")
const {getFeedback} = require("../controller/client/feedback.controller")

router.post("/login", clientLoginJoiValidator, async (req, res) => {
    let response;
    try {
        response = await loginClient(req, res);
        return res.send(response);
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
});

router.get("/mysalon", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await salonInfo(req)
        return res.send(response)
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG, {}));
    }
})

// disable slot route
router.get("/disable-slot", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await disableSlot(req)
        res.send(response)
    } catch (error){
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG, {}));
    }
})
// enable slot route
router.get("/enable-slot", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await enableSlot(req)
        res.send(response)
    } catch (error){
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG, {}));
    }
})

// toggle Salon for holiday for that day
router.get("/toggleSalonHoliday", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await toggleSalon(req)
        res.send(response)
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG, {}));
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
module.exports = router;