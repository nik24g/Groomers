const validation = require("../../utils/admin/newSalon.joi")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const SalonModel = require("../../models/client/salon.model")
const newSalonValidation = async (req, res, next) => {
    const services = JSON.parse(req.body.service).map((service) => {
        // service = JSON.parse(service)
        const structuredService = {
          name: service.name,
          discount: service.discount,
          original_price: service.price,
          duration: service.duration,
        };
        return structuredService;
      });

      const combo_services = JSON.parse(req.body.combo_service).map((combo) => {
        // combo = JSON.parse(combo);
        combo = {
          name: combo.combo_name,
          services_name: combo.services,
          price: combo.combo_price,
          duration: combo.duration,
        };
        return combo;
      });
	const payload = {
        username: req.body.username,
        password: req.body.password,
        code: req.body.code,
        name: req.body.name,
        email: req.body.email,
        type: req.body.type,
        address: req.body.address,
        description: req.body.description,
        area: req.body.area,
        city: req.body.city,
        state: req.body.state,
        location: req.body.location,
        slots: req.body.slots_number,
        services: services,
        combo_services: combo_services,
        opening_time: req.body.opening_time,
        closing_time: req.body.closing_time,
        lunch_end_time: req.body.lunch_end_time,
        lunch_start_time: req.body.lunch_start_time,
        features: JSON.parse(req.body.features),
        languages: JSON.parse(req.body.languages),
        owner_name: req.body.owner_name,
        owner_mobile: req.body.owner_mobile,
        owner_pancard_number: req.body.owner_pancard_number,
        bank_name: req.body.bank_name,
        bank_account_number: req.body.bank_account_number,
        bank_IFSC_code: req.body.bank_IFSC_code
    };
	const { error } = validation.validate(payload);

    // checking if any salon already registered with given username 
    var salon = await SalonModel.findOne({salon_username: req.body.username})
    if(salon) return res.status(406).json(errorResponse(406, messages.success.ALREADY_SALON, {}))

    // checking if any salon already registered with given salon code
    var salon = await SalonModel.findOne({salon_code: req.body.code})
    if(salon) return res.status(406).json(errorResponse(406, messages.success.ALREADY_SALON, {}))
    
	if (error) {
		return res.send(errorResponse(406, error.details[0].message, {}));
	} else {
		next();
	}
};
module.exports = newSalonValidation;