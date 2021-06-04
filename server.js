const express = require("express");
const path = require("path");
const { get } = require("request");
const mysql = require("mysql");
const dotenv = require('dotenv');
const fs = require('fs');
const http = require('http');
const https = require('https');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const User = require("./models/user");
const moment = require('moment');
/* const today = moment();
console.log(today.format()); */

dotenv.config({ path: './.env' });

const app = express();

/* const privateKey  = fs.readFileSync(process.env.PRIVATE_KEY_PEM, 'utf8');
const certificate = fs.readFileSync(process.env.CERTIFICATE_PEM, 'utf8');

const credentials = {key: privateKey, cert: certificate}; */

const MONGO_DB_URL = "mongodb://localhost/attendance";

// Connect to MongoDB Atlas
mongoose
    .connect(MONGO_DB_URL, { useNewUrlParser: true })
    .then(result => {

        // Listen on port 1000
        const port = process.env.PORT || 1000;
        app.listen(port, () =>
            console.log("Express app listening on port " + port)
        );

        const httpServer = http.createServer(app);
        //const httpsServer = https.createServer(credentials, app);

        /*     httpServer.listen(port, () =>
              console.log("Express app listening on http port " + port)
            ); */
        //httpsServer.listen(8444);

    })
    .catch(err => {
        console.log("Not connected to db: " + err);
    });

var db = mongoose.connection;

// Handle mongo error checking
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
    console.log("we are connected!");
});
/*
var users = [];

const con = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DATABASE_PORT,
  multipleStatements: true
});

 con.connect( (error) => {
  if(error) {
    console.log(error)
  } else {
    console.log("MySQL Connected...")
  }
})

con.query('SELECT * FROM students', (err,rows) => {
  if(err) throw err;

  rows.forEach( (row) => {
    names = `${row.stdn_roll}`;
    users.push(names);
  });

  console.log(users);

}); */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use sessions for tracking logins
app.use(
    session({
        secret: "simplifyjs rocks!",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            mongooseConnection: db
        })
    })
);

// Session isLogin
app.use((req, res, next) => {
    res.locals.isLogin = req.session.userId != undefined;
    res.locals.isTeacher = (req.session.userType === 'Teacher') ? true : false;
    res.locals.isStudent = (req.session.userType === 'Student') ? true : false;

    console.log(req.session);
    /*   res.locals.userFirstname = req.session.userFirstname;
      res.locals.userLastname = req.session.userLastname;
      res.locals.userEmail = req.session.userEmail;
      res.locals.userUsername = req.session.userUsername;
      res.locals.userType = req.session.userType; */
    //console.log('teacher',res.locals.isTeacher);
    //console.log('student',res.locals.isStudent);

    next();
});

// Middleware for Flash
app.use(flash());

const viewsDir = path.join(__dirname, "views");
app.use(express.static(viewsDir));
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.static(path.join(__dirname, "./images")));
app.use(express.static(path.join(__dirname, "./weights")));
app.use(express.static(path.join(__dirname, "./attendance")));
app.use(express.static(path.join(__dirname, "./dist")));
app.set("view engine", "ejs");


// User session
app.use((req, res, next) => {
    if (!req.session.userId) {
        return next();
    }
    User.findById(req.session.userId)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(err);
        });
})

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const dir = "./images/" + req.session.userId
        fs.exists(dir, exist => {
            if (!exist) {
                return fs.mkdir(dir, error => cb(error, dir))
            }
            return cb(null, dir)
        })
    },
    filename: function(req, file, cb) {
        cb(null, req.session.userId + "1.jpg")
            //cb(null, req.session.userId + path.extname(file.originalname))
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})

app.post("/upload-profile-pic", upload.any(), function(req, res, next) {
    try {
        return res.redirect("/account");
    } catch (error) {
        console.error(error);
    }
});

