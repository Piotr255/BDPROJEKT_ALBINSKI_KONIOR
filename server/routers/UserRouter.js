const express = require('express');
const router = express.Router();
const {registerUser, loginUser, currentUser, deleteUser, changePassword} = require('../controllers/UserController');
const validateToken = require('../middleware/validateToken');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/current', validateToken, currentUser);
router.delete('/delete', validateToken, deleteUser);
router.patch('/change_password', validateToken, changePassword);

module.exports = router;