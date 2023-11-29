const SalonModel = require('../../models/client/salon.model')
const WishlistModel = require("../../models/users/wishlist.model")
const { successResponse, errorResponse } = require("../../utils/response");
const messages = require("../../utils/constant")
const { v4: uuidv4 } = require('uuid');

const createWishList = async (req) => {
    const userUuid = req.uuid
    const receivedSalonUuid = req.body.salon_uuid
    // first we will check that if this salon already present in users wishlist or not if present then we will not create again 
    const wishlist = await WishlistModel.findOne({wishlist_user_uuid: userUuid, wishlist_salon_uuid: receivedSalonUuid})
    if(wishlist) return errorResponse(409, messages.error.ALREADY_IN_WISHLIST, {})

    const newWishlist = new WishlistModel({
        wishlist_uuid: uuidv4(),
        wishlist_salon_uuid: receivedSalonUuid,
        wishlist_user_uuid: userUuid,
    })
    const response = await newWishlist.save()
    return successResponse(201, messages.success.SUCCESS, response)
}

const getWishList = async (req) => {
    // const wishlists = await WishlistModel.find({wishlist_user_uuid: req.uuid}).select("-_id wishlist_uuid wishlist_salon_uuid")
    const wishlists = await WishlistModel.aggregate([
        { $match: { wishlist_user_uuid: req.uuid } },
        {
            $lookup: {
                from: 'salons',
                localField: 'wishlist_salon_uuid',
                foreignField: 'salon_uuid',
                as: 'salon'
            }
        },
        {
            $project: {
                _id: 0,  // Exclude the default _id field
                wishlist_uuid: 1,
                wishlist_salon_uuid: 1,
                salon_name: { $arrayElemAt: ['$salon.salon_name', 0] }
            }
        }
    ])
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
//developed by Nitin Goswami