const mongoose = require("mongoose");

async function connectMongoDB(URL) {
    return mongoose.connect(URL);
};

module.exports = {
    connectMongoDB,
}