const express = require("express")

const router = express.Router()
const User = require("../models/user")
const authentication = require("../auth")
const passport = require("passport")


router.get("/", async (req, res)=>{
    res.json(await User.find({}))
})

//1) register user with username and password
router.post("/register", async(req, res)=>{
    try{
        var user = await User.register(req.body, req.body.password)
        const token = authentication.createUserToken(user._id);
        res.json({
            user: user,
            token: token,
            message: "User registration OK"
        })
    }
    catch(exx){
        console.log(exx)
        res.status(500).send(exx)
    }
})

//2) login with username and password and receive a token
router.post("/login", passport.authenticate("local"), async (req, res) =>{
    const token = authentication.createUserToken({ _id: req.user._id });
        res.json({
            user: req.user,
            token: token,
            message: "User login OK"
        })
})

//3) refresh token method
router.post("/refresh", passport.authenticate("jwt"), async (req, res) =>{
    const token = authentication.createUserToken({ _id: req.user._id });
    res.json({
        user: req.user,
        token: token,
        message: "User refresh OK"
    })
})

router.post("/facebookLogin",passport.authenticate("facebookToken", { session: false}), async (req, res)=>{
    const token = authentication.createUserToken({ _id: req.user._id });
    res.json({
        user: req.user,
        token: token,
        message: "User access with Facebook OK"
    })
});

router.get("/facebook", passport.authenticate("facebook", { scope: ['email'] , session: false}));
//facebook.com/auth?clientid=123123123&scope=....&callbackUrl=http://localhost:3400...

router.get("/facebookCallback", passport.authenticate("facebook"), async(req, res)=> {
    //res.json({ user: req.user, token : authentication.createUserToken({ _id: req.user._id }) })

    res.redirect("http://localhost:3000/?access_token=" + authentication.createUserToken({ _id: req.user._id }));
})

module.exports = router