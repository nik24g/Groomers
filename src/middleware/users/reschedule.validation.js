const messages = require("../../utils/constant");
const { successResponse, errorResponse } = require("../../utils/response");
const SlotModel = require("../../models/client/slot.model")
const validation = require("../../utils/rescheduleAppointment.joi")
const checkAppointment = async (req, res, next) => {
    try {
        const slotUuids = req.body.slot_uuids
        // we are validating joi with inputs 
        const payload = {
            appointment_uuid: req.body.appointment_uuid,
            slot_uuids: slotUuids,
            timing: req.body.timing,
            date: req.body.date,
        };
        const { error } = validation.validate(payload);
        if (error) return res.status(400).json(errorResponse(400, error.details[0].message, {}));
        
        // now we will validate the slot uuid that are they available or not 
        for (let i = 0; i < slotUuids.length; i++) {
            const slotUuid = slotUuids[i];
            const slot = await SlotModel.findOne({slot_uuid: slotUuid, slot_isActive: true, slot_isExpire: false})
            if (!slot){
                console.log(slot);
                return res.status(400).json(errorResponse(400, messages.error.SLOT_NOT_AVAILABLE, {}));
            }
        }
        next();
    } catch (error) {
        return res.status(500).json(errorResponse(400, messages.error.WRONG, {}));
    }
};

module.exports = checkAppointment;
