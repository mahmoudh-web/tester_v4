import { database } from "./db.js"

const getInstruments = async () => {
	const { db, client } = database()

	const instruments = []
	await client.connect()
	const collection = db.collection("instruments")
	const pointer = collection
		.find({
			quoteAsset: "USDT",
			status: "TRADING",
			isSpotTradingAllowed: true,
		})
		.sort({ symbol: 1 })

	await pointer.forEach(instrument => instruments.push(instrument.symbol))

	await client.close()
	return instruments
}

export default getInstruments
