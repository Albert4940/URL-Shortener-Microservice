const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
var path = require('path');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const {URL} = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

const urlSchema = new mongoose.Schema({
    original_url:{
        type:String,
        required:true
    },
    short_url:{
        type: Number,
        required: false
    }
})

const Url = mongoose.model('Url',urlSchema);

const createAndSaveUrl = data => {
    //const url = 
}

//function to check url with promise
const checkEmailPromise = (dns, url) => {
    const urlObject = new URL(url);
     const hostname = urlObject.hostname;
   return new Promise((resolve,reject) => {
     dns.lookup(hostname, (error, address, family) => {
       // if an error occurs, eg. the hostname is incorrect!
       if (error) {
         reject({error:error.message})
       } else {
         // if no error exists
          resolve({address:address})
       }
     });
   })
 }
  
app.use(bodyParser.urlencoded({exetended:false}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/views/index.html');
})

app.post('/api/shorturl', async (req, res) => {
    const {url} = req.body;
    
    let respons = {};
    let isHostNameValid = false;
    try{
       isHostNameValid = await checkEmailPromise(dns,url);
    }catch(error){
      isHostNameValid = error;
    }
    isHostNameValid = isHostNameValid.address ? true : false;
    
      if(isHostNameValid){
        respons = {"original_url":url,"short_url":2}
      }else{
        respons = {"error":"Invalid Hostname"}
      }
  //  console.log(reponse)
    res.json(respons);
})

app.listen(port, function(){
    console.log(`Listening on port ${port}`);
})