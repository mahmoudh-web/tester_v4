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

// get symbols
const instruments = await getInstruments()

// set timeframes
const intervals = [1, 3, 5, 15]

const macdSettings = createMacd()
const psarSettings = createPsar()
const bollingerSettings = createBollinger()

const macdTests = instruments.length * intervals.length * macdSettings.length
const psarTests = macdTests * psarSettings.length * bollingerSettings.length
// loop through tests
let x = 1

for await (let instrument of instruments) {
	for await (let interval of intervals) {
		const candles = await getCandles(instrument, interval)

		// run macd
		for await (let macdSetting of macdSettings) {
			console.log(
				`Running macd test ${x.toLocaleString()} of ${psarTests.toLocaleString()}: ${instrument} ${interval}`
			)
			x++
			const test = await macdPromise(
				candles,
				macdSetting,
				instrument,
				interval
			)

			if (test) {
				const storeMacd = await storeResults(test, "v4_results")
				// console.log("Saved Results")
			}
		}

		// run psar
		for await (let macdSetting of macdSettings) {
			for await (let psarSetting of psarSettings) {
				for await (let bollingerSetting of bollingerSettings) {
					console.log(
						`Running psar test ${x.toLocaleString()} of ${psarTests.toLocaleString()}: ${instrument} ${interval}`
					)
					x++
					const settings = {
						psar: psarSetting,
						macd: macdSetting,
						bollinger: bollingerSetting,
					}
					const testPsar = await psarPromise(
						candles,
						settings,
						instrument,
						interval
					)

					if (testPsar) {
						const storePsar = await storeResults(
							testPsar,
							"v4_results"
						)
						// console.log("Saved Results")
					}
				}
			}
		}
	}
}

console.log("FINISHED")
