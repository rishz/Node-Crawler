const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const URLSchema = new Schema({
 url: {
 	type: String,
    required: true
 },
 count: {
 	type: Number,
 	required: true,
 	Default: 1
 },
 params: {
    type: [String],
    required: true,
    default: []
 }
});

module.exports =  mongoose.model('URL', URLSchema);