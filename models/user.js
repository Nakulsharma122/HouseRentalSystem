const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  googleId: {
    type: String,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
},
signupMethod: {
  type: String,
  enum: ['google', 'manual'],
  default: 'manual'
}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
