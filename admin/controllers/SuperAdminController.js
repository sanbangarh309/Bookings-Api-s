/**
* @author Sandeep Bangarh <sanbangarh309@gmail.com>
*/
"use strict"

var express = require('express');
var connection = require('../../db');
var router = express.Router();
var config = require('../../config');
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: config.directory+'/uploads/blogs/' });
// router.use(upload.array());
var sanUpload = upload.fields([{ name: 'blog_file', maxCount: 1 }]);
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var sanban = require('../../functions');
var gm = require('gm');
var sess;

const _saveThumbnail = (imagePath) => { // edited arg
    return new Promise((resolve, reject) => {
      gm(imagePath).thumb(48, 48, `${imagePath}_thumb`, 100, (err) => { // edited
        if (err) reject(new Error(err));
        resolve();
      });
    });
};

/* Login User */
router.post('/login',upload.array(), function(req, res) {
    sess=req.session;
    let query = 'SELECT * FROM users where email="'+req.body.email+'" limit 1';
    connection.query(query, (err,user) => {
      if(err) return res.status(500).send(err);
      if(!user || user.length <=0) return res.status(404).send({'success':false,'msg':'No user found.'});
      user = JSON.parse(JSON.stringify(user))[0];
      if (user) {
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({'success':false,'msg':'Password Is Not Valid!'});
        var token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
        sess.token = token;
        return res.status(200).send({'success':true,'msg':'User Logged In Successfully'});
      }
    });
    // connection.end();
});
  
  /* Logout*/
router.get('/logout',function(req,res){
    req.session.destroy(function(err) {
      return res.redirect('/admin/login');
    })
});

router.post('/add_blog',function(req,res,next){
    sanUpload(req,res,function(err) {
        if(err) return res.status(500).send(err);
        if(!req.body.title){
            return res.status(401).send({'success':false,'msg':'Title Is Required!'});
        }
        if (req.files.blog_file && req.files.blog_file != undefined) {
            var parts = req.files.blog_file[0].mimetype.split("/"),
            ext = parts[1];
            var file = req.files.blog_file[0].filename;
        }
        let coloms = [];
        let values = [];
        coloms.push('title');
        values.push('"'+req.body.title+'"');
        if(req.body.description){
            coloms.push('description');
            values.push('"'+sanban.addslashes(req.body.description)+'"');
        }
        if(file){
            coloms.push('image');
            values.push('"'+file+'"');
        }
        if(req.body.tags){
            coloms.push('tags');
            values.push('"'+req.body.tags+'"');
        }
        if(req.body.category){
            coloms.push('category');
            values.push('"'+req.body.category+'"');
        }
        if(req.body.meta_des){
            coloms.push('meta_desc');
            values.push('"'+sanban.addslashes(req.body.meta_des)+'"');
        }
        let cols = coloms.join(',').replace(/,\s*$/, "");
        let vals = values.join(',').replace(/,\s*$/, "");
        let query = 'INSERT INTO blogs('+cols+') VALUES('+vals+')';
        connection.query(query, (err,blog) => {
            if(err) return res.status(500).send(err);
            if(file){
                _saveThumbnail(config.directory+'/uploads/blogs/'+file).then(() => {});
            }
            if (blog.affectedRows && blog.affectedRows > 0) {
                return res.status(200).send({'success':true,'msg':'Blog Created Successfully'}); 
            }else{
                return res.status(401).send({'success':false,'msg':'Something went wrong!'}); 
            }
        });
    }); 
});

module.exports = router;