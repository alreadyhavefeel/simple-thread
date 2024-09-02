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


env.config();
const app = express();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
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

app.use(cookieParser(process.env.SESSION_SECRET));
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

process.env.DB_URI
const db = process.env.DB_URI
mongoose
    .connect(db, {})
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Define a Mongoose schema and model
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  name: String,
  note: { type: String, required: true },
  loves: Number,
  timestamp: Number,
});

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: new Date().getTime() },
});

const Post = mongoose.model('Post', PostSchema);
const User = mongoose.model('User', UserSchema);

// Define a POST route
app.post('/api/posts', async (req, res) => {
  // Add user._id to the req.body
  const reqBody = req.body;
  reqBody.name = req.user.username;
  if (req.isAuthenticated()) {
    try {
      const newPost = new Post(reqBody);
      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(401).json({ error: 'User not authenticated' });
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

app.post('/post/:postId/like', (req, res) => {
  const userId = req.user._id; // Assuming user is authenticated and `req.user` is available
  const postId = req.params.postId;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user has already liked the post
      const hasLiked = post.likes.includes(userId);
      
      if (hasLiked) {
        // User has already liked the post; you can ignore or unlike
        return res.status(400).json({ error: 'User has already liked this post' });
      }

      // Add user ID to the likes array
      post.likes.push(userId);

      // Save the updated post
      return post.save().then(updatedPost => res.json(updatedPost));
    })
    .catch(error => res.status(500).json({ error: 'Something went wrong' }));
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
      console.log('Session after login:', req.session);
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

app.get("/logout", async function(req, res, next) {
  await req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      }
      // Optionally clear the cookie
      res.clearCookie('connect.sid', {path: '/'}); // Replace 'connect.sid' with your session cookie name if different
      res.status(200).json({ message: 'Logout successful' });
    });
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

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});


app.get("/checkAuthentication", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ 
      authenticated: true,
      id: req.user._id,
      username: req.user.username,
      createdAt: req.user.createdAt
    });
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

app.get('/auth', function (req, res) {
  res.json({user: req.user});
})

const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});