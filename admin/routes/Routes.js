'use strict';
module.exports = function(app) {
	var config = require('../../config');
	var sanban = require('../../functions');
	var connection = require('../../db');
	var VerifyToken = sanban.san_middleware//require('../../auth/VerifyToken');
	// var Model = require('../../controllers/Model');
	// var User = require('../../controllers/User');
	// var Event = require('../../controllers/Event');
	// var Venue = require('../../controllers/Venue');
	// var Category = require('../../controllers/Category');
	var moment = require('moment');

	app.get('/', function(req,res){
		// return res.redirect('/admin/home');
		res.render(config.directory + '/views/pages/home', {
			page: 'Home'
		});
	});

	app.get('/blogs', async (req,res) => {
		try {
			var blogs = await connection.query('SELECT * FROM blogs');
		} catch(err) {
			throw new Error(err)
		}
		res.render(config.directory + '/views/pages/blogs', {
			page: 'Blogs',
			blogs:blogs
		});
	});

	app.get('/admin',VerifyToken, function(req,res){
		// return res.redirect('/admin/home');
		res.render(config.directory + '/views/admin/home', {
			page: 'Home'
		});
	});

	app.get('/superadmin',VerifyToken, function(req,res){
		// return res.redirect('/admin/home');
		res.render(config.directory + '/views/superadmin/home', {
			page: 'Dashboard',
			child_page:''
		});
	});
	// VerifyToken
	app.get('/superadmin/blogs', async (req,res) => {
		// return res.redirect('/admin/home');
		try {
			var blogs = await connection.query('SELECT * FROM blogs');
		} catch(err) {
			throw new Error(err)
		}
		res.render(config.directory + '/views/superadmin/blogs', {
			page: 'Blogs',
			child_page:'blogs_list',
			blogs:blogs
		});
	});

	app.get('/superadmin/pricing', async (req,res) => {
		try {
			var plans = await connection.query('SELECT * FROM plans');
		} catch(err) {
			throw new Error(err)
		}
		res.render(config.directory + '/views/superadmin/pricing', {
			page: 'Pricing',
			child_page:'plan_list',
			plans:plans
		});
	});

	app.get('/superadmin/add_plan', function(req,res){
		res.render(config.directory + '/views/superadmin/add_plan', {
			page: 'Pricing',
			child_page:'add_plan'
		});
	});

	app.get('/superadmin/add_blog', function(req,res){
		res.render(config.directory + '/views/superadmin/add_blog', {
			page: 'Blogs',
			child_page:'add_blog'
		});
	});

	app.get('/superadmin/users', async (req,res) => {
		try {
			var users = await connection.query('SELECT * FROM users where role_id !=1');
		} catch(err) {
			throw new Error(err)
		}
		res.render(config.directory + '/views/superadmin/users', {
			page: 'Team',
			child_page:'user_list',
			users:users
		});
	});

	app.get('/superadmin/add_user', function(req,res){
		res.render(config.directory + '/views/superadmin/add_user', {
			page: 'Team',
			child_page:'add_user'
		});
	});

	/* Get File Path */
	app.get('/files/:type/:img_name', function(req,res){
		var filename = req.params.img_name;
		var type = req.params.type;
		var ext  = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
		if (!ext) {
			ext = 'jpg';
		}
		if (ext == 'svg') {
			ext = 'svg+xml';
		}
		var fs = require('fs');
		var imageDir = config.directory+'/uploads/'+type+'/';
		fs.readFile(imageDir + filename, function (err, content) {
			if (err) {
				res.writeHead(400, {'Content-type':'text/html'})
				res.end("No such image");
			} else {
				//specify the content type in the response will be an image
				res.writeHead(200,{'Content-type':'image/'+ext});
				res.end(content);
			}
		});
	});

	// app.get('/chats', function(req, res){
	//   res.render(config.directory + '/views/partials/chat', {
	//       // users: users,
	//       page: 'chat'
	//     });
	// });

	app.get('/upload', function(req,res){
		res.sendFile(config.directory + '/upload.html');
	});
	app.get('/chats', function(req,res){
		var Chat = require('../../admin/controllers/Chat');
		Chat.find({}, function (err, messages) {
			console.log(messages);
			res.render(config.directory + '/views/chat', {
				script: sanban,
				messages: [],
				page: 'notifications'
			});
		});
	});

	app.get('/post', function(req,res){
		res.sendFile(config.directory + '/post.html');
	});

	app.get('/reserve', function(req,res){
		res.sendFile(config.directory + '/reserve.html');
	});

	app.get('/event', function(req,res){
		res.sendFile(config.directory + '/event.html');
	});

	app.get('/venue', function(req,res){
		res.sendFile(config.directory + '/venue.html');
	});

	app.get('/admin/multi', function(req,res){
		res.sendFile(config.directory + '/multi.html');
	});

	app.get('/admin/login', function(req,res){
		if(req.session.token){
			return res.redirect('/admin');
		}
		res.render(config.directory + '/views/login', {
		});
	});

	app.get('/admin/home',VerifyToken, function(req,res){
		sanban.sanAllBusinessUsers(req, res, function(users) {
			var offers = [];
			var events = [];
			//res.json(users.venues);
			Object.keys(users.events).forEach(function(key) {
				if (users.events[key].type == 'event') {
					events.push(users.events[key]);
				}else if(users.events[key].type == 'offer'){
					offers.push(users.events[key]);
				}
			});
			res.render(config.directory + '/views/index', {
				users: users.user,
				venues: users.venues,
				user_count: users.user.length,
				models: users.models,
				model_count: users.models.length,
				events: events,
				event_count: events.length,
				offers: offers,
				offer_count: offers.length,
				page: 'home'
			});
		});
	});

	app.get('/admin/business', function(req,res){
		var perPage = 4;
		var page = req.query.page || 1;
		var added = req.query.add || '';
		var update = req.query.update || '';
		User.find({status:1})
		.sort( { approved_date: -1 } )
		.exec(function(err, users) {
			var san_cities = [];
			Object.keys(users).forEach(async(key)=> {
				if (users[key].profile_image) {
					users[key].profile_image = sanban.sanRemoveExt(users[key].profile_image);
				}
				var venue = await sanban.sanGetVenue(req,res,users[key]._id);
				if (venue) {
					users[key].venue = venue.venue_name;
				}
				if (users[key].country) {
					users[key].cities = require ('countries-cities').getCities(users[key].country);
					// users[key].cities = san_cities;
				}
			});
			setTimeout(function(){
				var countries = require ('countries-cities').getCountries();
				var country = [];
				//const countries = ct.getAllCountries();
				Object.keys(countries).forEach(function(key,val) {
					country.push({'name':countries[key]});
				});
				// res.json(country);
				User.count().exec(function(err, count) {
					if (err) return next(err)
					res.render(config.directory + '/views/partials/business', {
						users: users,
						page: 'business',
						current: page,
						added : added,
						update : update,
						countries : country,
						pages: Math.round(count / perPage)
					});
				});
			}, 1000);

		});
	});

	app.get('/admin/models',VerifyToken, function(req,res){
		var perPage = 4;
		var page = req.query.page || 1
		var added = req.query.add || '';
		var update = req.query.update || '';
		Model.find({status:1})
		.sort( { approved_date: -1 } )
		.exec(function(err, models) {
			Object.keys(models).forEach(function(key) {
				if (models[key].profile_image) {
					models[key].profile_image = sanban.sanRemoveExt(models[key].profile_image);
				}
			});
			var countries = require ('countries-cities').getCountries();
			var country = [];
			//const countries = ct.getAllCountries();
			Object.keys(countries).forEach(function(key,val) {
				country.push({'name':countries[key]});
			});
			Model.count().exec(function(err, count) {
				if (err) return next(err)
				res.render(config.directory + '/views/partials/models', {
					models: models,
					page: 'models',
					countries : country,
					current: page,
					added : added,
					update : update,
					pages: Math.round(count / perPage)
				});
			})
		});
	});

	app.get('/admin/model_detail',VerifyToken, function(req,res){
		Model.find({_id:req.query.model_id}, function (err, model) {
			if(err) {
				res.status(500).send({result:'error'});
			} else {
				res.render(config.directory + '/views/partials/model_detail', {
					model: model,
					page: 'models'
				});
			}
		});
	});

	app.get('/admin/event_detail',VerifyToken, function(req,res){
		var no_act = 0;
		sanban.sanGetEventById(req, res,req.query.event_id, function(data){
			if (data.events.type =='offer') {
				var pg = 'offers';
			}else{
				var pg = 'events';
			}

			for (var act in data.events.activity_type){
				if (act == 'toBSON') {
					no_act = 1;
					break;
				}
			}
			try {
				var selected_weeks = JSON.parse(data.events.selected_weeks);
			} catch (e) {
				var selected_weeks = data.events.selected_weeks;
			}
			console.log(selected_weeks);
			res.render(config.directory + '/views/partials/event_detail', {
				event: data.events,
				no_act: no_act,
				venue: data.events.venue_id,
				selected_weeks: selected_weeks,
				week_days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
				moment : moment,
				page: pg
			});
		});
	});

	app.get('/admin/venues',VerifyToken, function(req,res){
		User.find({status:1}).exec(function(err, users) {
			Venue.find({}, function (err, venues) {
				if(err) {
					res.status(500).send({result:'error'});
				} else {
					Object.keys(venues).forEach(async(key)=>{
						var count = await sanban.sanGetNoOffers(venues[key]._id);
						venues[key].no_offers = count.ofr_cnt;
						venues[key].reservation_counts = count.rsr_cnt;
						venues[key].checkins_counts = count.chkin_cnt;
						venues[key].cancellation_counts = count.cancel_cnt;
						venues[key].save();
					});
					var countries = require ('countries-cities').getCountries();
					var country = [];
					//const countries = ct.getAllCountries();
					Object.keys(countries).forEach(function(key,val) {
						country.push({'name':countries[key]});
					});
					res.render(config.directory + '/views/partials/venues', {
						venues: venues,
						users:users,
						countries : country,
						page: 'venues'
					});
				}
			});
		});
	});
	app.get('/admin/venue_detail',VerifyToken, function(req,res){
		Venue.findById(req.query.venue_id).exec(function(err, venue){
			if (err) return res.status(500).send("There was a problem finding the events.");
			if (!venue) return res.status(404).send("No Venue found.");
			res.render(config.directory + '/views/partials/venue_detail', {
				venue: venue,
				page: 'home'
			});
		});
	});

	app.get('/get_event', function(req,res){
		var id = '5aaa3dd6326f2b7f515f5fb1';
		sanban.sanGetEventModels(req, res,id, function(data){
			res.json(data);
		});
	});



	app.get('/admin/events',VerifyToken, function(req,res,next){
		sanban.sanAllBusinessUsers(req, res, function(users) {
			var perPage = 4;
			var page = req.query.page || 1;
			var added = req.query.add || '';
			Event.find({type:'event'})
			.populate('business_id')
			.sort( { _id: -1 } )
			.exec(function(err, events) {
				Event.count({type:'event'}).exec(function(err, count) {
					if (err) return next(err)
					Object.keys(events).forEach(function(key) {
						if (events[key].image) {
							var val = events[key];
							var n = events[key].image.lastIndexOf(".");
							events[key].image = events[key].image.substring(0, n);
							if (events[key].business_id && events[key].business_id.first_name) {
								events[key].name = events[key].business_id.first_name;
							}
						}
					});
					Category.find().sort( { _id: -1 } ).exec(function(err, categories) {
						res.render(config.directory + '/views/partials/events', {
							categories: categories,
							events: events,
							users:users.user,
							page: 'events',
							current: page,
							added : added,
							moment : moment,
							pages: Math.round(count / perPage)
						});
					});
				})
			});
		});
	});

	app.get('/admin/offers',VerifyToken, function(req,res){
		sanban.sanAllBusinessUsers(req, res, function(users) {
			var perPage = 4;
			var page = req.query.page || 1;
			var added = req.query.add || '';
			Event.find({type:'offer'})
			.populate('business_id')
			.sort( { _id: -1 } )
			.exec(function(err, offers) { console.log(offers);
				if (err) return false;
				Object.keys(offers).forEach(function(key) {
					// if (offers[key].start_date) {
					// offers[key].end_date = moment(offers[key].end_date, 'YYYY-MM-DD').format("YYYY-MM-DD");
					// }
					//console.log(offers[key].end_date);
					if (offers[key].image) {
						var val = offers[key];
						var n = offers[key].image.lastIndexOf(".");
						offers[key].image = offers[key].image.substring(0, n);
						if (offers[key].business_id && offers[key].business_id.first_name) {
							offers[key].name = offers[key].business_id.first_name;
						}
					}
				});
				Category.find().sort( { _id: -1 } ).exec(function(err, categories) {
					var cc = require('currency-codes');
					res.render(config.directory + '/views/partials/offers', {
						offers: offers,
						categories: categories,
						users:users.user,
						page: 'offers',
						current: page,
						added : added,
						moment : moment,
						country_codes : cc.codes(),
						pages: perPage
					});
				});
			});







			//  Event.find({type:'offer'}).sort( { _id: -1 } ).populate('business_id').exec(function(err, offers){
			//    var idssss = [];
			//    Object.keys(offers).forEach(function(key) {
			//        if (offers[key].image) {
			//          var val = offers[key];
			//          var n = offers[key].image.lastIndexOf(".");
			//          offers[key].image = offers[key].image.substring(0, n);
			//          offers[key].name = offers[key].business_id.first_name;
			//        }
			//    });
			//  res.render(config.directory + '/views/partials/offers', {
			//    offers: offers,
			//    users:users.user,
			//    page: 'offers'
			//  });
			// });
		});

	});

	app.get('/admin/deal',VerifyToken, function(req,res){
		sanban.sanAllBusinessUsers(req, res, function(users) {
			var perPage = 4;
			var page = req.query.page || 1;
			var added = req.query.add || '';
			Event.find({type:'offer'})
			.populate('business_id')
			.sort( { _id: -1 } )
			.exec(function(err, offers) {
				if (err) return next(err)
				Object.keys(offers).forEach(function(key) {
					if (offers[key].image) {
						var val = offers[key];
						var n = offers[key].image.lastIndexOf(".");
						offers[key].image = offers[key].image.substring(0, n);
						if (offers[key].business_id && offers[key].business_id.first_name) {
							offers[key].name = offers[key].business_id.first_name;
						}
					}
				});
				Category.find().sort( { _id: -1 } ).exec(function(err, categories) {
					res.render(config.directory + '/views/partials/deal', {
						offers: offers,
						categories: categories,
						users:users.user,
						page: 'deal',
						current: page,
						added : added,
						moment : moment,
						pages: perPage
					});
				});
			});
		});
	});

	app.get('/admin/countries',VerifyToken, function(req,res){
		sanban.sanGetAllCountries(req, res, function(cntries) {
			const ct = require('countries-and-timezones');
			var country = [];
			const countries = ct.getAllCountries();
			Object.keys(countries).forEach(function(key,val) {
				country.push(countries[key]);
			});
			res.render(config.directory + '/views/partials/countries', {
				countries: cntries,
				countrieslist: country,
				page: 'countries'
			});
		});
	});
	// app.get('/admin/notifications',VerifyToken, function(req,res){
	// 	res.render(config.directory + '/views/partials/notifications', {
	// 		page: 'notifications'
	// 	});
	// });

	app.get('/admin/notifications',VerifyToken, function(req,res){
		res.render(config.directory + '/views/partials/notifications', {
			page: 'notifications'
		});
	});
	app.get('/admin/payment',VerifyToken, function(req,res){
		res.render(config.directory + '/views/partials/notifications', {
			page: 'payment'
		});
	});

	app.get('/admin/categories',VerifyToken, function(req,res){
		var added = req.query.add || '';
		var update = req.query.update || '';
		Category.find().sort( { _id: -1 } ).exec(function(err, categories) {
			res.render(config.directory + '/views/partials/category', {
				categories: categories,
				page: 'category',
				added: added
			});
		});
	});

	app.get('/admin/calc',VerifyToken, function(req,res){
		res.render(config.directory + '/views/partials/venue_cal', {
			venue_id:req.query.venue_id,
			page: 'venues'
		});
		// Venue.find({}).exec(function(err, venues) {
		//   var final_arr = {};
		//   Object.keys(venues).forEach(async(key)=>{
		//     var events = await sanban.sanGetEventsByVenue(venues[key]._id);
		//     final_arr[venues[key]._id] = events;
		//   })
		//   setTimeout(function(){
		//     res.render(config.directory + '/views/partials/venue_cal', {
		//         venues:venues,
		//         events:final_arr,
		//         page: 'calc'
		//     });
		//   }, 1000);
		// });
	});

	app.get('/data',VerifyToken, function(req, res){
		var id = req.query.id; console.log(req.query);
		Venue.findOne({_id: id}, async (error, venue)=> {
			var final_arr = [];
			var events = await sanban.sanGetEventsByVenue(venue._id);
			Object.keys(events).forEach(function(keyy){
				final_arr.push({
					id: events[keyy]._id,
					text:events[keyy].name,
					start_date: new Date(events[keyy].start_date),
					end_date:   new Date(events[keyy].end_date),
					color: "#DD8616"
				})
			});
			res.send(final_arr);
			// setTimeout(function(){ console.log(final_arr);
			//   res.send(final_arr);
			// }, 1000);
		});
	});

	/* Application Menu */
	app.get('/admin/apps',VerifyToken, function(req,res){
		var added = req.query.add || '';
		var update = req.query.update || '';
		User.find({status:0,approved_date:null})
		.sort( { created_date: -1 } )
		.exec(function(err, users) {
			Model.find({status:0,approved_date:null})
			.sort( { created_date: -1 } )
			.exec(function(err, models) {
				var san_cities = [];
				Object.keys(models).forEach(function(key) {
					if (models[key].profile_image) {
						models[key].profile_image = sanban.sanRemoveExt(models[key].profile_image);
					}
				});
				var venue_names = [];
				Object.keys(users).forEach(async(key)=> {
					if (users[key].profile_image) {
						users[key].profile_image = sanban.sanRemoveExt(users[key].profile_image);
					}
					var venuess = await sanban.sanGetVenue(req,res,users[key]._id);
					Object.keys(venuess).forEach(function(key) {
						venue_names.push(venuess[key].venue_name);
					});
					// if (venue) {
					//   users[key].venue = venue_names.join(',');
					// }

					if (users[key].country) {
						users[key].cities = require ('countries-cities').getCities(users[key].country);
						// users[key].cities = san_cities;
					}
				});
				setTimeout(function(){
					var countries = require ('countries-cities').getCountries();
					var country = [];
					//const countries = ct.getAllCountries();
					Object.keys(countries).forEach(function(key,val) {
						country.push({'name':countries[key]});
					});
					// res.json(country);
					var new_venues = [];
					var new_venues_id = [];
					sanban.sanGetAllVenues(req,res,function(venues){
						Object.keys(venues).forEach(function(key) {
							// for (var i = 0; i < venue_names.length; i++) {
							if (!new_venues_id.includes(venues[key]._id)) {
								if (venue_names.includes(venues[key].venue_name)) {
									new_venues_id.push(venues[key]._id);
									new_venues.push({venue_name:venues[key].venue_name,_id:venues[key]._id,select:1});
								}else{
									new_venues_id.push(venues[key]._id);
									new_venues.push({venue_name:venues[key].venue_name,_id:venues[key]._id,select:0});
								}
							}
							// }
						});
						// new_venues = sanban.sanRemoveDuplicates(new_venues,'_id');
						console.log(new_venues);
						res.render(config.directory + '/views/partials/apps', {
							users: users,
							models: models,
							venues: new_venues,
							page: 'apps',
							added : added,
							update : update,
							countries : country
						});
					})
				}, 1500);
				//res.json({'business':users,'models':models});
			});
		});
	});
	/********************/

	app.get('/admin/login', function(req,res){
		res.sendFile(config.directory + '/public/login.html');
	});

	app.get('/notify', function(req,res){
		// const Notify = require('../../controllers/Notify');
		// let notify = Notify();
		// notify.record_id = '5b45b7d1dce8ae5a3e591329';
		// notify.type = 'model';
		// notify.fcm_token = 'cZ3ulLzb-Zg:APA91bESjrt0emWZn7FJ_KQTjCB7fD3dubqsFEB8jr38_Kk7YZFYipN4G3393fTb9XfIFQiWu6fpgoSf2UsHajT7mGOfntpq7q0Ee2XnwQeLgt-qIiPJ85TxUndATsHp6vdoknFcZayW';
		// notify.device_type = 'android';
		// notify.device_id = '88f36d26ee734b64';
		// notify.save();
		sanban.sanSendMessage({id:1,title:'Test Title',body:'test body'});
		res.json('done');
	});

	app.get('/dekho_models', function(req,res,next){
		var ids = ['5b45b7d1dce8ae5a3e591329','5ada3572ec7e6a66e3cdebd1'];
		ids.forEach(function(id) {
			// var models = sanban.sanGetModelById(req,res,next,id);
			// console.log(models);
			Model.where({_id: id}).findAsync().then(function(models) {
				console.log(models);
			}).catch(next).error(console.error);
		});
	});

};
