import { database } from "./db.js"
import { DateTime } from "luxon"

const getCandles = async (symbol, interval) => {
	const { db, client } = database()
	const start = DateTime.now().minus({ days: 90 }).startOf("day")
	const candles = []
	await client.connect()
	let collection

	switch (interval) {
		case 1:
			collection = db.collection("kline_1ms")
			break
		case 3:
			collection = db.collection("kline_3ms")
			break
		case 5:
			collection = db.collection("kline_5ms")
			break
		case 15:
			collection = db.collection("kline_15ms")
			break
		case 60:
			collection = db.collection("kline_1hs")
			break
	}

	const pointer = collection.find({
		symbol: symbol,
		startTime: { $gte: start.ts },
	})

	await pointer.forEach(candle => candles.push(candle))

	return candles
}

export default getCandles
