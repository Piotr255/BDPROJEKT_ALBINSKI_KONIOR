const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Pizza = require('./server/models/Pizza');
const app = express();

mongoose.connect('mongodb://localhost:27017/pizzeria-app');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/pizzas', async (req, res) => {
  try {
    const products = await Pizza.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({error: 'An error occurred while fetching products' });
  }
})

app.post('/add_pizza', async (req, res) => {
  try {
    console.log(req.body);
    const product = new Pizza({
      name: req.body.name,
      ingredients: req.body.ingredients,
      price: req.body.price
    });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.log(err);
    res.status(500).json({error: 'An error occurred while adding product'});
  }
})

const port = 9000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});