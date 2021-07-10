const joi = require('joi');
const mongoose = require('mongoose')
const {c_alad,c_eraldused,c_lihasgruppid,c_vahendid} = require('../variables');

const ujumise_H_Validation = joi.object({
    kordused:joi.string().empty(''),
    ala:joi.string().valid('Krool', 'Selili', 'Rinnuli', 'Liblikas', 'Kompleks','Põhiviis'),
    eraldus:joi.string().valid('Käed','Jalad','Koostöö'),
    harjutus:joi.string().required(),
    vahendid:joi.array().items(joi.string().valid('laud','suured labidad','väiksed labidad','snorkel','lestad','punn')).single(),
    ajastus:joi.number().default(1)
})



const H_Validation = joi.object({
    raskustase:joi.number().required().valid(1,2,3,4,5),
    nimi:joi.string().required(),
    lihasgrupp:joi.string().lowercase().valid('deltalihas', 'rinnalihas','triitseps','biitseps','kõhulihas','ülaselg','alaselg','tuharalihas','reie eeskülg','reie tagakülg','sääremarjalihas')
})

module.exports = ujumise_H_Validation;