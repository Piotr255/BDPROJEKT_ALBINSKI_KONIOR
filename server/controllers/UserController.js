const asyncHandler = require('express-async-handler');
const User = require("../models/User");
const Client = require("../models/Client");
const Worker = require("../models/Worker");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");


const registerClient = asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
        const { email, name, password, role, phone, city, street, zip_code, district} = req.body;

        if (!name || !email || !password || !role || !phone || !city || !street || !zip_code || !district) {
            throw new Error("Please fill in all fields");
        }

        const userAvailable = await User.findOne({ email }, null, { session }); // sprawdzamy czy istnieje użytkownik o podanym emailu
        if (userAvailable) {
            throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create([{ //tworzymy użytkownika
            email,
            password: hashedPassword,
            role
        }], { session });

        if (user && role === "client") {
            const user_id = user[0]._id;
            const client = await Client.create([{ //tworzymy klienta
                _id: user_id,
                name,
                phone,
                address: { city, street, zip_code, district}
            }], { session });

            if (client) {
                await session.commitTransaction(); //użytkownik i klient poprawnie stworzeni, zatwierdzamy transakcję
                res.status(201).json({
                    _id: client[0].user_id,
                    name: client[0].name,
                    email: user[0].email,
                    phone: client[0].phone,
                    city: client[0].address.city,
                    street: client[0].address.street,
                    zip_code: client[0].address.zip_code,
                    district: client[0].address.district
                });
            }
        } else {
            throw new Error("Invalid user data or role");
        }

    } catch (error) {
        res.status(400);
        await session.abortTransaction();
        next(error);
    } finally {
        await session.endSession();
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
        const accessToken = jwt.sign({user: {email: user.email, id: user.id, role: user.role}},
            process.env.ACCESS_TOKEN_SECRET, {expiresIn: "7d"});
        res.status(200).json({accessToken});
    }
    else {
        res.status(401);
        throw new Error("Invalid email or password");

    };
});

const deleteUser = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    await session.startTransaction();
    try{
        const {email, password} = req.body;
        if(!email || !password){
            res.status(400);
            throw new Error("Please fill in all fields");
        }
        const user = await User.findOne({ email }, { session });
        if (user && (await bcrypt.compare(password, user.password))) {
            await User.deleteOne({email});
            if (user.role === "client") {
                await Client.deleteOne({_id: user.id});
            } else if (user.role === "worker") {
                await Worker.deleteOne({_id: user.id});
            }
            await session.commitTransaction();
            res.status(200).json({email, message: "User deleted"});
        }
        else {
            res.status(401);
            throw new Error("There is no user with this email or password is incorrect");

        }
    }
    catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        await session.endSession();
    }
});




const currentUser = asyncHandler(async (req, res) => {
    const {email, id, role} = req.user;
    if(role === "admin"){
        res.status(200).json({email, id, role});
    }
    else if(role === "client"){
        const client = await Client.findOne({_id: id});
        res.status(200).json({email, id, role, name: client.name,
        phone: client.phone, city: client.address.city, street: client.address.street});
    }
    else if(role === "worker"){
        const worker = await Worker.findOne({_id: id});
        res.status(200).json({email, id, role, name: worker.name,
        phone: worker.phone, city: worker.address.city, street: worker.address.street});
    }
    else {
        res.status(401);
        throw new Error("Invalid role");
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const {email, id, role} = req.user;
    const {old_password, new_password} = req.body;
    if(!old_password || !new_password) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }
    const user = await User.findOne({email});
    if (user && (await bcrypt.compare(old_password, user.password))) {
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await User.updateOne({email}, {password: hashedPassword});
        res.status(200).json({email, message: "Password changed"});
    }
    else {
        res.status(401);
        throw new Error("Incorrect old password");
    }

});


const changeAddress = asyncHandler(async (req, res) => {
    const {email, id, role} = req.user;
    const {new_address} = req.body;
    if(!new_address) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }
    if(role === "client"){
        await Client.updateOne({_id: id}, {address: new_address});
        res.status(200).json({email, id, role, new_address});
    }
    else if(role === "worker"){
        await Worker.updateOne({_id: id}, {address: new_address});
        res.status(200).json({email, id, role, new_address});
    }
    else {
        res.status(401);
        throw new Error("Invalid role");
    }

});

// const updateUser = asyncHandler(async (req, res) => {
//     const {email, id, role} = req.user;
//     const { email, name, password, role, phone, city, street, zip_code } = req.body; //new_data
//     if(role === "admin"){
//         if (!email || !password || !role || !phone || !city || !street || !zip_code) {
//             throw new Error("Please fill in all fields");
//         }
//     }
//     else if(role === "client"){
//         const client = await Client.findOne({_id: id});
//         res.status(200).json({email, id, role, name: client.name,
//             phone: client.phone, city: client.address.city, street: client.address.street});
//     }
//     else if(role === "worker"){
//         const worker = await Worker.findOne({_id: id});
//         res.status(200).json({email, id, role, name: worker.name,
//             phone: worker.phone, city: worker.address.city, street: worker.address.street});
//     }
//     else {
//         res.status(401);
//         throw new Error("Invalid role");
//     }
// });
//


module.exports = {registerUser: registerClient, loginUser, currentUser, deleteUser, changePassword, changeAddress};