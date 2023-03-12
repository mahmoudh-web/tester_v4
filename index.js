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
import { createMacd, createPsar } from "./lib/createSettings.js"
import getCandles from "./lib/getCandles.js"
dotenv.config()

import getInstruments from "./lib/getInstruments.js"
import macd from "./lib/macd.js"
import psar from "./lib/psarMacd.js"

// get symbols
const instruments = await getInstruments()

// set timeframes
const intervals = [1, 3, 5, 15, 60]

// loop through tests
let x = 1
for await (let instrument of instruments) {
	for await (let interval of intervals) {
		// get candles
		const candles = await getCandles(instrument, interval)

		// console.log(
		// 	`Test #${x.toLocaleString()} - Instrument: ${instrument}, Interval: ${interval}, Candles: ${
		// 		candles.length
		// 	}`
		// )
		x++

		const macdSettings = createMacd()
		const psarSettings = createPsar()

		// run macd only
		let macdCount = 1
		for await (let setting of macdSettings) {
			// console.log(
			// 	`Carrying out macd test ${macdCount.toLocaleString()} of ${macdSettings.length.toLocaleString()}`
			// )
			macdCount++
			const results = await macd(candles, setting, instrument, interval)
		}
		console.log(`Finished macd tests for ${instrument} ${interval}`)

		// run macd & psar
		let psarCount = 1
		for await (let psarSetting of psarSettings) {
			for await (let macdSetting of macdSettings) {
				// console.log(
				// 	`Carrying out psar test ${psarCount.toLocaleString()} of ${(
				// 		macdSettings.length * psarSettings.length
				// 	).toLocaleString()}`
				// )
				psarCount++
				const testSettings = {
					psar: psarSetting,
					macd: macdSetting,
				}

				const results = await psar(
					candles,
					testSettings,
					instrument,
					interval
				)
			}
		}
		console.log(`Finished psar tests for ${instrument} ${interval}`)
	}
}
