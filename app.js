const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const AdminRouter = require('./server/routers/AdminRouter.js');
const AccountRouter = require('./server/routers/AccountRouter.js');
const ClientRouter = require('./server/routers/ClientRouter.js');
const EmployeeRouter = require('./server/routers/EmployeeRouter');
const app = express();

mongoose.connect('mongodb://localhost:27017/pizzeria-app');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/admin", AdminRouter);
app.use("/account", AccountRouter);
app.use("/client", ClientRouter);
app.use("/employee", EmployeeRouter);

const port = 9000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});