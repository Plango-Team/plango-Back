const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validateHeaderName } = require("http");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "orgnization", "admin"],
    default: "user",
  },
  name: {
    type: String,
    required: [true, "user name is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    lowercase: true,
    validate : [validator.isEmail,'enter email in correct way!']
  },
  phone: {
    type: String,
    required: [true, "phone number is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minlength:8,
    select: false
  },
  passwordConfirm:{
    type: String,
    required: [true,'please confirm your password'],
    // make sure the password and passwordCnfirm are the same
    validate:{
      validator: function (el){
        return el === this.password;
      },
      message : 'password and passwordConfirm are not the same'
    }
  },
  passResetToken: {
    type: String,
  },
  passResetTokenExpire: {
    type: Date,
  },
  avatar: {
    type: String,
    default: "",
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
  passwordChangedAt: {
    type: Date,
  },
});

userSchema.pre('save', async function(){
    // only works when password was modified.
    if(!this.isModified('password')) return ;

    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    
});
  userSchema.pre('save', async function(){
    if(!this.isModified('password')|| this.isNew) return ;
    this.passwordChangedAt=Date.now()-1000;

});  

userSchema.methods.correctPassword= async function (inputPassword,userPassword){
  return await bcrypt.compare(inputPassword,userPassword);
}

userSchema.methods.changedPasswordAfter = async function (jwtTimesTamp) {
    if(this.passwordChangedAt){
      const changedTimesTamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
     // console.log(jwtTimesTamp,changedTimesTamp);
      return jwtTimesTamp < changedTimesTamp; 
    }

  return false;   // means password not changed
}

userSchema.methods.createResetToken = async function () {
  const resetToken = Math.floor(100000+Math.random()*900000).toString();
  this.passResetToken= crypto.createHash('sha256').update(resetToken).digest('hex');
 /// console.log({resetToken},this.passResetToken);
  this.passResetTokenExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
}
const User = mongoose.model('User', userSchema);
module.exports = User;
