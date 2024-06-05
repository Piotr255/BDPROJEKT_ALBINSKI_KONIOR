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
    const pizzas = await Pizza.aggregate([
      {
        $match: {available: true}
      },
      {
        $lookup: {
          from: "ingredients",
          localField: "ingredients",
          foreignField: "_id",
          as: "ingredient_details"
        }
      },
      {
        $unwind: "$ingredient_details"
      },
      {
        $group: {
          _id: "$_id",
          name: {$first: "$name"},
          price: {$first: "$price"},
          menu_number: {$first: "$menu_number"},
          grades: {$first: "$grades"},
          available: {$first: "$available"},
          ingredients: {
            $push: {
              name: "$ingredient_details.name",
              vegan: "$ingredient_details.vegan",
              vegetarian: "$ingredient_details.vegetarian"
            }
          }
        }
      },
      {
        $addFields: {
          average_grade: {
            $cond: {
              if: { $eq: ["$grades.grade_count", 0] },
              then: 0,
              else: { $round: [{ $divide: ["$grades.points_sum", "$grades.grade_count"] }, 2] }
            }
          }
        }
      },
      {
        $sort: {average_grade: -1}
      }
    ]);
    res.status(200).json(pizzas);
  } catch (err) {
    next(err);
  }
});

async function checkPizzasAvailability(basket, res, sessionId) {
  const session = await mongoose.startSession({_id: sessionId});
  const pizzaIds = basket.map(item => item.pizza_id);
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

function calculateTotalPrice(basket, to_deliver, delivery_price) {
  let priceWithDiscount = 0;
  let priceWithoutDiscount = 0;
  for (let basketPos of basket) {
    priceWithDiscount += basketPos.current_price * basketPos.count * (1-basketPos.discount);
    priceWithoutDiscount += basketPos.current_price * basketPos.count;
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
      const available = isDateBetween(new Date(order_date), the_discount.start_date, the_discount.end_date);
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
    const pizzas = await Pizza.find({_id : {$in: basket.map(item => item.pizza_id)}}, null, {session});
    for (let basketPos of basket) {
      let pizza = pizzas.find((item) => item._id.equals(basketPos.pizza_id));
      basketPos.current_price = pizza.price;
    }
    const vars = await AdminVars.findOne(null, null, {session});
    const {with_discount, without_discount} = calculateTotalPrice(basket, to_deliver, vars.delivery_price);
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
          total_price: {with_discount, without_discount, delivery_price: to_deliver ? vars.delivery_price : 0},
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
          total_price: {with_discount, without_discount, delivery_price: to_deliver ? vars.delivery_price : 0},
          to_deliver,
          discount_id: null
        }
      ], { session });
    }

    const order = order_[0];
    await Worker.updateOne({_id: employee._id}, {$push: {current_orders: order.id}}, {session});
    await Client.updateOne({_id: id}, {$push: {current_orders: order.id}}, {session});
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
      total_price: {with_discount, without_discount, delivery_price: to_deliver ? vars.delivery_price : 0},
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
    let { order_id, grade_food, grade_delivery, comment } = req.body;
    if (!grade_food) {
      res.status(400);
      throw new Error("Please fill in all fields");
    }
    const order = await Order.findOne({_id: order_id});
    if (order.to_deliver && !grade_delivery) {
      res.status(400);
      throw new Error("Please fill in all fields");
    }
    if (!order) {
      res.status(400);
      throw new Error("Order doesn't exist");
    }
    if (!order.client_id.equals(new ObjectId(id))) {
      res.status(400);
      throw new Error("Order is not yours");
    }
    if (order.status !== '3.2' && order.status !== '4') {
      res.status(400);
      throw new Error("Invalid order status for rating");
    }
    if (!order.to_deliver) {
      grade_delivery = null;
    }
    const order_id_ObjId = new ObjectId(order_id);
    await Order.updateOne({ _id: order_id_ObjId }, {$set: {grade:
        {
          grade_food,
          grade_delivery,
          comment
        }}}, {runValidators: true});
    res.status(200).json({
      message: "Order has been rated",
      grade_food,
      grade_delivery,
      comment
    });
  } catch (err) {
    next(err);
  }
});

