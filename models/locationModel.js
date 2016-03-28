const mongoose = require("mongoose")

var locationSchema = mongoose.Schema({
	_id: Number,
	latitude: Number,
	longitude: Number,
	safe: Boolean,

}, {
	timestamps: {
		createdAt: "createdAt",
		updatedAt: "updatedAt"
	}
})

module.exports = mongoose.model("location", locationSchema)