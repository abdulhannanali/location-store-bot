const TelegramBot = require("node-telegram-bot-api")
const mongoose = require("mongoose")

const Location = require("./models/locationModel")

var ENV = process.env.NODE_ENV || "development"

if (ENV == "development") {
	require("./config")

	const BOT_TOKEN = process.env["BOT_TOKEN"]

	var bot = new TelegramBot(BOT_TOKEN, {
		polling: true
	})
}
else if (ENV == "production") {

}

const MONGODB_CONNECTION_URI = process.env["MONGODB_CONNECTION_URI"] || "mongodb://localhost/locationdb"

mongoose.connect(MONGODB_CONNECTION_URI, function (error) {
	if (!error) {
		console.log("Connection with MONGODB Established")
	}
	else {
		console.error(error)
		process.exit(1)
	}
})

bot.on("location", (msg) => {
	if (msg.location) {
		var location = msg.location 
	}
	else {
		throw new Error("Location not found!")
	}

	setLocation(msg, location.latitude, location.longitude, false)
})

bot.onText(/\/set\s+(.*)/, (msg, match) => {
	var loc = match[1].split("")

	latitude = parseInt(loc[0])
	longitude = parseInt(loc[1])

	if (!latitude || !longitude) {
		bot.sendMessage(msg.chat.id, "Invalid format! /help for assistance\n Or just send us the location")
	}


})

function setLocation(msg, latitude, longitude, safe, cb) {
	var id = msg.from.id

	var location = {
		_id: msg.from.id,
		latitude: latitude,
		longitude: longitude,
		safe: safe || false
	}

	Location.findByIdAndUpdate(id, location, {new: true}, function (error, model) {
		if (cb) {
			cb.apply(arguments)
		}

		if (error) {
			console.error(error)
			internalError(msg)
		}
		else if (!error && model) {
			bot.sendMessage(id, "location has been updated")
		}
		else {
			var loc = new Location(location)
			loc.save(function (error, model) {
				if (error) {
					internalError()
				}
				else {
					bot.sendMessage(id, "location has been set for you :) ")					
				}
			})
		}

	})
}

bot.onText(/\/location\s*/, (msg, match) => {
	Location.findOne({
		_id: msg.from.id
	}, function (error, location) {
		if (error) {
			internalError(msg)
		}
		else if (!location) {
			bot.sendMessage(msg.chat.id, "Sorry! Location not found! :( ")
		}
		else {
			console.log(location)
			bot.sendLocation(msg.chat.id, location.latitude, location.longitude)
				.then(() => {
					bot.sendMessage(msg.chat.id, "Last Updated: " + location.updatedAt)
				})
		}
	})
})

function internalError(msg) {
	bot.sendMessage(msg.chat.id, "An internal error occured! 500!")
}