const successResponse = (code, message, data)=>{
    return {code: code, message: message, data: data}
}

const errorResponse = (code, message, data)=>{
    return {code: code, message: message, data: data}
}

module.exports = {successResponse, errorResponse};