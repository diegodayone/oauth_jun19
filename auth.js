const passport = require("passport")
const User = require("./models/user")

const LocalStrategy = require("passport-local").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;
const FacebookTokenStrategy = require("passport-facebook-token");
const FacebookStrategy = require("passport-facebook").Strategy;

const jwt = require("jsonwebtoken")

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//ClientID: 1740323019435330
//ClientSecret: 8921ea32d226a9186119ed1226b7c10f

//1) local for authenticating with username and password
passport.use(new LocalStrategy(User.authenticate()))

//2) jwt for creating and authenticating with tokens
var options = {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

passport.use(new JwtStrategy(options, (jwt, done) => {
    User.findById(jwt._id, (err, user) => {
        if (err) done(err, false) //something unexpected happened
        else if (user) done(null, user) //user found
        else return done(null, false) //user not found
    })
}))

//3) oauth for logging in with Facebook!
passport.use("facebookToken", new FacebookTokenStrategy({
    clientID: "1740323019435330",
    clientSecret: "8921ea32d226a9186119ed1226b7c10f"
}, async (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    try {
        //if the user exists, return the user
        var existingUser = await User.findOne({ facebookId: profile.id });
        //else create the user, and return the user
        if (existingUser) done(null, existingUser)
        else {
            var userToBeCreated = {
                facebookId: profile.id,
                username: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                picture: profile.photos[0].value
            }
            console.log(userToBeCreated)
            var newUser = await User.create(userToBeCreated)
            // var r = await newUser.save()
            // console.log(r);
            done(null, newUser)
        }
    }
    catch (error) {
        done(error, null)
    }
}))


//4) OAUTH server side
passport.use(new FacebookStrategy({
    clientID: "",
    clientSecret: "",
    callbackURL: "http://localhost:3400/authentication/facebookCallback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        var existingUser = await User.findOne({ facebookId: profile.id });
        //else create the user, and return the user
        if (existingUser) { 
            console.log("mongo user", existingUser)
            done(null, existingUser) 
        }
        else {
            var userToBeCreated = {
                facebookId: profile.id,
                username: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                picture: profile.photos[0].value
            }
            console.log(userToBeCreated)
            var newUser = await User.create(userToBeCreated)
            // var r = await newUser.save()
            // console.log(r);
            done(null, newUser)
        }
    }
    catch (error) {
        console.log(error)
        done(error, null)
    }
}
))

module.exports = {
    createUserToken: userId => jwt.sign(userId, options.secretOrKey, { expiresIn: 3600 * 72 })
}