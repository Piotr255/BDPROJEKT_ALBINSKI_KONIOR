const express = require('express');
const cors = require('cors');
const AdminRouter = require('./server/routers/AdminRouter.js');
const ClientRouter = require('./server/routers/ClientRouter.js');
const EmployeeRouter = require('./server/routers/EmployeeRouter');
const UserRouter = require('./server/routers/UserRouter');
const app = express();
const port = process.env.PORT || 9000;
const errorHandler = require("./server/middleware/errorHandler");
const dotenv = require('dotenv').config();
const connectDb = require('./server/config/db.Connection');
connectDb();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/admin", AdminRouter);
app.use("/client", ClientRouter);
app.use("/employee", EmployeeRouter);
app.use("/user", UserRouter);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});