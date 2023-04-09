import { sortBy, max } from "lodash-es"
import { database } from "./lib/db.js"
import getInstruments from "./lib/getInstruments.js"

// get instruments
const { client, db } = database()

const instruments = await getInstruments()

const collection = db.collection("v4_results")
await client.connect()

const pointer = collection.find({})
// .sort({ profit: -1 })
// .limit(1)

const results = []
await pointer.forEach(res => results.push(res))

// get results for each instrument
let good = 0
const goodTokens = []
let profit = 0
for await (let instrument of instruments) {
	const data = results.filter(r => r.instrument === instrument)
	if (data.length) {
		const profits = data.map(d => d.profit)
		const highest = max(profits)
		if (highest >= 10) {
			good++
			profit += highest
			goodTokens.push(instrument)
		}
		console.log(`${instrument}: $${highest.toFixed(2)}`)
	}
	// console.log(JSON.stringify(results[0].fast_macd, null, 2))
	// console.log(JSON.stringify(results[0].slow_macd, null, 2))
	// console.log(JSON.stringify(results[0].stoch, null, 2))
}

console.log(`\nProfit above $10: ${good}`)
console.log(
	`\nTotal Profit: $${profit.toFixed(2)}, Capital Needed: $${good * 15}`
)
console.log(`Return: ${((profit / (good * 15)) * 100).toFixed(2)}%`)
console.log(goodTokens)

await client.close()
