const Customer = require('../models/Client');
const mongoose = require('mongoose');
const asyncHandler = require("express-async-handler");
const Ingredient = require("../models/Ingredient");
const Pizza = require("../models/Pizza");
const Worker = require("../models/Worker");
const Order = require("../models/Order");
const Client = require("../models/Client");
const Discount = require("../models/Discount");
const ObjectId = mongoose.Types.ObjectId;


const updateIngredientStatus = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  await session.startTransaction();
  try {
    let { id, new_status } = req.body;
    id = new ObjectId(id);
    const the_ingredient = await Ingredient.findOne({_id: id});
    if (!the_ingredient) {
      res.status(400);
      throw new Error("Ingredient doesn't exist");
    }
    await Ingredient.updateOne({_id: id}, {available: new_status}, { session });
    const pizzasWithIngredient = await Pizza.aggregate([
      { $match: { ingredients: id } },
    ], { session });

    for (const pizza of pizzasWithIngredient) {
      let allOtherIngredientsAvailable = true;
      if (new_status){
        const otherIngredients = pizza.ingredients.filter(ingredient_id => !ingredient_id.equals(id));

        allOtherIngredientsAvailable = await Ingredient.countDocuments(
            { _id: { $in: otherIngredients }, available: true },
            { session }
        ) === otherIngredients.length;
      }
      if (allOtherIngredientsAvailable) {
        await Pizza.updateOne(
            { _id: pizza._id },
            { $set: { available: new_status } },
            { session }
        );
      }
    }
    await session.commitTransaction();
    res.status(201).json({message: `${the_ingredient.name} status updated`});
  } catch(err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
});



async function findDeliverer(sessionId) {
  const session = await mongoose.startSession({_id: sessionId});

  const deliverers = await Worker.find({worker_type: "deliverer", status: "active"}, null, { session });

  if (deliverers.length === 0) {
    throw new Error("There are no deliverers available at the moment.");
  }
  const bestDeliverer = deliverers.reduce((best, current) => {
    if (current.current_orders.length < best.current_orders.length) {
      return current;
    } else {
      return best;
    }
  }, deliverers[0]);
  return bestDeliverer;
}



const changeOrderStatus = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  await session.startTransaction();
  try {
    const {new_status, order_id} = req.body;
    const orderId = new ObjectId(order_id);
    const order = await Order.findOne({_id: orderId}, null, {session});
    if (!order) {
      res.status(400);
      throw new Error("Order doesn't exist");
    }
    if (new_status === "2") {
      if (order.to_deliver) {
        const deliverer = await findDeliverer(session.id);
        if (deliverer) {
          await Order.updateOne({_id: orderId}, {status: new_status, deliverer_id: deliverer._id}, {session});
          await Worker.updateOne({_id: deliverer._id}, {$push: {current_orders: orderId}}, {session});
        }
      }
      else {
        await Order.updateOne({_id: orderId}, {status: new_status}, {session});
      }
    } else if (new_status === '-1') {
      await Order.updateOne({_id: orderId}, {status: new_status}, {session});
      await Worker.updateOne({_id: order.employee_id}, {
        $pull: {current_orders: orderId},
        $push: {orders_history: orderId}
      }, {session});
    } else if (new_status === '4') {
      await Order.updateOne({_id: orderId}, {status: new_status}, {session});
      await Client.updateOne({_id: order.client_id}, {$inc: {order_count: 1}}, {session});
      await Worker.updateMany({_id: {$in: [order.employee_id, order.deliverer_id]}},
          {$pull: {current_orders: orderId}, $push: {orders_history: orderId}}, {session});
      const the_order = await Order.findOne({_id: orderId}, {total_price: 1, discount_id: 1}, {session});
      console.log(11111, the_order);
      console.log(22222, the_order.total_price);
      console.log(33333, the_order.total_price.with_discount);
      let saved_amount = the_order.total_price.without_discount - the_order.total_price.with_discount;
      saved_amount = parseFloat(saved_amount.toFixed(2));
      if (saved_amount > 0){
        await Client.updateOne({_id: order.client_id}, {$inc: {discount_saved: saved_amount}}, {session});
      }
      if (the_order.discount_id) {
        await Discount.updateOne({ _id: the_order.discount_id }, { $inc: { used_count: 1 } }, {session});
      }

    } else if (new_status === '3.2') {
      await Order.updateOne({_id: orderId}, {status: new_status}, {session});
      await Client.updateOne({_id: order.client_id}, {$inc: {order_count: 1}}, {session});
      await Worker.updateMany({_id: {$in: [order.employee_id]}},
          {$pull: {current_orders: orderId}, $push: {orders_history: orderId}}, {session});
      const the_order = await Order.find({_id: orderId}, {total_price: 1, discount_id: 1}, {session});
      let saved_amount = the_order.total_price.without_discount - the_order.total_price.with_discount;
      saved_amount = parseFloat(saved_amount.toFixed(2));

      if (saved_amount > 0){
        await Client.updateOne({_id: order.client_id}, {$inc: {discount_saved: saved_amount}}, {session});
      }
      if (the_order.discount_id) {
        await Discount.updateOne({ _id: the_order.discount_id }, { $inc: { used_count: 1 } }, {session});
      }

    } else if (new_status === '3.1') {
      await Order.updateOne({_id: orderId}, {status: new_status}, {session});
    } else if (new_status === '-4') {
      await Order.updateOne({_id: orderId}, {status: new_status}, {session});
      await Worker.updateMany({_id: {$in: [order.employee_id, order.deliverer_id]}},
          {$pull: {current_orders: orderId}, $push: {orders_history: orderId}}, {session});
    } else if (new_status === '1') {
      await Order.updateOne({_id: orderId}, {status: new_status}, {session});
    }
    await session.commitTransaction();
    res.status(201).json({message: `Order status set to ${new_status}`});
  }
  catch(err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
});


module.exports = {updateIngredientStatus, changeOrderStatus};