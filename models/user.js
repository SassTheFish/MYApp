const mongoose = require('mongoose')
const passportLocalMongo = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    saved:
    {
        type:[mongoose.Schema.Types.ObjectId]
    },
    username:{
        type:String
    },
    type:
    {
        type:String,
        enum:["sportlane", "treener", "admin", "külaline"] 
    },
    email: {
        type:String,
        default:"Lisamata"
    },
    trennigrupp:{
        type:String,
        default: "Pole treening gruppis"
    }
})
userSchema.plugin(passportLocalMongo);


module.exports = mongoose.model('User', userSchema);

