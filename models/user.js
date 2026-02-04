const { Schema, model } = require("mongoose");
const { randomBytes, createHmac } = require("crypto");
const { createTokenForUser } = require("../service/auth");
const { getObjectURL } = require("../service/s3");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: `https://res.cloudinary.com/dklglkgdo/image/upload/v1770228603/profileImage_c7qpgt.png`,
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],   // enum basically ensures that only amongts the mentioned values should be given otherwise the mongoose will throw an error;
        default: "USER",
    },
},
{timestamps: true},
);

userSchema.pre("save", function (next){   // We are not using the arrow function here as it does not have it's this keyword and here we need to work with the this keyword
    const user = this;
    if(!user.isModified("password")) return;  // We are checking here that if password is not modified or left like that only then no hashing will be created for it and like there is no password so we shall also not give any salt or hashcode so no hashcode will be generated for it.
    // Now,
    // We will have to first crypt the password 
    // There is a built in package crypto through which we can crypt our password.

    const salt = randomBytes(16).toString("hex");
    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex") // Hash cannot be reversed. that's a better feature of the hashing . 
    this.salt = salt;  // Now when the user wanted to sign in we will take this salt and hash the password again, given by the user using same algorithm and then if we get the same hash (if the hashes of the password matches) then we will allow the user to sign in (because that means the user entered the correct password).
    this.password = hashedPassword;
    next();
});

userSchema.static("matchPasswordAndGenerateToken", async function (email, password){
    const user = await this.findOne({email});
    if(!user) throw new Error("User not found");
    const salt = user.salt;
    const hashedPassword = user.password;
    
    const userProvidedHash = createHmac("sha256", salt)
        .update(password)
        .digest("hex")
    if(userProvidedHash !== hashedPassword) throw new Error("Wrong Password");
    return createTokenForUser(user);
});


const User = model("user", userSchema);

module.exports = User; 