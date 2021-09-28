const mongoose = require('mongoose');
const { c_lihasgruppid } = require('../variables');

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
    lihasgruppid:[{
        type:String,
        lowercase:true,
        enum:c_lihasgruppid
    }],
    kirjeldus:{
        type:String,
        default:"Kirjeldus puudub"
    }
})


const harjutusSchema = {
    harj: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Harjutus',
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
    }
}


const treeningkavaSchema = new mongoose.Schema({
    nimi:{type:String, required:false, default:"Treening Kava"},
    kuupäev:{type:Date},
    harjutused:[harjutusSchema],
    raskustase:{type:Number,default:10,min:10, max:100},
    ringid:{
        type:Number
    }
})
treeningkavaSchema.query.byName = function(name) {
    return this.where({ nimi: new RegExp(name, 'i') })
};

// const treeningkavaSchema = new mongoose.Schema({
//     nimi:{type:String, required:false, default:"Treening Kava"},
//     kuupäev:{type:Date},
//     harjutused:[{type: mongoose.Schema.Types.ObjectId, ref:'Harjutus'}],
//     raskustase:{type:Number,default:10,min:10, max:100}
// })


const Harjutus = mongoose.model("Harjutus", harjutuseSchema);
const Üke = mongoose.model("Treeningkava", treeningkavaSchema);





const object = {Harjutus, Üke};

module.exports = object;

