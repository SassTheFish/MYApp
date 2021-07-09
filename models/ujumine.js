const mongoose = require('mongoose')



const ujumiseharjutus = {
    kordused:{
        type:String, 
    },
    ala:{
        type:String,
        enum:['Krool', 'Selili', 'Rinnuli', 'Liblikas', 'Kompleks']
    },
    eraldus:[{
        type:String,
        enum:['Käed','Jalad','Koostöö']
    }],
    harjutus:{
        type:String,
        required:true
    },
    vahendid:[{
        type:String,
        enum:['laud','suured labidad','väiksed labidad','snorkel','lestad','punn']
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
    harjutused:[ujumiseharjutus]

})


const UjumisKava = mongoose.model('UjumisKava', ujumiseSchema);

module.exports = UjumisKava;


