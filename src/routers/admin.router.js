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
const {getSalonById, getAllSalons} = require("../controller/admin/getSalons.controller.js")
const updateSalon = require("../controller/admin/updateSalon.controller.js")
const generateSlotOnBoard = require("../controller/admin/slotOnboard.controller")
const generateDailySlots = require("../controller/admin/dailySlots.controller")
const {getFeedback, deleteFeedback, createFeedback} = require("../controller/admin/feedback.controller")
const ContactModel = require("../models/users/contactUs.model")
const HomeServiceModel = require("../models/users/homeService.model")
const newSalonValidation = require("../middleware/admin/newSalon.joi.validator")
const {deleteSalonBySalonId, toggleSalon, salonCode, toggleSalonRecommend} = require("../controller/admin/salon.controller")
const {completeAppointments} = require("../controller/admin/appointment.controller")
// route for creating new admin 
router.post("/registration", newAdminValidator, async (req, res) => {
    try {
        const newAdmin = await registerAdmin(req);
        return res.status(201).json(successResponse(201, messages.success.ADMIN_CREATED, {}));
    } catch (error) {
        return res.send(errorResponse(409, error, {}));
    }
});

//route for login admin
router.post("/login", adminLoginJoiValidator, async (req, res) => {
    let response;
    try {
        response = await loginAdmin(req, res);
        return res.status(response.code).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
});

//route for adding new salon
router.post("/add-new-salon", tokenAuthentication, uploadFile.array('photos'), newSalonValidation, async (req, res) => {
    let response;
    try {
        response = await addNewSalon(req, res);
        return res.status(201).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG))
    }
});

//route for updating existing salon's details
router.patch("/salon/update", tokenAuthentication, uploadFile.array('photos'), async (req, res) => {
    let response;
    try {
        response = await updateSalon(req, res);
        return res.status(202).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
});

// getting all salons or salon by salon id 
router.get("/salons", tokenAuthentication, async (req, res)=>{
    let response;
    try {
        response = await getSalonById(req);
        return res.status(response.code).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})

// getting all salons list
router.get("/all-salons", tokenAuthentication, async (req, res)=>{
    let response;
    try {
        response = await getAllSalons(req);
        return res.status(200).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG))
    }
})
// delelte salon by salon id
router.delete("/delete-by-id", tokenAuthentication, async (req, res) => {
    let response;
    try {
        if(!req.body.salon_code) return res.status(400).json(errorResponse(400, "Salon code is required", {}))
        response = await deleteSalonBySalonId(req);
        return res.status(response.code).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG))
    }
})

// route for enable and disable the salon or a salon toggle route
router.patch("/toggle-salon", tokenAuthentication, async (req, res) => {
    let response;
    try {
        if(!req.body.salon_code) return res.status(400).json(errorResponse(400, "Salon code is required", {}))
        response = await toggleSalon(req);
        return res.status(response.code).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG))
    }
})

// route for getting salon code for upcoming salon
router.get("/salon-code", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await salonCode(req);
        return res.status(response.code).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG))
    }
})

router.post("/generateSlotOnBoard", async (req, res)=>{
    let response;
    try {
        response = await generateSlotOnBoard(req);
        return res.status(201).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})
router.get("/generateDailySlots", async (req, res)=>{
    let response;
    try {
        response = await generateDailySlots(req);
        return res.status(201).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})

router.post("/feedback", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await createFeedback(req)
        return res.status(response.code).json(response)
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
router.delete("/feedback/delete", tokenAuthentication, async (req, res) => {
    let response;
    try {
        response = await deleteFeedback(req)
        return res.status(202).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})
router.get("/contact", tokenAuthentication, async (req, res) => {
    try {
        const contacts = await ContactModel.find()
        return res.send(successResponse(200, messages.success.SUCCESS, contacts))
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})
router.delete("/contact", tokenAuthentication, async (req, res) => {
    try {
        const contacts = await ContactModel.findOneAndDelete({contact_uuid: req.body.contact_uuid})
        return res.status(202).json(successResponse(202, messages.success.DELETED, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})

router.get("/homeService", tokenAuthentication, async (req, res) => {
    try {
        const services = await HomeServiceModel.find()
        return res.send(successResponse(200, messages.success.SUCCESS, services))
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})
router.delete("/homeService", tokenAuthentication, async (req, res) => {
    try {
        const service = await HomeServiceModel.findOneAndDelete({home_uuid: req.body.service_uuid})
        return res.status(202).json(successResponse(202, messages.success.DELETED, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})

// router for changing all the booked appointments status to complete 
router.patch("/update-appointments-status", tokenAuthentication, async (req, res) => {
    try {
        const response = await completeAppointments(req)
        return res.status(response.code).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})


// router for toggle salon recommended 
router.patch("/toggle-recommended", tokenAuthentication, async (req, res) => {
    try {
        const response = await toggleSalonRecommend(req)
        return res.status(response.code).json(response)
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
})
module.exports = router;