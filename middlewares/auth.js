const User = require("../models/user");
const { validateToken } = require("../service/auth");
const { getObjectURL } = require("../service/s3");

function checkForAuthenticationCookie(cookieName){
    return async(req, res, next)=>{
    const token = req.cookies[cookieName];
    if(!token){
        return next();
    }
    try{
    const user = validateToken(token);
    req.userName = await User.findById(user._id);
    req.userName.profileImage = await getObjectURL(req.userName.profileImage);
    req.user = user;
    } catch(error){};
    return next();
}
}
module.exports = {
    checkForAuthenticationCookie,
}