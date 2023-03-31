import { database } from "./lib/db.js"
import getInstruments from "./lib/getInstruments.js"

// get instruments
const { client, db } = database()

const instruments = await getInstruments()

const collection = db.collection("v4_results")
await client.connect()

// get results for each instrument
for await (let instrument of instruments) {
	const pointer = collection
		.find({ instrument: instrument })
		.sort({ profit: -1 })
		.limit(1)

	const results = []
	await pointer.forEach(res => results.push(res))
	if (results.length) {
		console.log(`${instrument}: $${results[0].profit.toFixed(2)}`)
		// console.log(JSON.stringify(results[0].fast_macd, null, 2))
		// console.log(JSON.stringify(results[0].slow_macd, null, 2))
		// console.log(JSON.stringify(results[0].stoch, null, 2))
	}
}

await client.close()
