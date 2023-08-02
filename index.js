const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
var path = require('path');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/views/index.html');
})

app.listen(port, function(){
    console.log(`Listening on port ${port}`);
})