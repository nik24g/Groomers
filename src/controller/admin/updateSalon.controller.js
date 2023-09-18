const SalonModel = require("../../models/client/salon.model");
const messages = require("../../utils/constant");
const { successResponse, errorResponse } = require("../../utils/response");

const updateSalon = async (req, res) => {
  const SalonUuid = req.body.uuid;
  const salon = await SalonModel.findOne({ salon_uuid: SalonUuid });
  if (!salon) return errorResponse(404, messages.error.NO_SALON_UUID, {});

  let StringService = JSON.parse(req.body.service);
  const services = StringService.map((service) => {
    const structuredService = {
      service_name: service.name,
      service_discount: service.discount,
      service_original_price: service.price,
    };
    return structuredService;
  });
  let features = JSON.parse(req.body.features);
  features = {
    feature_wifi: features.wifi,
    feature_parking: features.parking,
    feature_AC: features.AC,
  };

  let languages = JSON.parse(req.body.languages);
  languages = {
    language_hindi: languages.hindi,
    language_english: languages.english,
    language_telugu: languages.telugu,
  };

  let StringCombo = JSON.parse(req.body.combo_service);
  const combo_services = StringCombo.map((combo) => {
    combo = {
      combo_name: combo.combo_name,
      combo_services_name: combo.services,
      combo_price: combo.combo_price,
    };
    return combo;
  });
  const location = { type: "Point", coordinates: req.body.location.split(",") };

  const updatedDetails = {
    salon_username: req.body.username,
    salon_password: req.body.password,
    salon_code: req.body.code,
    salon_name: req.body.name,
    salon_type: req.body.type,
    salon_address: req.body.address,
    salon_city: req.body.city,
    salon_state: req.body.state,
    salon_location: location,
    salon_franchise: req.body.franchise,
    salon_slots: req.body.slots_number,
    salon_services: services,
    salon_combo_services: combo_services,
    salon_opening_time: req.body.opening_time,
    salon_closing_time: req.body.closing_time,
    salon_lunch_time: req.body.lunch_time,
    salon_features: features,
    salon_languages: languages,
    salon_owner_name: req.body.owner_name,
    salon_owner_mobile: req.body.owner_mobile,
    salon_owner_pancard_number: req.body.owner_pancard_number,
    salon_bank_name: req.body.bank_name,
    salon_bank_account_number: req.body.bank_account_number,
    salon_bank_IFSC_code: req.body.bank_IFSC_code
  };
  if(req.body.block_dates){
    updatedDetails.salon_block_dates = req.body.block_dates
  }
  if(req.body.franchise == "true"){
    updatedDetails.salon_franchise_list = JSON.parse(req.body.franchise_salon)
  }
  // console.log(req.body.should_update_image);
  if (req.body.should_update_image == "true") {
    const photosPath = req.files.map((file) => file.path);
    updatedDetails.salon_photos = photosPath;
  }
  const updatedSalon = await SalonModel.findOneAndUpdate(
    { salon_uuid: SalonUuid },
    updatedDetails,
    { new: true }
  );
  return successResponse(202, messages.success.SALON_UPDATED, updatedSalon);
};

module.exports = updateSalon;

