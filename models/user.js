const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")

var User = new mongoose.Schema({
    //_id
    //username
    //password
    facebookId: String,
    firstName: String,
    lastName: String,
    picture: String
})

User.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", User)