const UserModel = require("../../models/users/user.model")
const messages = require("../../utils/constant")
const { successResponse, errorResponse } = require("../../utils/response");

const user = async (req) => {
    const user = await UserModel.findOne({user_uuid: req.uuid}).select("-_id user_uuid user_full_name user_email user_mobile")
    return successResponse(200, messages.success.SUCCESS, user)
}
module.exports = {user}
//developed by Nitin Goswami