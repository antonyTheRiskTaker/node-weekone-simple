// Require all of the modules needed for this application

const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const fs = require("fs");
const path = require("path");

// Set up the packages that we have just required
const app = express();

// Setup the port environment that we will use
const port = 3030;

// Setup the middleware for our program
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

// uploadDirectory is the path to our directory named uploaded, where we will store our cached files, path.sep provides the platform specific path segment separator, e.g. '/' for Linux or POSIX systems, '\' for the Windows system
const uploadDirectory = __dirname + path.sep + "uploaded";

// Server the uploaded folder to the server, allowing the users to download cached information.
app.use(express.static("uploaded"));
app.use(express.static("public/"));

// Declare a variable named caches, define it as an empty object
let caches = {};

// Promised version of Read and Write files

// writeFile is a function which takes the name of the file (i.e. 1st argument) and the body (data) for storage (i.e. 2nd argument) - it will write the file to our uploadDirectory 'uploaded', this promise resolves with the name of the file
function writeFile(name, body) {
  return new Promise((resolve, reject) => {
    fs.writeFile(uploadDirectory + path.sep + name, body, (err) => {
      if (err) {
        return reject(err);
      } else {
        resolve(name);
      }
    });
    // (Line below) the resolved file name is passed into the callback function 'readFile'
  }).then(readFile);
}

// readFile is a function which takes the file as an input, it goes to the 'uploaded' directory that we serve via express. It will then look for the name of the file that we pass into the function, the promise will resolve with the body of the file (the data)

function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(uploadDirectory + path.sep + file, (err, body) => {
      if (err) {
        return reject(err);
      } else {
        resolve(body);
      }
    });
  });
}

app.get("/", (req, res) => {
  // logic for reading your uploaded file and storing all the data back into a cache reach reload
  res.sendFile(__dirname + "/pages/index.html");
});

console.log('Printing caches:', caches);
const greeting = fs.readFileSync(`${__dirname}/greet.txt`, 'utf8');
console.log('Printing greeting:', greeting);

// (This '/files' post request) to upload files
app.post("/files", (req, res) => {
  // after the request path upload.single('upload'),
  console.log(req.files);

  //   if (req.files.upload instanceof Array) {
  //     for (var i = 0; i < req.files.upload.length; i++) {
  //       let file = req.files.upload[i].name;
  //       let data = req.files.upload[i].data;
  //       caches[file] = writeFile(file, data);
  //       console.log(caches);
  //       caches[file]
  //         .then(() =>
  //           res.end(
  //             "Wow you sent a file, can you remember how to download it? Goto your browser, url: localhost:3000/uploaded/:file-name"
  //           )
  //         )
  //         .catch((error) => {
  //           console.log(error);
  //           res.end(error);
  //         });
  //     }
  //   } else {
  console.log(req.files);

  let file = req.files.upload.name;
  let data = req.files.upload.data;

  caches[file] = writeFile(file, data);

  caches[file]
    .then(() =>
      res.send(
        "Wow you sent a file, can you remember how to download it? Goto your browser, url: localhost:3000/uploaded/:file-name"
      )
    )
    .catch((e) => res.status(500).send(e.message));
  //   }
});

app.get("/uploaded/:name", (req, res) => {
  // (The if block below) to make sure that the requested file exists; if not, to retrieve it from the server (i.e. the 'uploaded' folder) and store it in the caches object
  if (caches[req.params.name] == null) {
    console.log("reading from folder");
    // (Line below) to create a new cache property (property = name-value pair in an object) representing the read file
    caches[req.params.name] = readFile(req.params.name);
  }
  console.log(caches);
  console.log(caches[req.params.name]);

  // (The then-catch code below) once we make sure that the requested file is in the caches object, we can then send the file (in the form of a response body) back to the client as a response; if not, send back a message denoting some server error
  caches[req.params.name]
    .then((body) => {
      console.log(body);
      res.send(body);
    })
    .catch((e) => res.status(500).send(e.message));
});

app.listen(port, () => {
  console.log(`Application Listening to port: ${port}`);
});

// examples
//This application doesnt have buttons or anything to download the file. In order to download the file, you must emulate the route that has been set up.
// app.get('/files/:name' where the name is the file name that you've uploaded.

// const app = require("express")();

// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

// app.listen(8080, () => {
//   console.log("listening to port 8080");
// });
