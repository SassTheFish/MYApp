const mongoose = require('mongoose')


const tGruppSchema = new mongoose.Schema({
    nimi: {
        type:String,
        required:true
    },
    users:{
        type:[mongoose.Schema.Types.ObjectId]
    },
    spordialad: {
        type:[String]
    }
})


const TreeningGrupp = mongoose.model('TreeningGrupp', tGruppSchema);


module.exports = TreeningGrupp;