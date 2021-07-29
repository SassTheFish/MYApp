const { resolveInclude } = require('ejs');
const { response } = require('express');
const mongoose = require('mongoose');

const { TreeningKava, Harjutus } = require('../models/harjutus');
const UjumisKava = require('../models/ujumine');



async function getData()
{
    const harjutusedH = await Harjutus.find()
    const kavadU = await UjumisKava.find()
    const kavadÜ = await TreeningKava.find()
    const data = {
        harjutusedH,
        kavadU,
        kavadÜ
    }
    return data;
}

async function OrderRaskus(input)
{
    let biggest;
    let temp;
    for(let i = 0; i < input.length; i++)
    {
        biggest = i;
        for(let j = i+1;j<input.length;j++){
            if(input[j].raskustase >= input[biggest].raskustase | input[j].pingutustase >= input[biggest].pingutustase){
                biggest = j;
            }
        }
        temp = input[i];
        input[i] = input[biggest];
        input[biggest] = temp;
    }
}

async function SearchByName(sisse, kavad)
{
    const reg = new RegExp(`${sisse}`);
    console.log(reg)
    let found = [];
    for(something of kavad)
    {
        console.log(something.nimi)
        if(something.nimi.match(reg)){
            console.log("pushed ")
            found.push(something);
        }
        else 
        {
            continue;
        }
    }
    kavad = found;

}


module.exports = {getData, OrderRaskus, SearchByName};