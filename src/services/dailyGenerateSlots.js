const SalonModel = require("../models/client/salon.model");
const SlotModel = require("../models/client/slot.model");
const moment = require("moment");
const messages = require("../utils/constant");
const { v4: uuidv4 } = require("uuid");

const onBoardGenerateSlot = async (allSalonUuid) => {
    const today = moment;
    for (const uuid of allSalonUuid) {
        const salon = await SalonModel.findOne({ salon_uuid: uuid });
        const openingTime = moment(salon.salon_opening_time, 'h:mm A');
        const closingTime = moment(salon.salon_closing_time, 'h:mm A');
        const lunchStart = moment(salon.salon_lunch_time, 'h:mm A');
        const lunchEnd = lunchStart.clone().add(29, 'minutes'); // Lunch break is fixed at 30 minutes
        const slotDuration = 15; // Time slots duration in minutes

        // const timeSlots = [];
        const currentTime = openingTime.clone();

        while (currentTime.isBefore(closingTime)) {
            if (currentTime.isBefore(lunchStart) || currentTime.isAfter(lunchEnd)) {
                // timeSlots.push(currentTime.format('h:mm A'));
                const slot = await SlotModel.insertMany([{
                    slot_uuid: uuidv4(),
                    slot_salon_uuid: uuid,
                    slot_date: today().add(6, "days").format("DD/MM/YYYY"),
                    slot_time: currentTime.format('h:mm A'),
                    slot_count: salon.salon_slots
                }])
            }

            currentTime.add(slotDuration, 'minutes');
        }
    }
    return messages.success.SLOTS_CREATED_DAILY;
};

module.exports = onBoardGenerateSlot;
