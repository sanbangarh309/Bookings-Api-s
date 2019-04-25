/**
* @author Sandeep Bangarh <sanbangarh309@gmail.com>
*/
"use strict"

var config = require('./config');
module.exports = {
  sanImageUpload : function(req, res, id) {
    var fs = require('fs');
    var path = require('path');
    var formidable = require("formidable");
    var appDir = path.dirname(require.main.filename);
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      if (files.img.name !='') {
        var oldpath = files.img.path;
        var newpath = appDir+'/uploads/' + files.img.name;
        fs.rename(oldpath, newpath);
        res.json(files.img.name);
      }else{
        res.json('failed');
      }

    });
  },

  sanAppendScript : function(path){
    // var head = document.getElementsByTagName('head')[0];
    // var script = document.createElement('script');
    // script.type = 'text/javascript';
    // script.onload = function() {
    //   callFunctionFromScript();
    // }
    // script.src = path;
    // head.appendChild(script);
  },

  sanGenerateQRCode : function(req, res,id, callback) {
    var qr = require('qr-image');
    var realpath = 'https://'+req.headers.host+'/files/qrcodes/'+ObjectId(id)+'.png';
    var path = './uploads/qrcodes/'+ObjectId(id)+'.png';
    var qr_svg = qr.image(ObjectId(id)+'san@#ban', { type: 'png' });
    qr_svg.pipe(require('fs').createWriteStream(path));
    callback(realpath);
  },

  sanRemoveDuplicates : function(originalArray, prop){
    var newArray = [];
    var lookupObject  = {};

    for(var i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for(i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  },

  sanGetModelById : function(req,res,next,id){
    Model.where({_id: id}).findAsync().then(function(model) {
      return model;
    }).catch(next).error(console.error);
  },

  san_middleware : function(req, res,next){
    var token = req.session.token;
    if (!token && req.path != '/admin/login' && !req.path.includes("assets")){
      return res.redirect('/admin/login');
    }
    next();
  },

  addslashes : function(str) {
      str = str.replace(/\\/g, '\\\\');
      str = str.replace(/\'/g, '\\\'');
      str = str.replace(/\"/g, '\\"');
      str = str.replace(/\0/g, '\\0');
      return str;
  },
 
  stripslashes: function(str) {
    str = str.replace(/\\'/g, '\'');
    str = str.replace(/\\"/g, '"');
    str = str.replace(/\\0/g, '\0');
    str = str.replace(/\\\\/g, '\\');
    return str;
},

  sanKey : function(req, res, next) {
    res.json("78d88993fd997052c0e58415a838b30e2a459b21");
  }
}
