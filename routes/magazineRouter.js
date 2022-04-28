const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const client = require("../models/redis.js");

const Magazines = require('../models/magazines');

const magazineRouter = express.Router();

magazineRouter.use(bodyParser.json());

var cors = require('cors');

magazineRouter.route('/')
.options(cors(), (req,res) => {res.sendStatus(200); })
.get(async (req,res,next) => {
    const redisdata = await client.get('magazines');
    if (redisdata== null){
        
        const mag = await Magazines.find({})
        await client.set('magazines',JSON.stringify(mag));
        res.header('Content-Type', 'application/json');  
        res.json(mag);  
        console.log("Magazines data read from mongodb");
    } 
    else{
        console.log("Magazines data read from redis cache");
        res.json(JSON.parse(redisdata))
    }
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /magazines');
})
.post((req, res, next) => {
    Magazines.create(req.body)
    .then((magazine) => {
        //console.log('Magazine Created ', magazine);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(magazine);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {
    Magazines.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});


magazineRouter.route('/:magId')
.options(cors(), (req,res) => {res.sendStatus(200); })
.get((req,res,next) => {
    Magazines.findById(req.params.magId)
    .then((magazine) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(magazine);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /magazines/'+ req.params.magId);
})
.put((req, res, next) => {
    Magazines.findByIdAndUpdate(req.params.magId, {
        $set: req.body
    }, { new: true })
    .then((magazine) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(magazine);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {
    Magazines.findByIdAndRemove(req.params.magId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = magazineRouter;