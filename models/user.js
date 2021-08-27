const mongoose = require('mongoose')
const passportLocalMongo = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    saved:
    {
        type:[mongoose.Schema.Types.ObjectId]
    },
    type:
    {
        type:Number,
        default:1,
        enum:[1,2,1453]       //1 = tavaline, 2 = treener, 1453 = admin 
    }
})
userSchema.plugin(passportLocalMongo);


module.exports = mongoose.model('User', userSchema);

