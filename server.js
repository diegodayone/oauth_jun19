const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv");
dotenv.config();
const passport = require("passport")
const authRouter = require("./routers/auth")
const path = require("path")
const cors = require("cors")


const connection = mongoose.connect(process.env.MONGOURL, { useNewUrlParser : true})
connection.then(db => {
    console.log("Mongo ok")
},
err => {
    console.log("error ", err)
})

var app = express();
app.use(cors())
app.use(express.json())
app.set("port", process.env.PORT || 3400) //for cloud port decision
app.use(passport.initialize())
app.use(express.static(path.join(__dirname, "public")))

app.use("/authentication", authRouter)

app.listen(app.get("port"), () => {
    console.log("server is running on " + app.get("port"))
})