const asyncHandler = require('express-async-handler');
const User = require("../models/User");
const Client = require("../models/Client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");



const registerUser = asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    await session.startTransaction();
    console.log("session_started");
    try {
        const { email, name, password, role, phone, city, street, zip_code } = req.body;

        if (!name || !email || !password || !role || !phone || !city || !street || !zip_code) {
            res.status(400);
            throw new Error("Please fill in all fields");
        }

        const userAvailable = await User.findOne({ email });
        if (userAvailable) {
            res.status(400);
            throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create([{
            email,
            password: hashedPassword,
            role
        }], { session });
        console.log("user_Created", user);
        if (user && role === "client") {
            const user_id = user[0]._id;
            const client = await Client.create([{
                _id: user_id,
                name,
                phone,
                address: { city, street, zip_code }
            }], { session });
            console.log("client_Created");
            if (client) {
                await session.commitTransaction();
                res.status(201).json({
                    _id: client[0].user_id,
                    name: client[0].name,
                    email: user[0].email,
                    phone: client[0].phone,
                    city: client[0].address.city,
                    street: client[0].address.street,
                    zip_code: client[0].address.zip_code
                });
            } else {
                res.status(400);
                throw new Error("Invalid client data");
            }
        } else {
            res.status(400);
            throw new Error("Invalid user data or role");
        }

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        await session.endSession();
    }
});


// const registerUser = asyncHandler(async (req, res) => {
//     const session = await mongoose.startSession();
//     const {email, name, password, role, phone, city, street} = req.body;
//     // const email = req.body.email;
//     // const name = req.body.name;
//     // const password = req.body.password;
//     // const role = req.body.role;
//     // const phone = req.body.phone;
//     // const city = req.body.city;
//     // const street = req.body.street;
//     if(!name || !email || !password || !role || !phone || !city || !street) {
//         res.status(400);
//         throw new Error("Please fill in all fields");
//     }
//
//     const userAvailable = await User.findOne({email});
//     if(userAvailable){
//         res.status(400);
//         throw new Error("User already exists");
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({
//         email,
//         password: hashedPassword,
//         role
//     });
//     if (user) {
//         if(role === "client"){
//             const user_id = await User.findOne({email}).select("_id");
//             const client = await Client.create({
//                 name,
//                 _id: user_id,
//                 phone,
//                 address: {city: city, street: street}
//             });
//             console.log(client);
//             if (client) {
//                 res.status(201).json({
//                     _id: client._id,
//                     name: client.name,
//                     email: user.email,
//                     phone: client.phone,
//                     city: client.address.city,
//                     street: client.address.street});
//             } else {
//                 res.status(400);
//                 throw new Error("Invalid client data");
//             }
//         }
//     } else {
//         res.status(400);
//         throw new Error("Invalid user data");
//     }
//
//});
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("Please fill in all fields");
    }
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({user: {email: user.email, id: user.id, role: user.role}},
            process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
        res.status(200).json({accessToken});
    }
    else {
        res.status(401);
        throw new Error("Invalid email or password");

    };
});


const currentUser = asyncHandler(async (req, res) => {
   // res.json(req.user);
    const {email, id, role} = req.user;
    if(role === "admin"){
        res.status(200).json({email, id, role});
    } else{

    const client = await Client.findOne({_id: id});
    console.log(client);
    res.status(200).json({email, id, role, name: client.name,
        phone: client.phone, city: client.address.city, street: client.address.street});
    }
});

module.exports = {registerUser, loginUser, currentUser};