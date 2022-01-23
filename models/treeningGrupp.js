const mongoose = require('mongoose')

const treening = {
    kuupäev:{
        type:Date,
        default:new Date(),
        required:true
    },
    kavad:{
        type:[mongoose.Schema.Types.ObjectId]
    }
}
const tGruppSchema = new mongoose.Schema({
    nimi: {
        type:String,
        required:true
    },
    users:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"User"
    },
    spordialad: {
        type:[String]
    },
    treeningud:[treening]
})


const TreeningGrupp = mongoose.model('TreeningGrupp', tGruppSchema);

module.exports = TreeningGrupp;