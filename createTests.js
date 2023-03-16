import getInstruments from "./lib/getInstruments.js"
import { database } from "./lib/db.js"

const { client, db } = database()

const instruments = await getInstruments()
const intervals = [1, 3, 5, 15]

const settings = []
instruments.forEach(instrument => {
	intervals.forEach(interval => {
		const test = {
			instrument,
			interval,
			active: false,
			complete: false,
		}

		settings.push(test)
	})
})

await client.connect()
const collection = db.collection("tests")
const existing = await collection.countDocuments({})

if (existing > 0) {
	await collection.deleteMany({})
}
console.log(existing)
await collection.insertMany(settings)

await client.close()
