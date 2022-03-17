const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  price: Number,
});

const Tour = mongoose.model('Tour', tourSchema); //uppercase model names
module.exports = Tour;