const getOrderHistory = asyncHandler(async (req, res, next) => {
  try {
    const {email, id, role} = req.user;
    let {limit, date_from, date_to} = req.body;
    if(!limit) {
      throw new Error("Please provide a limit");
    }
    if( !date_from ) {
      date_from = new Date(0);
    }
    if( !date_to ) {
      date_to = new Date();
    }
    const id_ObjId = new ObjectId(id);
    const the_client = await Client.findOne({_id: id_ObjId});
    const result = await Order.aggregate([
      {
        $match: {
          "client_id": id_ObjId,
          "order_date": {
            $gte: date_from,
            $lte: date_to
          }
        }
      },
      {
        $sort: { order_date: -1 }
      },
      {
        $limit: limit
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
        $lookup: {
          from: "workers",
          localField: "employee_id",
          foreignField: "_id",
          as: "employee_details"
        }
      },
      {
        $unwind: {
          path: "$employee_details",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "workers",
          localField: "deliverer_id",
          foreignField: "_id",
          as: "deliverer_details"
        }
      },
      {
        $unwind: {
          path: "$deliverer_details",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "client_address._id": 0
        }
      },
      {
        $group: {
          _id: "$_id",
          employee_name: {$first: "$employee_details.name"},
          deliverer_name: {$first: "$deliverer_details.name"},
          client_address: {$first: "$client_address"},
          order_notes: {$first: "$order_notes"},
          order_date: {$first: "$order_date"},
          status: {$first: "$status"},
          to_deliver: {$first: "$to_deliver"},
          total_price: {$first: "$total_price"},
          pizzas: {
            $push: {
              pizza_price: "$pizzas.price",
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
    res.status(200).json({
      client_name: the_client.name,
      result,
      date_from,
      date_to
    });
  } catch (error) {
    next(error);
  }
});

const getMostlyOftenEatenPizzas = asyncHandler(async (req, res) => {
  const { date_from, date_to, min_stars } = req.body;
});

const ratePizza = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  await session.startTransaction();
  try {
    const {email, id, role} = req.user;
    const {pizza_id, stars} = req.body;
    const id_ObjId = new ObjectId(id);
    const pizza_id_ObjId = new ObjectId(pizza_id);
    const existingOrderWithThisPizza = await Order.findOne({
      client_id: id_ObjId,
      status: {$in: ['3.2', '4']},
      "pizzas.pizza_id": pizza_id_ObjId
    }, null, {session});
    if (!existingOrderWithThisPizza) {
      res.status(400);
      throw new Error("You haven't yet finished an order with this pizza");
    }
    const existingGrade = await Client.findOne({_id: id_ObjId, "grades.pizza_id": pizza_id_ObjId});
    if (existingGrade) {
      const currentStars = existingGrade.grades.find((item) => item.pizza_id = pizza_id_ObjId).stars;
      await Client.updateOne({_id: id_ObjId}, {$pull: {grades: {pizza_id: pizza_id_ObjId}}}, {session});
      await Pizza.updateOne({_id: pizza_id_ObjId}, {$inc: {"grades.points_sum": -currentStars, "grades.grade_count": -1}}, {session});
    }
    await Pizza.updateOne({_id: pizza_id_ObjId}, {$inc: {"grades.points_sum": stars, "grades.grade_count": 1}}, {session});
    await Client.updateOne({_id: id_ObjId}, {$push: {grades: {pizza_id: pizza_id_ObjId, stars}}}, {runValidators: true, session});
    await session.commitTransaction();
    res.status(200).json({
      message: `Pizza rated, stars: ${stars}`
    })
  } catch(error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
});


module.exports = { getAvailablePizzas, makeOrder, rateOrder, getOrderHistory, ratePizza };