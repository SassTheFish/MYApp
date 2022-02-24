const mongoose = require('mongoose')

const treening = {
    kuupäev:{
        type:Date,
        default:new Date(),
        required:true
    },
    kavad:[mongoose.Schema.Types.ObjectId]
}
const tGruppSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    users:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"User"
    },
    treener:{
        type:String,
        ref:"User"
    },
    spordialad:[String],
    treeningud:[treening],
    status:{
        type:String,
        enum:['public','private'],
        default:'private'
    }
})


const TreeningGrupp = mongoose.model('TreeningGrupp', tGruppSchema);

module.exports = TreeningGrupp;