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
}).then(() => {
    console.log('Database connection successful');
  })
  .catch((err) => {
    console.error('Database connection error');
  });;

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

const findAllUrl = async () => {
   const response = await Url.find({});
   return response;
}

const isExist = (urls,urlSubmitted) => {
  const newUrls = [...urls];
  if(newUrls.length == 0)
    return false;

  return newUrls.find(url => url.original_url === urlSubmitted) == undefined ? false : true;

}

const findOneUrl = async url=> {
  let response = {};
  try{
    response = await Url.findOne({original_url: url});
  }catch(err){
    response = err;
  }
  return response;
}

const createAndSaveUrl = async url => {
    //
    const urls = await findAllUrl();
    const nbUrl = urls.length;
    const existUrl = await findOneUrl(url);

    if(existUrl != null)
      return existUrl;

    const urlModel = new Url({
        original_url:url,
        short_url:nbUrl + 1
    })
    let response = {}

    try{
        response = await urlModel.save();
    }catch(err){
        response = err;
    }
    
    return response;

}

//function to check url with promise
//check url with out http
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
    
    let response = {};
    //refactoring create function
    //Add try catch
    let isHostNameValid = false;
    try{
       isHostNameValid = await checkEmailPromise(dns,url);
    }catch(error){
      isHostNameValid = error;
    }

    isHostNameValid = isHostNameValid.address ? true : false;
    
      if(isHostNameValid){   
        const data = await createAndSaveUrl(url);
        const {original_url,short_url} = data;        
        response = {"original_url":original_url,"short_url":short_url}
      }else{
        response = {"error":"invalid url"}
      }
  //  console.log(reponse)
    res.json(response);
})

app.listen(port, function(){
    console.log(`Listening on port ${port}`);
})