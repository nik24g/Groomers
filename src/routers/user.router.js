const express = require("express");
const router = express.Router();
const { successResponse, errorResponse } = require("../utils/response");
const messages = require("../utils/constant");
const tokenAuthentication = require("../middleware/users/verifyToken");
const registerUser = require("../controller/users/registration.controller");
const registrationValidator = require("../middleware/users/registration.joi.validator.js");
const generateOtpValidator = require("../middleware/users/generateOTP.joi.validator");
const OtpGenerate = require("../controller/users/OtpGenerate.controller");
const verifyNewUser = require("../controller/users/verifyNewUser.controller");
const verifyOtp = require("../middleware/users/verifyOTP.joi.validator");
const loginUser = require("../controller/users/loginUser.controller");
const loginJoiValidator = require("../middleware/users/login.joi.validator");
const showTimming = require("../controller/users/showTimming.controller");
const homeService = require("../controller/users/homeService.controller.js");

const {
  createWishList,
  getWishList,
  deleteWishList,
} = require("../controller/users/wishlist.controller");
const {
  createFeedback,
  getFeedback,
} = require("../controller/users/feedback.controller");
const ContactModel = require("../models/users/contactUs.model");
// const HomeServiceModel = require("../models/users/homeService.model");
const { v4: uuidv4 } = require("uuid");
const SalonModel = require("../models/client/salon.model");
const {
  newAppointment,
  cancelAppointment,
  reScheduleAppointment,
  appointments,
} = require("../controller/users/appointment.controller");
const appointmentValidator = require("../middleware/users/appointment.validation");
const rescheduleValidator = require("../middleware/users/reschedule.validation");
const {
  salonsByCity,
  salonByUuid,
  recommendedSalonsCode,
} = require("../controller/users/salon.controller");
const { user } = require("../controller/users/user.controller.js");

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
router.post(
  "/registration/generateOtp",
  generateOtpValidator,
  async (req, res) => {
    let response;
    try {
      response = await OtpGenerate(req, res);
      res.status(response.code).json(response);
    } catch (error) {
      res.send(errorResponse(500, messages.error.WRONG));
    }
  }
);
//otp verification for new users after registration
router.post("/registration/verification", verifyOtp, async (req, res) => {
  let response;
  try {
    response = await verifyNewUser(req, res);
    res.status(response.code).json(response);
  } catch (error) {
    res.send(errorResponse(500, messages.error.WRONG));
  }
});

// login verification through email and otp
router.post("/login/verification", loginJoiValidator, async (req, res) => {
  let response;
  try {
    response = await loginUser(req, res);
    return res.status(response.code).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});

//otp generation for login and sending to email id
router.post("/login/generateOtp", generateOtpValidator, async (req, res) => {
  let response;
  try {
    response = await OtpGenerate(req, res);
    res.status(response.code).json(response);
  } catch (error) {
    res.send(errorResponse(500, messages.error.WRONG));
  }
});
// login verification through email and otp
router.get("/details", tokenAuthentication, async (req, res) => {
  let response;
  try {
    response = await user(req);
    return res.status(response.code).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});

// route for getting all recommended salons of the city
router.get("/recommended-salons", tokenAuthentication, async (req, res) => {
  try {
    const city = req.query.city || process.env.DEFAULT_CITY;
    const salons = await SalonModel.find({
      salon_city: city,
      salon_isActive: true,
      salon_is_recommended: true,
    }).select(
      "-_id salon_uuid salon_code salon_name salon_description salon_address salon_photos"
    );
    return res.send(successResponse(201, messages.success.SUCCESS, salons));
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});

// route for getting all salon in the city without authentication
router.get("/salons", async (req, res) => {
  try {
    const response = await salonsByCity(req);
    return res.status(response.code).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});

// route for getting one perticular salon details from salon uuid
router.get("/salon", async (req, res) => {
  try {
    const response = await salonByUuid(req);
    return res.status(response.code).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});

// route for searching salons by name
router.get("/search/salon", async (req, res) => {
  try {
    const salonName = req.query.name;
    const salons = await SalonModel.find({
      salon_name: { $regex: salonName, $options: "i" },
      salon_isActive: true,
    }).select(
      "-_id salon_name salon_address salon_city salon_state salon_languages salon_features salon_photos"
    );
    return res
      .status(200)
      .json(successResponse(200, messages.success.SUCCESS, salons));
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});
router.get("/showtimings/:uuid", tokenAuthentication, async (req, res) => {
  let response;
  try {
    response = await showTimming(req);
    return res.status(response.code).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});

// route for creating appointments
router.post(
  "/create_appointment",
  tokenAuthentication,
  appointmentValidator,
  async (req, res) => {
    let response;
    try {
      response = await newAppointment(req);
      return res.status(response.code).json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
  }
);

// route for cancelling the appointment
router.get(
  "/cancel_appointment/:uuid",
  tokenAuthentication,
  async (req, res) => {
    let response;
    try {
      response = await cancelAppointment(req);
      return res.status(response.code).json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
  }
);

// route for reschedule the appointments
router.post(
  "/reschedule_appointment",
  tokenAuthentication,
  rescheduleValidator,
  async (req, res) => {
    let response;
    try {
      response = await reScheduleAppointment(req);
      return res.status(response.code).json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json(errorResponse(500, messages.error.WRONG));
    }
  }
);

// route for getting all appointments
router.get("/appointments", tokenAuthentication, async (req, res) => {
  let response;
  try {
    response = await appointments(req);
    return res.status(response.code).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});

router.post("/wishlist/create", tokenAuthentication, async (req, res) => {
  let response;
  try {
    response = await createWishList(req);
    return res.status(response.code).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});
router.get("/wishlist", tokenAuthentication, async (req, res) => {
  let response;
  try {
    response = await getWishList(req);
    return res.status(response.code).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});
router.delete("/wishlist/delete", tokenAuthentication, async (req, res) => {
  let response;
  try {
    response = await deleteWishList(req);
    return res.status(response.code).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});

router.post("/feedback/create", tokenAuthentication, async (req, res) => {
  let response;
  try {
    response = await createFeedback(req);
    return res.status(response.code).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});

router.get("/feedback/getFeedback", async (req, res) => {
  let response;
  try {
    response = await getFeedback(req);
    return res.status(response.code).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});
router.post("/homeService", tokenAuthentication, async (req, res) => {
  try {
    const newUser = await homeService(req);
    return res.send(successResponse(201, messages.success.SUCCESS, newUser));
  } catch (error) {
    res.send(errorResponse(409, error));
  }
});
router.post("/contactUs", async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const message = req.body.message;
  try {
    const contact = new ContactModel({
      contact_uuid: uuidv4(),
      contact_email: email,
      contact_name: name,
      contact_message: message,
    });
    await contact.save();
    return res.send(successResponse(201, messages.success.SUCCESS, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});

router.get("/recommended-salon-code", async (req, res) => {
  try {
    const response = await recommendedSalonsCode(req);
    return res.status(response.code).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errorResponse(500, messages.error.WRONG));
  }
});

module.exports = router;
//developed by Nitin Goswami
// I know there are a lot of things those are not configured correctly but i had very less time to develop this.
// nitingoswami1900@gmail.com