app.post("/upload-attend-pic/:classroomId", function(req, res) {

    const storagecheck = multer.diskStorage({
        destination: function(req, file, cb) {
            const dir = "./attendance/" + req.params.classroomId
            fs.exists(dir, exist => {
                if (!exist) {
                    return fs.mkdir(dir, error => cb(error, dir))
                }
                return cb(null, dir)
            })
        },
        filename: function(req, file, cb) {

            cb(null, req.params.classroomId + '-' + moment().format('YYYYMMDD') + '.jpg')
                //cb(null, req.session.userId + path.extname(file.originalname))
        }
    })

    var upload = multer({ storage: storagecheck, fileFilter: fileFilter }).any();

    upload(req, res, function(err) {
        if (err) {
            //console.log(err);
            return res.end("Error uploading file.");
        } else {
            //console.log(req.body);
            req.files.forEach(function(f) {
                console.log(f);
                // and move file to final destination...
            });

            return res.redirect("/my-classrooms/" + req.params.classroomId);

            //res.end("File has been uploaded");
        }
    });
});

app.post("/upload-attend-pic/:classroomId/:studentId", function(req, res) {

    const storagecheck = multer.diskStorage({
        destination: function(req, file, cb) {
            const dir = "./attendance/" + req.params.classroomId
            fs.exists(dir, exist => {
                if (!exist) {
                    return fs.mkdir(dir, error => cb(error, dir))
                }
                return cb(null, dir)
            })
        },
        filename: function(req, file, cb) {

            cb(null, req.params.classroomId + '-' + req.params.studentId + '-' + moment().format('YYYYMMDD') + '.jpg')
                //cb(null, req.session.userId + path.extname(file.originalname))
        }
    })

    var upload = multer({ storage: storagecheck, fileFilter: fileFilter }).any();

    upload(req, res, function(err) {
        if (err) {
            //console.log(err);
            return res.end("Error uploading file.");
        } else {
            //console.log(req.body);
            req.files.forEach(function(f) {
                console.log(f);
                // and move file to final destination...
            });

            return res.redirect("/student-classrooms/" + req.params.classroomId);

            //res.end("File has been uploaded");
        }
    });
});

// Middleware for CSRF protection
app.use(csrf());

// Render Locals CSRF
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Router module
const registerRouter = require("./routes/register"),
    profileRouter = require("./routes/profile"),
    classroomRouter = require("./routes/classroom"),
    postRouter = require("./routes/post");

// Routes
app.use(profileRouter);
app.use(registerRouter);
app.use(classroomRouter);
app.use(postRouter);

// Catch 404 and forward to error handler
var notFoundCtrl = require("./controller/error.js");
app.use(notFoundCtrl.getNotFound);

// Server Error handler
// Define as the last app.use callback
app.use(function(err, req, res, next) {
    var statusCode = err.status || 500;
    res.render("error", {
        pageTitle: err.status,
        errorStatus: statusCode,
        errMessage: err.message
    });
});
/* 
app.get("/", (req, res) => res.redirect("/recognition"));
app.get("/recognition", (req, res) => {

  let claId = req.query.claId;
  let bachId = req.query.bachId;
  let sbjtId = req.query.sbjtId;
  if(claId && bachId && sbjtId){
    res.render ( "webcamFaceRecognitionQR", { users: users, claId: claId, bachId: bachId, sbjtId: sbjtId });
  }else{
    res.render ( "webcamFaceRecognition", { users: users });
  }

  });

app.get("/about", (req, res) => {
    res.render ( "about", { users: users});
  });  

app.post('/faceattend', function (req, res) {
  con.query('INSERT INTO attendances SET ?', req.body, 
        function (err, result) {
            if (err) throw err;
            return res.status(200).send('User added to database with ID: ' + result.insertId);
        }
    );
});  

app.post("/fetch_external_image", async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).send("imageUrl param required");
  }
  try {
    const externalResponse = await request(imageUrl);
    res.set("content-type", externalResponse.headers["content-type"]);
    return res.status(202).send(Buffer.from(externalResponse.body));
  } catch (err) {
    return res.status(404).send(err.toString());
  }
}); */

//app.listen(4000, () => console.log("Listening on port 4000!"));
// your express configuration here



function request(url, returnBuffer = true, timeout = 10000) {
    return new Promise(function(resolve, reject) {
        const options = Object.assign({}, {
                url,
                isBuffer: true,
                timeout,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
                }
            },
            returnBuffer ? { encoding: null } : {}
        );

        get(options, function(err, res) {
            if (err) return reject(err);
            return resolve(res);
        });
    });
}