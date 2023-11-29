const express = require("express");
const router = express.Router();
const { successResponse, errorResponse } = require("../utils/response");
const messages = require("../utils/constant")
const loginClient = require("../controller/client/loginClient.controller")
const clientLoginJoiValidator = require("../middleware/client/login.joi.validator")
const salonInfo = require("../controller/client/salonInfo.controller")
const tokenAuthentication = require("../middleware/client/verifyTokenClient")
const {toggleSlot} = require("../controller/client/slot.controller.js")
const toggleSalon = require("../controller/client/toggleSalonHoliday.controller")
const {getFeedback} = require("../controller/client/feedback.controller")
const {appointments} = require("../controller/client/appointment.controller")
const {revenue} = require("../controller/client/revenue.controller")
const {markCompleteAppointment} = require("../controller/client/appointment.controller")
const statusChangeValidation = require("../middleware/client/changeAppointmentStatus.validator")

router.post("/login", clientLoginJoiValidator, async (req, res) => {
    let response;
    try {
        response = await loginClient(req, res);
        return res.status(response.code).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
});

router.get("/mysalon", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await salonInfo(req)
        return res.status(response.code).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})

// toggle slot route
router.patch("/toggle-slot", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await toggleSlot(req)
        return res.status(response.code).json(response)
    } catch (error){
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})


// toggle Salon for holiday for that day
router.get("/toggleSalonHoliday", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await toggleSalon(req)
        res.status(response.code).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})
router.get("/feedback/getFeedback", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await getFeedback(req)
        return res.status(response.code).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})

// route for getting all appointments list with details 
router.get("/appointments", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await appointments(req)
        return res.status(response.code).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})

// route for getting revenue
router.get("/revenue", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await revenue(req)
        return res.status(response.code).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})

// router for updating appointment status from booked to complete
router.patch("/update-appointments-status", tokenAuthentication, statusChangeValidation, async (req, res) => {
    let response;
    try {
        response = await markCompleteAppointment(req)
        return res.status(response.code).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})
module.exports = router;
//developed by Nitin Goswami
// I know there are a lot of things those are not configured correctly but i had very less time to develop this.
// nitingoswami1900@gmail.com