const ClientModel = require("../../models/client/salon.model");
const jwt = require("jsonwebtoken")
const messages = require("../../utils/constant")
const { successResponse, errorResponse } = require("../../utils/response");

const login = async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    // checking username is exist or not 
    const user = await ClientModel.findOne({salon_username: username})
    if (!user) {return errorResponse(404, messages.error.NO_USER, {})}
    // checking password matching or not
    if (user.salon_password == password) {
        let payload = {username: user.salon_username, uuid: user.salon_uuid, salonName: user.salon_name }
        token = jwt.sign(payload, process.env.CLIENT_ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
        return successResponse(200, messages.success.LOGGED_IN, {token: token})
    }
    else{
        return errorResponse(401, messages.error.WRONG_PASSWORD, {})
    }
}

module.exports = login;