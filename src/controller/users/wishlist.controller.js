const SalonModel = require('../../models/client/salon.model')
const WishlistModel = require("../../models/users/wishlist.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const { v4: uuidv4 } = require('uuid');

const createWishList = async (req) => {
    const userUuid = req.uuid
    const receivedSalonUuid = req.body.salon_uuid
    const receivedServiceName = req.body.service_name
    const wishlist = new WishlistModel({
        wishlist_uuid: uuidv4(),
        wishlist_salon_uuid: receivedSalonUuid,
        wishlist_user_uuid: userUuid,
        wishlist_service_name: receivedServiceName
    })
    const response = await wishlist.save()
    return successResponse(201, messages.success.SUCCESS, response)
}

const getWishList = async (req) => {
    const wishlists = await WishlistModel.find({wishlist_user_uuid: req.uuid})
    return successResponse(200, messages.success.SUCCESS, wishlists)
}

const deleteWishList = async (req) => {
    const receivedWishlistUuid = req.body.wishlist_uuid
    // checking, is wishlist exist or not 
    const wishlist = await WishlistModel.findOne({wishlist_uuid: receivedWishlistUuid})
    if (wishlist) {
        await WishlistModel.findOneAndDelete({wishlist_uuid: receivedWishlistUuid})
        return successResponse(202, messages.success.WISHLIST_DELETED, {})   
    }
    else{
        return errorResponse(404, messages.error.NOT_FOUND, {})
    }
}
module.exports = {createWishList, getWishList, deleteWishList}