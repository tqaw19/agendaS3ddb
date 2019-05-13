let usuario = require('../models/UsuarioModel');
const AWS = require('aws-sdk');
const fs = require('fs');
const uuidv1 = require('uuid/v1');
var path = require('path');
var moment = require('moment');

var table_name = "usuarios";

AWS.config.update({
    accessKeyId: "AKIAY4WPTQ2HWPLSE5HF",
    secretAccessKey: "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",
    region: "us-east-2"
    
});

var s3 = new AWS.S3();
var ddb = new AWS.DynamoDB.DocumentClient();


module.exports = {

    /* MOSTRAR TODOS LOS USUARIOS */
    show: function(req, res) {
        const params = {
            TableName: table_name
        }        

        ddb.scan(params, function (err, data) { 
            if(err){
                console.log("Error", err);
            }else{
                res.render('index', {items: data.Items, moment: moment})
                console.log("datos", data);
            }
         })
    },

    /* OBTENER UN USUARIO */
    list: function(req, res) {
        let val_id = req.params.id;

        const params = {
            TableName : table_name,
            KeyConditionExpression : 'usuario_id = :id',
            ExpressionAttributeValues : {
                ':id' : val_id
            }
        }

        ddb.query(params, function (err, data) { 
            if(err){
                console.log("Error", err);
            }else{
                res.render('actualizar', {usuario: data.Items[0], moment : moment});
                console.log("Datos", data.Items[0]);
            }
         })

    },

    /* REDIRIGIR CREAR  */
    add: function(req, res) {
        res.render('crear', { title: 'Express' });
        
    },

    /* CREAR USUARIO */
    create: function(req, res) {
        let fotoname = Date.now() + "_" + path.basename(req.files.archivo.name);
        var params = {
            Bucket: 'agenda-bucket',
            acl: 'public-read',
            Body: fs.createReadStream(req.files.archivo.path),
            Key: fotoname
        };

        s3.upload(params, function(err, data) {
            
            let params = {
                TableName: table_name,
                Item: {
                    usuario_id : uuidv1(),
                    nombres : req.fields.nombres,
                    apellidos : req.fields.apellidos,
                    email : req.fields.email,
                    nacimiento : req.fields.nacimiento,
                    foto : fotoname
                }
            }

            if (err) {
                console.log("Error", err);
            }
            if(data){
                ddb.put(params, function (err,data) { 

                    if(err){
                        console.log("Error",err);
                    }else{
                        console.log("success",data);
                        res.redirect('./')
                    }
                 })
            }

        });
    },

    search: function (req, res) { 

        console.log("BUSQUEDA", req.fields.apellido.length);

        if(req.fields.apellido.length == 0){
            res.render('error', {busqueda: "No ingreso datos"})
            
        }else{
            var params = { 
                TableName : table_name, 
                FilterExpression : 'apellidos = :ap',
                ExpressionAttributeValues: {
                    ':ap' : req.fields.apellido
                }
            }
        }

        ddb.scan(params, function (err, data) { 
            if (err){
                console.log("ERROR", err);
            }else{

                console.log("LA DATA", data.Items);

                if(data.Items.length > 0){
                    // console.log("DATOS a", data.Items[0].apellido);
                    res.render('buscar', {items: data.Items, moment: moment, usuario: data.Items[0]})
                }else{
                    console.log("En el si", req.fields);
                    res.render('error', {busqueda: req.fields.apellido})
                }

                
            }
         })

     },

    /* ACTUALIZAR USUARIO */
    update: function(req, res) {

        const params = {
            TableName: table_name,
            KeyConditionExpression : 'usuario_id = :id',
            ExpressionAttributeValues : {
                ':id' : req.fields.usuario_id
            }
        }

        var user;

        //OBTENER USUARIO A ACTUALIZAR
        ddb.query(params, function (err, data) { 
            if(err){
                console.log("Error", err);
            }else{
                //GUARDAR DATOS DE USUARIOS
                user = data.Items[0]
                
                /** SI HAY IMAGEN SE BORRA Y ACTUALIZA LOS DATOS */
                if(req.files.archivo.size > 3){

                    //CONFIGURAR ELIMINAR IMAGEN S3
                    var params3 = {
                        Bucket: 'agenda-bucket',
                        acl: 'public-read',
                        Key: user.foto
                    }

                    //PRIMERO ELIMINAR OBJETO S3 DEL USUARIO SELECCIONADO
                    s3.deleteObject(params3, function (err, data) { 
                        if (err){
                            console.log("S3 ERROR", err);
                        }else{

                            /** CONFIGURAR INSTERTAR IMAGEN S3 */
                            let fotoname = Date.now() + "_" + path.basename(req.files.archivo.name);
                            var params = {
                                Bucket: 'agenda-bucket',
                                Body: fs.createReadStream(req.files.archivo.path),
                                Key: fotoname
                            };

                            // LUEGO SUBIR OBJETO S3 NUEVAMENTE
                            s3.upload(params, function (err, data) { 

                                if(err){
                                    console.log("ERROR SUBIR IMAGEN", err);
                                }else{

                                    /** CONFIGURAR PARAMETROS ACTUALIZAR */
                                    let params = {
                                        TableName : table_name,
                                        Key : {
                                            usuario_id : user.usuario_id
                                        },
                                        UpdateExpression: "set nombres= :n, apellidos= :a, email= :e, nacimiento= :na, foto = :f",
                                        ConditionExpression : 'usuario_id = :id',
                                        ExpressionAttributeValues : {
                                            ':id' : user.usuario_id,
                                            ':n' : req.fields.nombres,
                                            ':a' : req.fields.apellidos,
                                            ':e' : req.fields.email,
                                            ':na' : req.fields.nacimiento,
                                            ':f' : fotoname
                                        },
                                        ReturnValues:"UPDATED_NEW"
                                    }

                                    //ACTUALIZAMOS EL USUARIO EN DYNAMODB
                                    ddb.update(params, function (err, data) { 
                                        if(err){
                                            console.log("Error update", err);
                                        }else{
                                            console.log("Data update", data); 
                                            res.redirect('./')           
                                            
                                        }
                                    })
                                }
                                    
                            })
                        }
                    })
                
                /** SI NO HAY IMAGEN SOLO SE ACTUALIZA LOS DATOS */
                }else{

                    /** CONFIGURAR PARAMETROS ACTUALIZAR */
                    let params = {
                        TableName : table_name,
                        Key : {
                            usuario_id : user.usuario_id
                        },
                        UpdateExpression: "set nombres= :n, apellidos= :a, email= :e, nacimiento= :na",
                        ConditionExpression : 'usuario_id = :id',
                        ExpressionAttributeValues : {
                            ':id' : user.usuario_id,
                            ':n' : req.fields.nombres,
                            ':a' : req.fields.apellidos,
                            ':e' : req.fields.email,
                            ':na' : req.fields.nacimiento,
                        },
                        ReturnValues:"UPDATED_NEW"
                    }

                    //ACTUALIZAMOS EL USUARIO EN DYNAMODB
                    ddb.update(params, function (err, data) { 
                        if(err){
                            console.log("Error update", err);
                        }else{
                            console.log("Data update", data); 
                            res.redirect('./')           
                            
                        }
                    })

                }
                
                
            }
        })
    },

    /* ELIMINAR USUARIO */
    delete: function(req, res) {

        const params = {
            TableName : table_name,
            KeyConditionExpression : 'usuario_id = :id',
            ExpressionAttributeValues : {
                ':id' : req.fields.usuario_id
            }
        }

        const paramsdb = {
            TableName : table_name,
            Key: {
                usuario_id: req.fields.usuario_id
            },
            ConditionExpression: 'usuario_id = :id',
            ExpressionAttributeValues : {
                ':id' : req.fields.usuario_id
            }
        }

        let user;

        //PRIMERO OBTIENE LOS DATOS DEL OBJETO A ELIMINAR
        ddb.query(params, function (err, data) { 
            if(err){
                console.log("QUERYError", err);
            }else{
                //SE GUARDA LOS DATOS
                user = data.Items[0]
                console.log("QUERYDatos", data.Items[0]);

                //LUEGO SE ELIMINA MEDIANTE EL ID
                ddb.delete(paramsdb, function (err, data) { 
                    if (err){
                        console.log("DELETEerror", err);
                    }else{
                        console.log("DELETEdatos", data);
                        const params3 = {
                            Bucket: "agenda-bucket",
                            Key: user.foto
                        };

                        //Y POR ULTIMO SE ELIMINA EL OBJETO EN EL S3
                        s3.deleteObject(params3, function (err, data) { 
                            if (err) {
                                console.log("S3error", err);
                            }else{
                                console.log("S3", data);
                                res.redirect('./')
                            }
                         })
                         /* DELETE S3 OBJECT */
                    }
                 })
                 /* DELETE DB OBJECT */
            }
        }) 
    },
}
