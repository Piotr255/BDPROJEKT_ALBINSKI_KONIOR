/**
 * @author pa
 */
const Grade = require('../models/Grade');
const Order = require('../models/Order');
const Client = require('../models/Client');
const Worker = require('../models/Worker');
const Discount = require('../models/Discount');
const mongoose = require('mongoose');
const asyncHandler = require("express-async-handler");
const Pizza = require("../models/Pizza");
const AdminVars = require("../models/AdminVars");
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

async function calculateTotalPrice(basket, to_deliver, session_Id, delivery_price, res) {
  const session = await mongoose.startSession({_id: session_Id});
  const pizzas = await Pizza.find({_id : {$in: basket.map(item => item.pizza_id)}}, null, {session});

  if (pizzas.length !== basket.length) {
    res.status(400);
    throw new Error("Some pizzas are not available");
  }
  let priceWithDiscount = 0;
  let priceWithoutDiscount = 0;
  for (let basketPos of basket) {
    let pizza = pizzas.find((item) => item._id.equals(basketPos.pizza_id));
    priceWithDiscount += pizza.price * basketPos.count * (1-basketPos.discount);
    priceWithoutDiscount += pizza.price * basketPos.count;
  }
  priceWithDiscount = parseFloat(priceWithDiscount.toFixed(2));
  return to_deliver ?
      { with_discount: priceWithDiscount + delivery_price, without_discount: priceWithoutDiscount + delivery_price } :
      { with_discount: priceWithDiscount, without_discount: priceWithoutDiscount };

}


function isDateBetween(dateToCheck, startDate, endDate) {
  return dateToCheck >= startDate && dateToCheck <= endDate;
}

const makeOrder = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  await session.startTransaction();
  try {
    const {email, id, role} = req.user;
    let { basket, order_date, order_notes, to_deliver, discount_id } = req.body; // basket: [{pizza_id: ObjectId, count: Number}, {pizza_id: ObjectId, count: Number}, ...]

    if (discount_id) {
      const the_discount = await Discount.findOne({_id: new ObjectId(discount_id)}, null, {session});

      if(!the_discount) {
        res.status(404);
        throw new Error("Discount not found");
      }
      const now = new Date();
      const available = isDateBetween(now, the_discount.start_date, the_discount.end_date);
      if (!available){
        throw new Error("Discount not available");
      }
      for (let basketPos of basket) {
        if (the_discount.pizza_ids.includes(basketPos.pizza_id)) {
          basketPos.discount = the_discount.value;
        }
        else {
          basketPos.discount = 0;
        }
      }

    } else {
      for (let basketPos of basket) {
        basketPos.discount = 0;
      }
    }
    const vars = await AdminVars.findOne(null, null, {session});
    const {with_discount, without_discount} = await calculateTotalPrice(basket, to_deliver, session.id, vars.delivery_price, res);
    if (basket.length === 0) {
      res.status(400);
      throw new Error("We do not accept empty orders");
    }
    const employee = await findEmployee(session.id);
    await checkPizzasAvailability(basket, res, session.id);
    const clientData = await Client.findOne({_id: id},null, {session});
    let order_;
    if (discount_id) {
      order_ = await Order.create([
        {
          client_id: id,
          employee_id: employee._id,
          pizzas: basket,
          client_address: clientData.address,
          order_notes,
          order_date,
          status: '0',
          to_deliver,
          total_price: {with_discount, without_discount, delivery_price: vars.delivery_price},
          discount_id
        }
      ], { session });
    } else {
      order_ = await Order.create([
        {
          client_id: id,
          employee_id: employee._id,
          pizzas: basket,
          client_address: clientData.address,
          order_notes,
          order_date,
          status: '0',
          total_price: {with_discount, without_discount, delivery_price: vars.delivery_price},
          to_deliver,
          discount_id: null
        }
      ], { session });
    }

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
      order_date,
      total_price: {with_discount, without_discount, delivery_price: vars.delivery_price},
      discount_id
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

const getOrderHistory = asyncHandler(async (req, res, next) => {
  try {
    const {email, id, role} = req.user;
    const {limit} = req.body;
    const id_ObjId = new ObjectId(id);
    const result = await Order.aggregate([
      {
        $match: {
          "client_id": id_ObjId  // Wprowadź odpowiedni client_id
        }
      },
      {
        $unwind: "$pizzas"
      },
      {
        $lookup: {
          from: "pizzas",
          localField: "pizzas.pizza_id",
          foreignField: "_id",
          as: "pizza_details"
        }
      },
      {
        $unwind: {
          path: "$pizza_details",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "ingredients",
          localField: "pizza_details.ingredients",
          foreignField: "_id",
          as: "ingredient_details"
        }
      },
      {
        $lookup: {
          from: "discounts",
          localField: "discount_id",
          foreignField: "_id",
          as: "discount_details"
        }
      },
      {
        $unwind: {
          path: "$discount_details",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "pizzas",
          localField: "discount_details.pizza_ids",
          foreignField: "_id",
          as: "discount_pizza_names"
        }
      },
      {
        $group: {
          _id: "$_id",
          client_id: {$first: "$client_id"},
          employee_id: {$first: "$employee_id"},
          client_address: {$first: "$client_address"},
          order_notes: {$first: "$order_notes"},
          order_date: {$first: "$order_date"},
          status: {$first: "$status"},
          to_deliver: {$first: "$to_deliver"},
          total_price: {$first: "$total_price"},
          pizzas: {
            $push: {
              pizza_id: "$pizza_details._id",
              pizza_name: "$pizza_details.name",
              count: "$pizzas.count",
              ingredients: "$ingredient_details.name"
            }
          },
          discount_details: {
            $first: {
              discount_name: "$discount_details.name",
              discount_value: "$discount_details.value",
              pizza_names: "$discount_pizza_names.name"
            }
          }
        }
      }
    ]);
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});


module.exports = { getAvailablePizzas, makeOrder, rateOrder, getOrderHistory };