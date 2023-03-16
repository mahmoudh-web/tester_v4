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
import {
	createBollinger,
	createMacd,
	createPsar,
} from "./lib/createSettings.js"
import getCandles from "./lib/getCandles.js"
dotenv.config()

import getInstruments from "./lib/getInstruments.js"
import { macdPromise } from "./lib/macd.js"
import { psarPromise } from "./lib/psarMacd.js"
import { storeResults } from "./lib/results.js"
import macdDifferent from "./tests/macdDifferent.js"
import macdSame from "./tests/macdSame.js"

// type of test to run
const testType = process.env.TYPE
// get symbols
const instruments = await getInstruments()

// set timeframes
const intervals = [1, 3, 5, 15]

const macdSettings = createMacd()
console.log(macdSettings.length)
const macdTests =
	instruments.length *
	intervals.length *
	macdSettings.length *
	macdSettings.length
// loop through tests
let x = 1

for await (let instrument of instruments) {
	for await (let interval of intervals) {
		const candles = await getCandles(instrument, interval)

		for await (let macdSetting of macdSettings) {
			for await (let macdSettingTwo of macdSettings) {
				// run macd
				console.log(
					`Running macd test ${x.toLocaleString()} of ${macdTests.toLocaleString()}: ${instrument} ${interval}`
				)
				const macdOneSettings = {
					short: macdSetting.short,
					long: macdSetting.long,
					signal: macdSetting.signal,
				}
				const macdTwoSettings = {
					short: macdSettingTwo.short,
					long: macdSettingTwo.long,
					signal: macdSettingTwo.signal,
				}

				const macdSingle = await macdSame(candles, macdOneSettings)
				const macdDifferentTest = await macdDifferent(
					candles,
					macdOneSettings,
					macdTwoSettings
				)

				if (macdSingle.profit > 0 || macdDifferentTest.profit > 0) {
					const saveResults = await storeResults(
						{
							same: macdSingle,
							different: macdDifferentTest,
						},
						"v4_results"
					)
				}
				x++
			}
		}
	}
}

console.log("FINISHED")
