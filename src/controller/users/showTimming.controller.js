const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant");
const moment = require("moment");
const SlotModel = require("../../models/client/slot.model");

const showTimmings = async (req) => {
    const salonUuid = req.params.uuid;
    const serviceDuration = req.query.duration;
    const date = req.query.date || moment().format("DD/MM/YYYY")
    const dbSlots = await SlotModel.find({
        slot_salon_uuid: salonUuid,
        slot_isActive: true,
        slot_isExpire: false,
        slot_date: date,
    }).select("-_id slot_uuid slot_time");
    // Current time is 2:12 PM
    // const currentTime = moment('9:39 PM', 'h:mm A');
    const currentTime = moment();

    // we will chech user want to see todays slots or anthor day's slots 
    // if user want to see todays slots then we will validate the slots time is acheived or not
    if (date == moment().format("DD/MM/YYYY")) {
        // it means user want to see todays slots.
        // Check if the current time reaches the last time in the array then we will show user tomorrow's slots
        if (currentTime.isSameOrAfter(moment(dbSlots[dbSlots.length - 1].slot_time, "h:mm A"))) {
            const slots = await SlotModel.find({
                slot_salon_uuid: salonUuid,
                slot_isActive: true,
                slot_isExpire: false,
                slot_date: moment().add(1, "days").format("DD/MM/YYYY"),
            }).select("-_id slot_uuid slot_time");
            const finalSlotArray = []
            const consecutiveSlotNum = serviceDuration / 30

            // here we are checking that service duration must be greater than 30 min 
            if (consecutiveSlotNum >= 2) {
                for (let i = 0; i < slots.length - 1; i++) {
                    // console.log(finalSlotArray);
                    let flag = true
                    for (let j = 1; (j < consecutiveSlotNum) && flag; j++) {
                        try {
                            const slot = slots[i + j - 1];
                            const slotTime = moment(slot.slot_time, 'h:mm A')
                            const nextSlot = slots[i + j]
                            // console.log(i, j, slots[i + j], slots[i + j + 1]);
                            const nextSlotTime = moment(nextSlot.slot_time, 'h:mm A')
                            const timeDiff = nextSlotTime.diff(slotTime, 'minutes')
                            // console.log(i, j, slotTime.format('h:mm A'), nextSlotTime.format('h:mm A'), timeDiff);
                            // console.log(i, j, timeDiff, timeDiff > 30);
                            if (timeDiff > 30) {
                                // console.log("hello");
                                flag = false
                            }
                            else {
                                if (j == consecutiveSlotNum - 1) {
                                    // console.log("here comes");
                                    finalSlotArray.push(slots[i])
                                }
                                else {
                                    flag = true
                                }
                            }
                        } catch (error) {
                            continue
                        }
                    }

                }
                return successResponse(200, messages.success.SUCCESS, finalSlotArray);
            }
            else {
                return successResponse(200, messages.success.SUCCESS, slots);
            }
        } else {
            // we are showing todays slots and removing the slots those time has achieved
            // also we will validate that user will we one hour ahead slots from current time
            // Filter the slots that are after one hour from current time
            // Calculate the time one hour from now
            const oneHourFromNow = currentTime.clone().add(59, "minutes");
            const slots = dbSlots.filter((slot) => {
                const slotTime = moment(slot.slot_time, "h:mm A");
                return slotTime.isAfter(oneHourFromNow);
            });
            const finalSlotArray = []
            const consecutiveSlotNum = serviceDuration / 30

            // here we are checking that service duration must be greater than 30 min 
            if (consecutiveSlotNum >= 2) {
                for (let i = 0; i < slots.length - 1; i++) {
                    // console.log(finalSlotArray);
                    let flag = true
                    for (let j = 1; (j < consecutiveSlotNum) && flag; j++) {
                        try {
                            const slot = slots[i + j - 1];
                            const slotTime = moment(slot.slot_time, 'h:mm A')
                            const nextSlot = slots[i + j]
                            // console.log(i, j, slots[i + j], slots[i + j + 1]);
                            const nextSlotTime = moment(nextSlot.slot_time, 'h:mm A')
                            const timeDiff = nextSlotTime.diff(slotTime, 'minutes')
                            // console.log(i, j, slotTime.format('h:mm A'), nextSlotTime.format('h:mm A'), timeDiff);
                            // console.log(i, j, timeDiff, timeDiff > 30);
                            if (timeDiff > 30) {
                                // console.log("hello");
                                flag = false
                            }
                            else {
                                if (j == consecutiveSlotNum - 1) {
                                    // console.log("here comes");
                                    finalSlotArray.push(slots[i])
                                }
                                else {
                                    flag = true
                                }
                            }
                        } catch (error) {
                            continue
                        }
                    }

                }
                return successResponse(200, messages.success.SUCCESS, finalSlotArray);
            }
            else {
                return successResponse(200, messages.success.SUCCESS, slots);
            }
        }
    }
    else {
        // it means user want to check slots for days other than today 
        const slots = await SlotModel.find({
            slot_salon_uuid: salonUuid,
            slot_isActive: true,
            slot_isExpire: false,
            slot_date: date,
        }).select("-_id slot_uuid slot_time");
        const finalSlotArray = []
        const consecutiveSlotNum = serviceDuration / 30

        // here we are checking that service duration must be greater than 30 min 
        if (consecutiveSlotNum >= 2) {
            for (let i = 0; i < slots.length - 1; i++) {
                // console.log(finalSlotArray);
                let flag = true
                for (let j = 1; (j < consecutiveSlotNum) && flag; j++) {
                    try {
                        const slot = slots[i + j - 1];
                        const slotTime = moment(slot.slot_time, 'h:mm A')
                        const nextSlot = slots[i + j]
                        // console.log(i, j, slots[i + j], slots[i + j + 1]);
                        const nextSlotTime = moment(nextSlot.slot_time, 'h:mm A')
                        const timeDiff = nextSlotTime.diff(slotTime, 'minutes')
                        // console.log(i, j, slotTime.format('h:mm A'), nextSlotTime.format('h:mm A'), timeDiff);
                        // console.log(i, j, timeDiff, timeDiff > 30);
                        if (timeDiff > 30) {
                            // console.log("hello");
                            flag = false
                        }
                        else {
                            if (j == consecutiveSlotNum - 1) {
                                // console.log("here comes");
                                finalSlotArray.push(slots[i])
                            }
                            else {
                                flag = true
                            }
                        }
                    } catch (error) {
                        continue
                    }
                }

            }
            return successResponse(200, messages.success.SUCCESS, finalSlotArray);
        }
        else {
            return successResponse(200, messages.success.SUCCESS, slots);
        }

    }
};
module.exports = showTimmings;
