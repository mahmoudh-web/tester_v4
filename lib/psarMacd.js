import * as indicators from "./indicators.js"
import { addIndicatorData } from "./addIndicatorData.js"
import { buyAmount, sellAmount } from "./trade.js"
import { storeResults } from "./results.js"

const psar = async (candles, settings, instrument, interval) => {
	const psar = indicators.psar(candles, settings.psar)
	const macd = indicators.macd(candles, settings.macd)

	const candleData = addIndicatorData(
		candles,
		{ name: "macd_line", data: macd.macdLine },
		{ name: "macd_signal", data: macd.macdSignal },
		{ name: "macd_histogram", data: macd.histogram },
		{ name: "psar", data: psar }
	)

	let usdt_balance = 100
	let token_balance = 0
	let losing = 0
	let winning = 0
	const transactions = []

	for (let candle of candleData) {
		if (token_balance > 0) {
			// look for sell
			if (sell(candle)) {
				// console.log("sell")
				const amount = sellAmount(candle.open, token_balance)
				usdt_balance += amount
				token_balance = 0
				if (amount <= 10) losing++
				else if (amount > 10) winning++
			}
		} else {
			// look for buy
			if (buy(candle)) {
				// console.log("buy")
				usdt_balance -= 10
				const amount = buyAmount(candle.open, 10)
				token_balance += amount
			}
		}
	}

	const total = winning + losing
	// console.log(`${instrument} Profit: ${usdt_balance - 100}`)

	const results = {
		type: "psar",
		symbol: instrument,
		interval: interval,
		usdt_balance,
		token_balance,
		winning_trades: winning,
		losing_trades: losing,
		win_rate: Number(((winning / total) * 100).toFixed(2)),
		lose_rate: Number(((losing / total) * 100).toFixed(2)),
		profit: usdt_balance - 100,
		settings: settings,
	}

	await storeResults(results, "v4_results")

	return true
}

function buy(candle) {
	const { macd_line, macd_signal, macd_histogram, low, open } = candle
	// console.log(open, bollinger_lower)
	// return open < bollinger_lower && psar < low
	return macd_line < 0 && macd_signal < 0 && macd_histogram > 0 && psar < low
}

function sell(candle) {
	const { macd_line, macd_signal, macd_histogram, high } = candle
	return macd_line > 0 && macd_signal > 0 && macd_histogram < 0 && psar > high
}

export default psar
