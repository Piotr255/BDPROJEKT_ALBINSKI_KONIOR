const asyncHandler = require('express-async-handler');
const User = require("../models/UserModel");
const Client = require("../models/ClientModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const registerUser = asyncHandler(async (req, res) => {
    const {email, name, password, role, phone, city, street} = req.body;
    // const email = req.body.email;
    // const name = req.body.name;
    // const password = req.body.password;
    // const role = req.body.role;
    // const phone = req.body.phone;
    // const city = req.body.city;
    // const street = req.body.street;
    if(!name || !email || !password || !role || !phone || !city || !street) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }

    const userAvailable = await User.findOne({email});
    if(userAvailable){
        res.status(400);
        throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        email,
        password: hashedPassword,
        role
    });
    if (user) {
        if(role === "client"){
            const user_id = await User.findOne({email}).select("_id");
            const client = await Client.create({
                name,
                user_id: user_id,
                phone,
                address: {city: city, street: street}
            });
            if (client) {
                res.status(201).json({
                    _id: client.user_id,
                    name: client.name,
                    email: user.email,
                    phone: client.phone,
                    city: client.address.city,
                    street: client.address.street});
            } else {
                res.status(400);
                throw new Error("Invalid client data");
            }
        }
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }

});


const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("Please fill in all fields");
    }
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({user: {name: user.name, email: user.email, id: user.id, role: user.role}},
            process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
        res.status(200).json({accessToken});
    }
    else {
        res.status(401);
        throw new Error("Invalid email or password");

    };
});


const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});

module.exports = {registerUser, loginUser, currentUser};