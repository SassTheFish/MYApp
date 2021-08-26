const mongoose = require('mongoose')
const passportLocalMongo = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    saved:
    {
        type:[mongoose.Schema.Types.ObjectId]
    }
})
userSchema.plugin(passportLocalMongo);


module.exports = mongoose.model('User', userSchema);

