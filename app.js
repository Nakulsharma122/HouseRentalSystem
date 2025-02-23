if (process.env.NODE_ENV != "Production") {
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');
const userRoutes1 = require('./routes/userRoute.js');

// MongoDB URL
const dburl = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dburl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// MongoStore setup
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on('error', (err) => {
  console.log('SESSION ERROR', err);
});

const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 6 * 24 * 60 * 60 * 1000,
    maxAge: 6 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Ensure session middleware is used before any routes
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user || null;
  next();
});

app.get("/", (req, res) => {
  res.render("listings/home.ejs");
});

// Use the user routes
app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);
app.use('/', userRoutes1);

app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page not Found!'));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = 'Something went wrong!' } = err;
  res.status(statusCode).render('error.ejs', { message });
});

const port = 8080;
app.listen(port, () => {
  console.log(`server is listening to port http://localhost:${port}`);
});
