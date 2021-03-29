"use strict";
/*jshint node: true */

var mongoose = require('mongoose');

var recordSchema = new mongoose.Schema({
    date_time: {type: Date, default: Date.now},
    file_name: String,
    user_name: String,
    activity_type: String,
});

var Record = mongoose.model('Record', recordSchema);

module.exports = Record;