const mongoose = require('mongoose');

var showSchema = new mongoose.Schema({
    title: String,
    rating: String,
    ratingLevel: String,
    ratingDescription: String,
    releaseYear: String,
    userRatingScore: String,
    size: String
});

var Show = mongoose.model('Show', showSchema);

module.exports = Show;