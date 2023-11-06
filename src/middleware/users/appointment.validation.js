const messages = require("../../utils/constant");
const { successResponse, errorResponse } = require("../../utils/response");
const SalonModel = require("../../models/client/salon.model")
const SlotModel = require("../../models/client/slot.model")
const validation = require("../../utils/appointment.joi")
const moment = require('moment');

const checkAppointment = async (req, res, next) => {
    try {
        const slotUuid = req.body.slot_uuid
        const salonUuid = req.body.salon_uuid
        // we are validating joi with inputs 
        const payload = {
            salon_uuid: salonUuid,
            slot_uuid: slotUuid,
            duration: req.body.duration,
            timing: req.body.timing,
            date: req.body.date,
            services: req.body.services,
            combos: req.body.combos,
            is_guest_appointment: req.body.is_guest_appointment,
            full_name: req.body.full_name,
            mobile: req.body.mobile,
        };
        const { error } = validation.validate(payload);
        if (error) return res.status(400).json(errorResponse(400, error.details[0].message, {}));
        
        // now we will validate the slots that are they available or not if available then we will attach the slot uuids with req object

        const slot = await SlotModel.findOne({slot_uuid: slotUuid, slot_isActive: true, slot_date: req.body.date, slot_time: req.body.timing})
        // console.log(slot);
        if(!slot) return res.status(400).json(errorResponse(400, messages.error.SLOT_NOT_AVAILABLE, {}));
        const slotUuids = []
        slotUuids.push(slotUuid)
        const numberOfSlots = parseInt(req.body.duration) / 30
        const slotTime = moment(slot.slot_time, 'h:mm A');
        for (let i = 0; i < numberOfSlots - 1; i++) {
            slotTime.add(30, "minutes");
            const nextSlot = await SlotModel.findOne({slot_salon_uuid: salonUuid, slot_date: slot.slot_date, slot_time: slotTime.format('h:mm A'), slot_isActive: true})
            if(!nextSlot) return res.status(400).json(errorResponse(400, messages.error.SLOT_NOT_AVAILABLE, {}));
            slotUuids.push(nextSlot.slot_uuid)
        }
        req.slotUuids = slotUuids
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json(errorResponse(400, messages.error.WRONG, {}));
    }
};

module.exports = checkAppointment;
