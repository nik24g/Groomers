const SalonModel = require("../../models/client/salon.model");
const messages = require("../../utils/constant");
const { successResponse, errorResponse } = require("../../utils/response");
const { v4: uuidv4 } = require("uuid");

// salon type shoud one of male, female, unisex
const addNewSalon = async (req) => {
  const services = JSON.parse(req.body.service).map((service) => {
    // service = JSON.parse(service)
    const structuredService = {
      service_name: service.name,
      service_discount: service.discount,
      service_original_price: service.price,
      service_duration: service.duration,
    };
    return structuredService;
  });
  // console.log("body:", req.body);

  let features = JSON.parse(req.body.features);
  features = {
    feature_wifi: features.wifi,
    feature_parking: features.parking,
    feature_AC: features.AC,
  };

  // console.log(req.body.languages, typeof req.body.languages);
  let languages = JSON.parse(req.body.languages);
  languages = {
    language_hindi: languages.hindi,
    language_english: languages.english,
    language_telugu: languages.telugu,
  };
  const combo_services = JSON.parse(req.body.combo_service).map((combo) => {
    // combo = JSON.parse(combo);
    combo = {
      combo_name: combo.combo_name,
      combo_services_name: combo.services,
      combo_price: combo.combo_price,
      combo_duration: combo.duration,
    };
    return combo;
  });
  const location = { type: "Point", coordinates: req.body.location.split(",") };
  const photosPath = req.files.map((file) => file.path);

  const salon = new SalonModel({
    salon_uuid: uuidv4(),
    salon_username: req.body.username,
    salon_password: req.body.password,
    salon_code: req.body.code,
    salon_name: req.body.name,
    salon_email: req.body.email,
    salon_description: req.body.description,
    salon_type: req.body.type,
    salon_address: req.body.address,
    salon_area: req.body.area,
    salon_city: req.body.city,
    salon_state: req.body.state,
    salon_location: location,
    salon_slots: req.body.slots_number,
    salon_services: services,
    salon_combo_services: combo_services,
    salon_opening_time: req.body.opening_time,
    salon_closing_time: req.body.closing_time,
    salon_lunch_start_time: req.body.lunch_start_time,
    salon_lunch_end_time: req.body.lunch_end_time,
    salon_photos: photosPath,
    salon_features: features,
    salon_languages: languages,
    salon_owner_name: req.body.owner_name,
    salon_owner_mobile: req.body.owner_mobile,
    salon_owner_pancard_number: req.body.owner_pancard_number,
    salon_bank_name: req.body.bank_name,
    salon_bank_account_number: req.body.bank_account_number,
    salon_bank_IFSC_code: req.body.bank_IFSC_code,
  });
  const response = await salon.save();
  return successResponse(201, messages.success.SALON_ADDED, { response });
};

module.exports = addNewSalon;
