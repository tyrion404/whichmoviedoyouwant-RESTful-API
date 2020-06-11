const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const express = require('express');
const config = require('config');
const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

const error = require('./middleware/error');

// creating app
const app = express();

// configuring logger
winston.add(
  new winston.transports.Console({ colorize: true, prettyPrint: true }),
  new winston.transports.MongoDB({
    db: config.get('MONGO_URI'),
  })
);

// logging uncaughtExceptions and unhandledRejections
process.on('uncaughtException', (err) => {
  winston.error(err.message);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  winston.error(err.message);
  process.exit(1);
});

// connect to the database
mongoose
  .connect(config.get('MONGO_URI'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => winston.info(`Connected to ${config.get('MONGO_URI')}.`))
  .catch((err) => winston.error(err));

// processing req
app.use(express.json());

// route handlers
app.use('/api/genres', require('./routes/genres'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/rentals', require('./routes/rentals'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// applying middleware error
app.use(error);

// port and listening
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  winston.info(`Listening on PORT ${PORT}...`)
);

module.exports = server;
