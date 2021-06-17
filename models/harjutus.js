const mongoose = require('mongoose');

const harjutuseSchema = new mongoose.Schema({
    
    raskustase:{
        type:Number,
        required:true,
        enum:[1,2,3,4,5]
    },
    nimi: {
        type:String,
        required:true
    },
    lihasgrupp:
    {
        type:String,
        lowercase:true,
        enum:['jalad', 'kere', 'käed']
    }
})


const harjutusSchema = {
    nimi: {
        type:String,
        required:true
    },
    kordused_x: {
        type:Number,
        default:1,
        min: 1
    },
    kordused_y: {
        type:Number,
        default:10,
        min: 1
    },
}


const treeningkavaSchema = new mongoose.Schema({
    nimi:{type:String, required:false, default:"Treening Kava"},
    kuupäev:{type:Date},
    harjutused:[harjutusSchema],
    raskustase:{type:Number,default:3,min:1, max:5}
})


const Harjutus = mongoose.model("Harjutus", harjutuseSchema);
const TreeningKava = mongoose.model("Treeningkava", treeningkavaSchema);

const object = {Harjutus, TreeningKava};

module.exports = object;

