import express from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";

import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import LocalStrategy from 'passport-local';
import session from "express-session";
import env from "dotenv";
import morgan from "morgan";

const app = express();
app.use(
  session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // 1 hour
      secure: false,
    },

  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(passport.authenticate('session'))
app.use(passport.initialize());
app.use(passport.session());

const saltRounds = 10;
env.config();
app.use(cookieParser('keyboard cat'));
app.use(express.json());
app.use(morgan('dev'));


const corsOptions = {
  origin: 'http://localhost:3000',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  "Access-Control-Allow-Credentials": true,
  allowedHeaders:
    "Origin, X-Requested-With, X-AUTHENTICATION, X-IP, Content-Type, Accept, x-access-token",
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect('mongodb+srv://Cluster16158:WWZFYGV2TG5I@cluster0.3xc5v.mongodb.net/tread?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });


// Define a Mongoose schema and model
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  name: String,
  note: String,
  loves: Number,
  timestamp: Number,
});

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: new Date().getTime() },
});

const Post = mongoose.model('Post', PostSchema);
const User = mongoose.model('User', UserSchema);


// Define a POST route
app.post('/api/posts', async (req, res) => {
  try {
    console.log(req.body);
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Define a GET route
app.get('/api/posts/', async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a post
app.put('/api/posts/:id', async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate
        (req.params.id, req.body, { new: true });
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Handle Login
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ error: info.message || 'Login failed' });
    }
    req.logIn(user, async (err) => {
      if (err) {
        console.log('Error logging in:', err);
        return res.status(500).json({ error: 'Failed to log in' });
      }
      console.log('Session before adding user:', req.session.passport.user);
      return res.status(200).json({ message: 'Login successful', user });
    });
  })(req, res, next);
});

app.post("/register", async (req, res) => {
  const { username, password, createdAt } = req.body;
  try {
    const checkResult = await User.find({ username: username });
    console.log("checkResult", checkResult);
    if (checkResult.length > 0) {
      res.status(409).json({ message: "User already exists. Please log in." });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          console.log("User", username, "created at", createdAt);
          const newUser = new User({
            username: username,
            password: hash,
            createdAt: createdAt,
          });
          console.log("newUser", newUser);
          const savedUser = await newUser.save();
          res.status(201).json(savedUser);
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/logout", function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.status(200).json({ message: 'Logout successful' });
  });
});


passport.use(
  "local",
  new LocalStrategy(async function verify(username, password, cb) {;
    try {
      const result = await User.find({ username: username });
      if (result.length > 0) {
        const user = result[0].username;
        const storedHashedPassword = result[0].password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, result[0]);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

// passport.serializeUser(function (user, cb) {
//   console.log("serializeUser", user);
//   process.nextTick(function () {
//     cb(null, user);
//   });
// });

// passport.deserializeUser(function (id, cb) {
//     console.log("deserializeUser", id);
//     User.find(id, function(err, user) {
//       cb(err, user);
//     });
// });

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});


app.get("/checkAuthentication", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    console.log('User is authenticated', req.isAuthenticated());
    // Accessing the user info from req.user
    const user = req.session.passport.user;
    res.json({
      id: req.user._id,
      username: req.user.username,
      createdAt: req.user.createdAt
    });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});