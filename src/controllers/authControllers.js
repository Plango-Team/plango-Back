const {promisify} = require('util');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const crypto = require ('crypto');

const signToken = id =>{
    return jwt.sign({id},process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN });
}

const createSendToken = (user,statusCode,res)=>{
const token = signToken(user._id);
res.cookie('jwt',token,{
    expires : new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //secure: true,
    httpOnly: true
})

user.password = undefined;
res.status(statusCode).json({
        status: 'success',
        token,
        data : {
            user
        }
    });
} 
exports.signup =async (req,res,next) => {

    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        phone : req.body.phone,
        password: req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });
    createSendToken(newUser,201,res);
}

exports.login = async (req,res,next) => {
    const { email , password } = req.body; 
    // check if email & password exits
    if(!email || !password)
        return  next (new AppError('Please enter your email and password',400));

    const user = await User.findOne({ email }).select('+password');

    if(!user ||  !(await user.correctPassword(password,user.password))){
        return next(new AppError('incorrect email or password'),401);}

        //if everything ok
    createSendToken(user,200,res);
}

exports.protect = async (req,res,next) => {
    // getting token and check if it`s there.
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
        
    }
    if (!token){
        return next(new AppError('you are not logged in !'),401);
    }
    //verification token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    
    
    //check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('the user belongs to this token is not exist anymore',401));
    }

        //check if user changed  password after the token was issed
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError ('user changed the password, log in again'),401);
    }

    req.user = currentUser;
    next(); 
    
}

exports.restrictTo = (...roles) =>{
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError ('you do not have permission to perform this action',403));
        }
        next();    }
    
}

exports.forgetPassword= async (req,res,next)=>{
    // get user 
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('there is no user with this email'),404);
    }
    // generate random reset token
    const resetToken = user.createResetToken();
    await user.save({validateBeforeSave:false});
    // send to user email 
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `submit the link : ${resetUrl} with your new password.\n if you didn't forget your passwprd skip the link.`;
    try{
        await sendEmail ({
        email: user.email,
        subject : 'the password resetToken (valid for 10m)',
        message 
    });
    res.status(200).json({
        status : 'success',
        message: ' resetToken Sent to your email'
    })
    } catch (err){
    
    console.log('ERROR ',err);
        user.passResetToken = undefined;
        user.passResetTokenExpire = undefined;
        await user.save({validateBeforeSave:false});
        return next (new AppError('Error happend try again later!'),500)
    }
    

}

exports.resetPassword= async (req,res,next)=>{
    // get user
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passResetToken: hashedToken, passResetTokenExpire:{$gt:Date.now()}});

    if (!user){
        return next(new AppError('token invalid || expired'),400);}
    // set new password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passResetToken= undefined;
        user.passResetTokenExpire = undefined;
        await user.save();
        // login & send jwt 
        createSendToken(user,200,res);
    

}

exports.updatePassword = async (req,res,next)=>{
    // get user
    const user = await User.findById(req.user.id).select('+password')
    // check if entered password is correct
    if(! await user.correctPassword(req.body.currentPassword,user.password )){
        return next(new AppError ('current password is wrong!'),401)
    }
    //update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // login & send jwt
    createSendToken(user,200,res);
    }