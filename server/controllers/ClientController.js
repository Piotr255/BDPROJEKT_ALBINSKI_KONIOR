/**
 * @author pa
 */
const Grade = require('../models/Grade');
const Order = require('../models/Order');
const Client = require('../models/Client');
const Worker = require('../models/Worker');
const mongoose = require('mongoose');
const asyncHandler = require("express-async-handler");
const Pizza = require("../models/Pizza");
const User = require("../models/User");
const addressSchema = require("../models/Address");
const gradeSchema = require("../models/Grade");
const ObjectId = mongoose.Types.ObjectId;


const getAvailablePizzas = asyncHandler(async (req, res, next) => {
  try {
    const pizzas = await Pizza.find({available: true}, 'name menu_number ingredients price available');
    res.status(200).json(pizzas);
  } catch (err) {
    next(err);
  }
});

async function checkPizzasAvailability(basket, res, sessionId) {
  const session = await mongoose.startSession({_id: sessionId});
  const pizzaIds = basket.map(item => item.id);
  const pizzas = await Pizza.find({ _id: { $in: pizzaIds } },null,  {session});
  const unavailablePizzas = pizzas.filter(pizza => !pizza.available);

  if (unavailablePizzas.length > 0) {
    const unavailablePizzaNames = unavailablePizzas.map(pizza => pizza.name).join(', ');
    res.status(400);
    throw new Error(`Pizzas ${unavailablePizzaNames} aren't available. We can't make an order.`);
  }
}

async function findEmployee(sessionId) {


  const session = await mongoose.startSession({_id: sessionId});

  const employees = await Worker.find({worker_type: "employee", status: "active"}, null, { session });

  if (employees.length === 0) {
    throw new Error("There are no pizzaiolos available at the moment.");
  }
  const bestEmployee = employees.reduce((best, current) => {
    if (current.current_orders.length < best.current_orders.length) {
      return current;
    } else {
      return best;
    }
  }, employees[0]);
  return bestEmployee;
}

const calculateOrderPrice = async (sessionId, ) => {}



const makeOrder = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  await session.startTransaction();
  try {
    const {email, id, role} = req.user;
    let { basket, order_date, order_notes, to_deliver, discounts} = req.body; // basket: [{pizza_id: ObjectId, count: Number}, {pizza_id: ObjectId, count: Number}, ...]
    discounts = discounts.map(discount => new ObjectId(discount));
    if (role !== "client") {
      res.status(401);
      throw new Error("Unauthorized");
    }
    if (basket.length === 0) {
      res.status(400);
      throw new Error("We do not accept empty orders");
    }
    const employee = await findEmployee(session.id);
    await checkPizzasAvailability(basket, res, session.id);
    const clientData = await Client.findOne({_id: id},null, {session});
    const order_ = await Order.create([
      {
        client_id: id,
        employee_id: employee._id,
        pizzas: basket,
        client_address: clientData.address,
        order_notes,
        order_date,
        status: '0',
        to_deliver,
        discounts
      }
    ], { session });
    const order = order_[0];
    await Worker.updateOne({_id: employee._id}, {$push: {current_orders: order.id}}, {session});
    await session.commitTransaction();
    res.status(200).json({
      order_id: order._id,
      message: "Order placed.",
      client_id: id,
      employee_id: employee._id,
      pizzas: basket,
      client_address: clientData.address,
      order_notes,
      order_date
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
});

const rateOrder = asyncHandler(async (req, res, next) => {
  try {
    const {email, id, role} = req.user;
    const { grade_for_food, grade_for_service, comment } = req.body;
    await Order.updateOne({ client_id: id }, {$set: {grade:
        {
          grade_for_food: grade_for_food,
          grade_for_service: grade_for_service,
          comment: comment
        }}});
    res.status(200).json({
      message: "Order has been rated",
      grade_for_food,
      grade_for_service,
      comment
    });
  } catch (err) {
    next(err);
  }
});

const getOrderHistory = asyncHandler(async (req, res) => {
  const {email, id, role} = req.user;
});


module.exports = { getAvailablePizzas, makeOrder, rateOrder };