const express  = require('express');
const middleware = require('../middlewares/auth.middlewares');
const authController = require('../controllers/auth.controllers');
const router = express.Router() ;

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', middleware.authUser, authController.logout);




module.exports = router ;   