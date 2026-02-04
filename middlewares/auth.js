const User = require("../models/user");
const { validateToken } = require("../service/auth");

function checkForAuthenticationCookie(cookieName){
    return async(req, res, next)=>{
    const token = req.cookies[cookieName];
    if(!token){
        return next();
    }
    try{
    const user = await validateToken(token);
    //console.log(user);
    req.user = await User.findById(user._id);
    //req.userName.profileImage = await getObjectURL(req.userName.profileImage);
    //req.user = user;
    } catch(error){
        console.error("Authentication error: ", error);
    };
    return next();
}
}
module.exports = {
    checkForAuthenticationCookie,
}