const mongoose = require('mongoose')
const {c_alad, c_eraldused, c_vahendid} = require('../variables');


const ujumiseharjutus = {
    kordused:{
        type:String, 
    },
    ala:{
        type:String,
        enum:c_alad
    },
    eraldus:[{
        type:String,
        enum:c_eraldused
    }],
    harjutus:{
        type:String,
        required:true
    },
    vahendid:[{
        type:String,
        enum:c_vahendid
    }],
    ajastus:{
        type:Number
    }
}

const ujumiseSchema = new mongoose.Schema({

    pingutustase:{
        type:Number,
        required:true,
        enum:[10,20,30,40,50,60,70,80,90,100]
    },
    nimi:{
        type:String,
        required:true
    },
    harjutused:[ujumiseharjutus],
    kuupäev:{
        type:Date
    }
})
ujumiseSchema.query.byName = function(name) {
    return this.where({ nimi: new RegExp(name, 'i') })
};


const UjumisKava = mongoose.model('UjumisKava', ujumiseSchema);

module.exports = UjumisKava;


