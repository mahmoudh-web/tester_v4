/**
 * get symbols
 *      get from instruments table (USDT quote, spot trading allowed)
 * set timeframes
 *      1m, 3m, 5m, 15m, 1h
 * set strategy
 *      1. in: macd line & signal < 0 && macd histogram > 0, out: opposite
 *      2. in: macd line & signal < 0 && macd histogram > 0 && psar below low, out: opposite
 * test all possiilties
 *      loop through different settings for macd and psar
 * save results
 *       each result needs to include symbol, interval and indicator settings
 */

import * as dotenv from "dotenv"
dotenv.config()

import { database } from "./lib/db.js"
import { createMacd, createRsi, createStoch } from "./lib/createSettings.js"
import getCandles from "./lib/getCandles.js"
import { storeResults } from "./lib/results.js"
import macdStochScalp from "./tests/macdStochScalp.js"
import macdStochRsi from "./tests/macdStochRsi.js"

// get test to run
const { client, db } = database()
await client.connect()

const tests = db.collection("tests")
const test = await tests.findOne({ active: false })

if (!test) process.exit(0)

const id = test._id
await tests.updateOne({ _id: id }, { $set: { active: true } })

// // loop through tests
let x = 1

// get settings variables for tests
const macds = createMacd(2, 25, 10, 30, 2, 25)
const stochs = createStoch(20, 12, 20)
const rsis = createRsi(40)

console.log(macds.length, stochs.length, rsis.length)
console.log(
	(macds.length * stochs.length * rsis.length).toLocaleString("en-GB")
)
// process.exit(0)
// get instrument, interval and candles
const { instrument, interval } = test
// const instrument = "ACHUSDT"
// const interval = 1

const candles = await getCandles(instrument, interval)
if (!candles.length) {
	console.log(`${instrument} ${interval}: no historical data`)
	process.exit(0)
}
console.log(`Running tests for ${instrument} ${interval}`)

for await (let macd of macds) {
	for await (let stoch of stochs) {
		for await (let rsi of rsis) {
			const settings = {
				macd,
				stoch,
				rsi,
			}
			// run test
			const test = await macdStochRsi(candles, settings)
			// console.log(x.toLocaleString("en-GB"))
			if (test.profit > 0) {
				const {
					usdt_balance,
					token_balance,
					winning_trades,
					losing_trades,
					win_rate,
					lose_rate,
					profit,
				} = test

				await storeResults(
					{
						instrument,
						interval,
						usdt_balance,
						token_balance,
						winning_trades,
						losing_trades,
						win_rate,
						lose_rate,
						profit,
						macd,
						stoch,
						rsi,
					},
					"v4_results"
				)
			}

			if (x % 500000 === 0) {
				console.log(
					`Finished test ${x.toLocaleString()} for ${instrument} ${interval}, profit: ${
						test.profit
					}`
				)
			}
			x++
		}
	}
}

// for await (let fast_macd of fast_macds) {
// 	for await (let slow_macd of slow_macds) {
// 		for await (let stoch of stochs) {
// 			if (fast_macd.long < slow_macd.long) {
// 				const settings = {
// 					fast_macd,
// 					slow_macd,
// 					stoch,
// 				}
// 				// run test
// 				const test = await macdStochScalp(candles, settings)
// 				// console.log(test)
// 				if (test.profit > 0) {
// 					const {
// 						usdt_balance,
// 						token_balance,
// 						winning_trades,
// 						losing_trades,
// 						win_rate,
// 						lose_rate,
// 						profit,
// 					} = test

// 					await storeResults(
// 						{
// 							instrument,
// 							interval,
// 							usdt_balance,
// 							token_balance,
// 							winning_trades,
// 							losing_trades,
// 							win_rate,
// 							lose_rate,
// 							profit,
// 							fast_macd,
// 							slow_macd,
// 							stoch,
// 						},
// 						"v4_results"
// 					)
// 				}

// 				if (x % 500000 === 0) {
// 					console.log(
// 						`Finished test ${x.toLocaleString()} for ${instrument} ${interval}, profit: ${
// 							test.profit
// 						}`
// 					)
// 				}
// 				x++
// 				// allTests.push(settings)
// 			}
// 		}
// 	}
// }

console.log(`FINISHED ${instrument} ${interval}`)
await tests.updateOne({ _id: id }, { $set: { complete: true } })

await client.close()
process.exit(0)
