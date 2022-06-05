const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const RedirectLink = require("./models/RedirectLink");
const validator = require("validator");
const morgan = require("morgan");
const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("common"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dotenv.config();

const PORT = process.env.PORT || 8000;
const API_KEY = process.env.API_KEY;
const URL = process.env.MONGODB_URL;
mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, err => {
  if(err) 
      throw err;
  console.log('Connected to mongodb')
})

app.get('/', (req, res) => {
  res.send("Hello ");
});

app.post('/api/createlink', async(req, res) => {
  try {
    const { sourceId, destinationURL, apiKey } = req.body;
    if(apiKey===API_KEY) {
      const link = await RedirectLink.find({sourceId});
      // console.log(link.length);
      if(link.length)
        res.status(409).json({error: "sourceId conflict", helperErrorCode: 101});
      else {
        console.log(destinationURL)

        
        const validateDestinationURL = validator.isURL(destinationURL, {
          protocols: ['http','https','ftp'], 
          require_tld: true, 
          require_protocol: true, 
          require_host: true, 
          require_port: false, 
          require_valid_protocol: true, 
          allow_underscores: false, 
          host_whitelist: false, 
          host_blacklist: false, 
          allow_trailing_dot: false, 
          allow_protocol_relative_urls: false, 
          allow_fragments: true, 
          allow_query_components: true, 
          disallow_auth: false, 
          validate_length: true
        })

        if(validateDestinationURL && sourceId!=='') {
          const newLink = new RedirectLink({
            sourceId,
            destinationURL
          })

          const newRedirectLink = await newLink.save();

          console.log(newRedirectLink);

          res.status(200).json(newRedirectLink);
        }
        else {
          res.status(400).json({error: "Invalid input", helperErrorCode: 102});
        }
      }
    }
    else {
      res.status(400).json({error: "Invald api key", helperErrorCode: 103});
    }
    
  } catch(error) {
    console.log(error);
    res.status(500).json(error);
  }
});

app.get('/:sourceId', async(req, res) => {

  const { sourceId } = req.params;
  try {
    const existingLink = await RedirectLink.find({sourceId});

    if(!existingLink.length) {
      res.status(404).json({error: "Bad Link"});
    }
    else {
      console.log(existingLink[0].destinationURL);
      res.writeHead(301, {
        Location: existingLink[0].destinationURL
      }).end();
    }
  } catch(error) {
    res.status(500).json(error);
  }

});

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});