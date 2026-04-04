require('dotenv').config();
const dotenv = require('dotenv');
dotenv.config({path : './.env'})
const express = require('express');
const mongoose =require('mongoose');




const app = require('./app');



const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.set('autoIndex',true);
mongoose.connect(DB).then(()=>{
  console.log('DB connected !');

});



const port = process.env.PORT || 3000; 
const server = app.listen(port, ()=>{
console.log(`Server is running on http://localhost:${port}`);
});
app.get('/', (req, res) => {
  res.send('Hello, World!');
});


