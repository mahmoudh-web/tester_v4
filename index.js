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
import { createMacd, createStoch } from "./lib/createSettings.js"
import getCandles from "./lib/getCandles.js"
import { storeResults } from "./lib/results.js"
import macdStochScalp from "./tests/macdStochScalp.js"

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
const fast_macds = createMacd(5, 20, 10, 30, 5, 20)
const slow_macds = createMacd(50, 75, 100, 150, 50, 75)
const stochs = createStoch(12, 8, 8)

// get instrument, interval and candles
const { instrument, interval } = test
// const instrument = "ACHUSDT"
// const interval = 1

const candles = await getCandles(instrument, interval)
console.log(`Running tests for ${instrument} ${interval}`)

for await (let fast_macd of fast_macds) {
	for await (let slow_macd of slow_macds) {
		for await (let stoch of stochs) {
			if (fast_macd.long < slow_macd.long) {
				const settings = {
					fast_macd,
					slow_macd,
					stoch,
				}
				// run test
				const test = await macdStochScalp(candles, settings)
				// console.log(test)
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
							fast_macd,
							slow_macd,
							stoch,
						},
						"v4_results"
					)
				}

				if (x % 100000 === 0) {
					console.log(
						`Finished test ${x.toLocaleString()} for ${instrument} ${interval}, profit: ${
							test.profit
						}`
					)
				}
				x++
				// allTests.push(settings)
			}
		}
	}
}

// for await (let macdSetting of macdSettings) {
// 	for await (let macdSettingTwo of macdSettings) {
// 		const macdOneSettings = {
// 			short: macdSetting.short,
// 			long: macdSetting.long,
// 			signal: macdSetting.signal,
// 		}
// 		const macdTwoSettings = {
// 			short: macdSettingTwo.short,
// 			long: macdSettingTwo.long,
// 			signal: macdSettingTwo.signal,
// 		}

// 		const macdSingle = await macdSame(candles, macdOneSettings)
// 		const macdDifferentTest = await macdDifferent(
// 			candles,
// 			macdOneSettings,
// 			macdTwoSettings
// 		)

// 		if (macdSingle.profit > 0 || macdDifferentTest.profit > 0) {
// 			const saveResults = await storeResults(
// 				{
// 					instrument,
// 					interval,
// 					best_strategy:
// 						macdSingle.profit > macdDifferentTest.profit
// 							? "Same"
// 							: "Different",
// 					best_profit:
// 						macdSingle.profit > macdDifferentTest.profit
// 							? macdSingle.profit
// 							: macdDifferentTest.profit,
// 					same: macdSingle,
// 					different: macdDifferentTest,
// 				},
// 				"v4_results"
// 			)
// 		}

// 		if (x % 1000 === 0) {
// 			console.log(
// 				`Completed ${x.toLocaleString()} tests of ${macdTests.toLocaleString()} for ${instrument} ${interval}m`
// 			)
// 		}

// 		x++
// 	}
// }

console.log(`FINISHED ${instrument} ${interval}`)
await tests.updateOne({ _id: id }, { $set: { complete: true } })

await client.close()
process.exit(0)
