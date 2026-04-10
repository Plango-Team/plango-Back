const User = require('../models/userModel');
const AppError = require('../utils/appError');


exports.getUsers =  async (req,res)=>{
    const users = await User.find();
    res.status(200).json({
            status : 'success',
            numUser : users.length,
            data :{
                users
            }
        });
    };