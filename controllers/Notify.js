var mongoose = require('mongoose');

var NotifySchema = new mongoose.Schema({
  record_id: { type: String,default: ''},
  type: { type: String,required: true},
  fcm_token:{ type: String ,unique: true,required: true},
  device_type:String,
  device_id:String,
  created_date:{ type: Date, default: Date.now }
});
mongoose.model('Notify', NotifySchema);
module.exports = mongoose.model('Notify');
