const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/toursRoute');
const userRouter = require('./routes/usersRoute');

const app = express();

/// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public/`));

/// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
