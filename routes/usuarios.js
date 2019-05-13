var express = require('express');
var controller = require('../controllers/UsuarioController')
const AWS = require('aws-sdk');
const fs = require('fs');
var path = require('path');
var moment = require('moment');
var router = express.Router();

router.get('/', function(req, res, next) {
    controller.show(req, res);
});

router.get('/crear', function(req, res, next) {
    controller.add(req, res);
});

router.post('/cargar', function(req, res, next) {
    controller.create(req, res)
});

router.post('/buscar', function(req, res, next) {
    controller.search(req, res)
});

router.get('/update/:id', function(req, res, next) {
    controller.list(req, res);
});

router.post('/update', function(req, res, next) {
    controller.update(req, res)
});

router.post('/delete', function(req, res, next) {
    controller.delete(req, res)
});

module.exports = router;