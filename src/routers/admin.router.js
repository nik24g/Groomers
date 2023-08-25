const express = require("express");
const router = express.Router();
const { successResponse, errorResponse } = require("../utils/response");
const messages = require("../utils/constant")
const registerAdmin = require("../controller/admin/createAdmin.controller")
const newAdminValidator = require("../middleware/admin/newAdmin.joi.validator")
const adminLoginJoiValidator = require("../middleware/admin/login.joi.validator")
const loginAdmin = require("../controller/admin/login.controller")
const tokenAuthentication = require("../middleware/admin/verifyTokenAdmin")
const addNewSalon = require("../controller/admin/newSalon.controller.js")
const uploadFile = require('../middleware/upload');
const getAllSalons = require("../controller/admin/getSalons.controller.js")
const updateSalon = require("../controller/admin/updateSalon.controller.js")
const generateSlotOnBoard = require("../controller/admin/slotOnboard.controller")
const generateDailySlots = require("../controller/admin/dailySlots.controller")
const {getFeedback, deleteFeedback} = require("../controller/admin/feedback.controller")
const ContactModel = require("../models/users/contactUs.model")
const HomeServiceModel = require("../models/users/homeService.model")

// route for creating new admin 
router.post("/registration", newAdminValidator, async (req, res) => {
    try {
        const newAdmin = await registerAdmin(req);
        return res.send(successResponse(201, messages.success.ADMIN_CREATED, {}));
    } catch (error) {
        return res.send(errorResponse(409, error, {}));
    }
});

//route for login admin
router.post("/login", adminLoginJoiValidator, async (req, res) => {
    let response;
    try {
        response = await loginAdmin(req, res);
        return res.send(response);
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
});

//route for adding new salon
router.post("/add-new-salon", tokenAuthentication, uploadFile.array('photos'), async (req, res) => {
    let response;
    try {
        response = await addNewSalon(req, res);
        return res.send(response);
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
});

//route for updating existing salon's details
router.patch("/salon/update", tokenAuthentication, uploadFile.array('photos'), async (req, res) => {
    let response;
    try {
        response = await updateSalon(req, res);
        return res.send(response);
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
});

// getting all salons or salon by salon id 
router.get("/salons", tokenAuthentication, async (req, res)=>{
    let response;
    try {
        response = await getAllSalons(req);
        return res.send(response)
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})

router.post("/generateSlotOnBoard", async (req, res)=>{
    let response;
    try {
        response = await generateSlotOnBoard(req);
        return res.send(response)
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.get("/generateDailySlots", async (req, res)=>{
    let response;
    try {
        response = await generateDailySlots(req);
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
router.delete("/feedback/delete", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await deleteFeedback(req)
        return res.send(response)
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.get("/contact", tokenAuthentication, async (req, res) => {
    try {
        const contacts = await ContactModel.find()
        return res.send(successResponse(200, messages.success.SUCCESS, contacts))
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.delete("/contact", tokenAuthentication, async (req, res) => {
    try {
        const contacts = await ContactModel.findOneAndDelete({contact_uuid: req.body.contact_uuid})
        return res.send(successResponse(203, messages.success.DELETED, {}))
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.get("/homeService", tokenAuthentication, async (req, res) => {
    try {
        const services = await HomeServiceModel.find()
        return res.send(successResponse(200, messages.success.SUCCESS, services))
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
router.delete("/homeService", tokenAuthentication, async (req, res) => {
    try {
        const service = await HomeServiceModel.findOneAndDelete({home_uuid: req.body.service_uuid})
        return res.send(successResponse(203, messages.success.DELETED, {}))
    } catch (error) {
        console.log(error);
        return res.send(errorResponse(500, messages.error.WRONG));
    }
})
module.exports = router;