const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mid = require('../middleware');

//GET /profile
router.get('/profile', mid.requiresLogIn, (req, res, next) => {
  User.findById(req.session.userId)
      .exec((error, user) => {
        if (error) {
          return next(error);
        } else {
          return res.render('profile',
              { title: 'Profile', name: user.name, favorite: user.favoriteBook});
        }
      });
});

// GET /logout
router.get('/logout', (req, res, next) => {
  if (req.session) {
    //delete session object
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
  }
});

// GET /login
router.get('/login', mid.loggedOut, (req, res, next) => {
  return res.render('login', {title: 'Log In'});
});

// POST /login
router.post('/login', (req, res, next) => {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, (error, user) => {
      if (error || !user) {
        const err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    const err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});

// GET /
router.get('/', (req, res, next) => {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', (req, res, next) => {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', (req, res, next) => {
  return res.render('contact', { title: 'Contact' });
});

// GET /register
router.get('/register', mid.loggedOut, (req, res, next) => {
  return res.render('register', {title: 'Sign Up'});
});

// POST /register
router.post('/register', (req, res, next) => {
  if (req.body.email &&
      req.body.name &&
      req.body.favoriteBook &&
      req.body.password &&
      req.body.confirmPassword) {
    // confirm user typed same password
    if (req.body.password !== req.body.confirmPassword) {
      const err = new Error('Passwords do not match.');
      err.status = 400;
      return next(err);
    }

    // create object with form input
      const userData = {
        email: req.body.email,
          name: req.body.name,
          favoriteBook: req.body.favoriteBook,
          password: req.body.password
      };

    // user schema's `create` method to insert document into Mongo
      User.create(userData, (error, user) => {
        if(error) {
          return next(error);
        } else {
          req.session.userId = user._id;
          return res.redirect('/profile');
        }
      });

  } else {
    const err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

module.exports = router;
