const joi = require('joi');
const mongoose = require('mongoose')
const {c_alad,c_eraldused,c_lihasgruppid,c_vahendid} = require('../variables');

const ujumise_H_Validation = joi.object({
    kordused:joi.string().empty(''),
    ala:joi.string().valid(...c_alad),
    eraldus:joi.string().valid(...c_eraldused),
    harjutus:joi.string().required(),
    vahendid:joi.array().items(joi.string().valid(...c_vahendid)).single(),
    ajastus:joi.number().default(1)
})

const H_Validation = joi.object({
    raskustase:joi.number().required().valid(1,2,3,4,5),
    nimi:joi.string().required(),
    lihasgrupp:joi.string().lowercase().valid(...c_lihasgruppid)
})


module.exports = ujumise_H_Validation;