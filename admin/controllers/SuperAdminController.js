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
      gm(imagePath).thumb(70, 70, `${imagePath}_thumb`, 100, (err) => { // edited
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

// Add Blog
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
        if(req.body.meta_desc){
            coloms.push('meta_desc');
            values.push('"'+sanban.addslashes(req.body.meta_desc)+'"');
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
// Update Blog
router.post('/update_blog',function(req,res,next){
    sanUpload(req,res,function(err) {
        if(err) return res.status(500).send(err);
        if(!req.body.title && !req.body.id){
            return res.status(401).send({'success':false,'msg':'Some Required Fields Missing!'});
        }
        if (req.files.blog_file && req.files.blog_file != undefined) {
            if(fs.existsSync(config.directory+'/uploads/blogs/'+req.body.old_image)){
                fs.unlink(config.directory+'/uploads/blogs/'+req.body.old_image, function(err) {
                    if(fs.existsSync(config.directory+'/uploads/blogs/'+req.body.old_image+'_thumb')){
                        fs.unlink(config.directory+'/uploads/blogs/'+req.body.old_image+'_thumb');
                    }
                });
            }
            var parts = req.files.blog_file[0].mimetype.split("/"),
            ext = parts[1];
            var file = req.files.blog_file[0].filename;
        }
        let coloms = [];
        coloms.push('title="'+req.body.title+'"');
        if(req.body.description){
            coloms.push('description="'+sanban.addslashes(req.body.description)+'"');
        }
        if(file){
            coloms.push('image="'+file+'"');
        }
        if(req.body.tags){
            coloms.push('tags="'+req.body.tags+'"');
        }
        if(req.body.category){
            coloms.push('category="'+req.body.category+'"');
        }
        if(req.body.meta_desc){
            coloms.push('meta_desc="'+sanban.addslashes(req.body.meta_desc)+'"');
        }
        let cols = coloms.join(',').replace(/,\s*$/, "");
        let query = 'UPDATE blogs SET '+cols+' where id='+req.body.id;
        connection.query(query, (err,blog) => {
            if(err) return res.status(500).send(err);
            if(file){
                _saveThumbnail(config.directory+'/uploads/blogs/'+file).then(() => {});
            }
            if (blog.affectedRows && blog.affectedRows > 0) {
                return res.status(200).send({'success':true,'msg':'Blog Updated Successfully'}); 
            }else{
                return res.status(401).send({'success':false,'msg':'Something went wrong!'}); 
            }
        });
    }); 
});


/* get Blog Detail */
router.get('/blog/:id',async (req,res) => {
    let blog = '';
    try {
        blog = await connection.query('SELECT * FROM blogs where id='+req.params.id+' LIMIT 1');
    } catch(err) {
        return res.status(500).send(err);
    }
    return res.status(200).send({'success':true,'msg':blog[0]}); 
});

/* delete Blog */
router.delete('/blog/:id',async (req,res) => {
    let blog = '';
    try {
        blog = await connection.query('SELECT * FROM blogs where id='+req.params.id+' LIMIT 1');
        connection.query('DELETE FROM blogs where id='+req.params.id);
    } catch(err) {
        return res.status(500).send({'success':false,'msg':err});
    }
    
    if(blog[0] && fs.existsSync(config.directory+'/uploads/blogs/'+blog[0].image)){
        fs.unlink(config.directory+'/uploads/blogs/'+blog[0].image, function(err) {
            if(fs.existsSync(config.directory+'/uploads/blogs/'+blog[0].image+'_thumb')){
                fs.unlink(config.directory+'/uploads/blogs/'+blog[0].image+'_thumb');
            }
        });
    }
    return res.status(200).send({'success':true,'msg':'Blog deleted Successfully'}); 
});

// Add Pricing Plans
router.post('/add_plan',upload.array(),function(req,res,next){
        if(!req.body.title){
            return res.status(401).send({'success':false,'msg':'Title Is Required!'});
        }
        let coloms = [];
        let values = [];
        coloms.push('title');
        values.push('"'+req.body.title+'"');
        if(req.body.description){
            coloms.push('description');
            values.push('"'+sanban.addslashes(req.body.description)+'"');
        }
        if(req.body.price){
            coloms.push('price');
            values.push('"'+req.body.price+'"');
        }
        if(req.body.plan_for){
            coloms.push('plan_for');
            values.push('"'+req.body.plan_for+'"');
        }
        let cols = coloms.join(',').replace(/,\s*$/, "");
        let vals = values.join(',').replace(/,\s*$/, "");
        let query = 'INSERT INTO plans('+cols+') VALUES('+vals+')';
        connection.query(query, (err,plan) => {
            if(err) return res.status(500).send(err);
            if (plan.affectedRows && plan.affectedRows > 0) {
                return res.status(200).send({'success':true,'msg':'Plan Created Successfully'}); 
            }else{
                return res.status(401).send({'success':false,'msg':'Something went wrong!'}); 
            }
        });
});

// Update Plans
router.post('/update_plan',function(req,res,next){
    sanUpload(req,res,function(err) {
        if(err) return res.status(500).send(err);
        if(!req.body.title && !req.body.id){
            return res.status(401).send({'success':false,'msg':'Some Required Fields Missing!'});
        }
        let coloms = [];
        coloms.push('title="'+req.body.title+'"');
        if(req.body.description){
            coloms.push('description="'+sanban.addslashes(req.body.description)+'"');
        }
        if(req.body.price){
            coloms.push('price="'+req.body.price+'"');
        }
        if(req.body.plan_for){
            coloms.push('plan_for="'+req.body.plan_for+'"');
        }
        let cols = coloms.join(',').replace(/,\s*$/, "");
        let query = 'UPDATE plans SET '+cols+' where id='+req.body.id; console.log(query)
        connection.query(query, (err,plan) => {
            if(err) return res.status(500).send(err);
            if (plan.affectedRows && plan.affectedRows > 0) {
                return res.status(200).send({'success':true,'msg':'Plan Updated Successfully'}); 
            }else{
                return res.status(401).send({'success':false,'msg':'Something went wrong!'}); 
            }
        });
    }); 
});


/* get Plan Detail */
router.get('/plan/:id',async (req,res) => {
    let plan = '';
    try {
        plan = await connection.query('SELECT * FROM plans where id='+req.params.id+' LIMIT 1');
    } catch(err) {
        return res.status(500).send(err);
    }
    return res.status(200).send({'success':true,'msg':plan[0]}); 
});

/* delete Plan */
router.delete('/plan/:id',async (req,res) => {
    try {
        connection.query('DELETE FROM plans where id='+req.params.id);
    } catch(err) {
        return res.status(500).send({'success':false,'msg':err});
    }
    return res.status(200).send({'success':true,'msg':'Plan deleted Successfully'}); 
});

// Add User
router.post('/add_user',upload.array(),function(req,res,next){
    if(!req.body.name && !req.body.role_id && !req.body.email){
        return res.status(401).send({'success':false,'msg':'Fields Is Required!'});
    }
    let coloms = [];
    let values = [];
    var hashedPassword = bcrypt.hashSync(req.body.pwd, 8);
    coloms.push('name');
    values.push('"'+req.body.name+'"');

    coloms.push('password');
    values.push('"'+hashedPassword+'"');
    
    if(req.body.email){
        coloms.push('email');
        values.push('"'+req.body.email+'"');
    }
    if(req.body.phone){
        coloms.push('phone');
        values.push('"'+req.body.phone+'"');
    }
    if(req.body.address){
        coloms.push('address');
        values.push('"'+req.body.address+'"');
    }
    if(req.body.role_id){
        coloms.push('role_id');
        values.push('"'+req.body.role_id+'"');
    }
    let cols = coloms.join(',').replace(/,\s*$/, "");
    let vals = values.join(',').replace(/,\s*$/, "");
    let query = 'INSERT INTO users('+cols+') VALUES('+vals+')';
    connection.query(query, (err,plan) => {
        if(err) return res.status(500).send(err);
        if (plan.affectedRows && plan.affectedRows > 0) {
            return res.status(200).send({'success':true,'msg':'User Created Successfully'}); 
        }else{
            return res.status(401).send({'success':false,'msg':'Something went wrong!'}); 
        }
    });
});

// Update Plans
// router.post('/update_user',function(req,res,next){
// sanUpload(req,res,function(err) {
//     if(err) return res.status(500).send(err);
//     if(!req.body.title && !req.body.id){
//         return res.status(401).send({'success':false,'msg':'Some Required Fields Missing!'});
//     }
//     let coloms = [];
//     coloms.push('title="'+req.body.title+'"');
//     if(req.body.description){
//         coloms.push('description="'+sanban.addslashes(req.body.description)+'"');
//     }
//     if(req.body.price){
//         coloms.push('price="'+req.body.price+'"');
//     }
//     if(req.body.plan_for){
//         coloms.push('plan_for="'+req.body.plan_for+'"');
//     }
//     let cols = coloms.join(',').replace(/,\s*$/, "");
//     let query = 'UPDATE plans SET '+cols+' where id='+req.body.id; console.log(query)
//     connection.query(query, (err,plan) => {
//         if(err) return res.status(500).send(err);
//         if (plan.affectedRows && plan.affectedRows > 0) {
//             return res.status(200).send({'success':true,'msg':'Plan Updated Successfully'}); 
//         }else{
//             return res.status(401).send({'success':false,'msg':'Something went wrong!'}); 
//         }
//     });
// }); 
// });


// /* get Plan Detail */
// router.get('/plan/:id',async (req,res) => {
//     let plan = '';
//     try {
//         plan = await connection.query('SELECT * FROM plans where id='+req.params.id+' LIMIT 1');
//     } catch(err) {
//         return res.status(500).send(err);
//     }
//     return res.status(200).send({'success':true,'msg':plan[0]}); 
// });

// /* delete Plan */
// router.delete('/plan/:id',async (req,res) => {
//     try {
//         connection.query('DELETE FROM plans where id='+req.params.id);
//     } catch(err) {
//         return res.status(500).send({'success':false,'msg':err});
//     }
//     return res.status(200).send({'success':true,'msg':'Plan deleted Successfully'}); 
// });

module.exports = router;