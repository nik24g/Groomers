const AdminModel = require("../../models/admin/admin.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const messages = require("../../utils/constant")
const { successResponse, errorResponse } = require("../../utils/response");

const adminLogin = async (req) => {
    let enteredUsername = req.body.username
    let enteredPassword = req.body.password
    let admin = await AdminModel.findOne({ admin_username: enteredUsername })
    let token;
    if(!admin) return errorResponse(404, messages.error.ADMIN_NOT_FOUND, {}) 
    else { 
        // now check password is correct or wrong
        const match = await bcrypt.compare(enteredPassword, admin.admin_password);
        if(match){
            let payload = {username: admin.admin_username, email: admin.admin_email }
            token = jwt.sign(payload, process.env.ADMIN_ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
            return successResponse(200, messages.success.ADMIN_LOGIN, {token: token})
        }
        else{
            return errorResponse(401, messages.error.WRONG_PASSWORD, {})
        }
    }
}
module.exports = adminLogin