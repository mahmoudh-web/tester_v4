import * as indicators from "./indicators.js"
import { addIndicatorData } from "./addIndicatorData.js"
import { buyAmount, sellAmount } from "./trade.js"
import { storeResults } from "./results.js"

const macdPromise = async (candles, settings, instrument, interval) => {
	const test = new Promise((resolve, reject) => {
		const macd = indicators.macd(candles, settings)

		const candleData = addIndicatorData(
			candles,
			{ name: "macd_line", data: macd.macdLine },
			{ name: "macd_signal", data: macd.macdSignal },
			{ name: "macd_histogram", data: macd.histogram }
		)

		let usdt_balance = 100
		let token_balance = 0
		let losing = 0
		let winning = 0

		candleData.forEach(candle => {
			if (token_balance > 0) {
				// look for sell
				if (sell(candle)) {
					const amount = sellAmount(candle.open, token_balance)
					usdt_balance += amount
					token_balance = 0
					if (amount <= 10) losing++
					else if (amount > 10) winning++
				}
			} else {
				// look for buy
				if (buy(candle)) {
					usdt_balance -= 10
					const amount = buyAmount(candle.open, 10)
					token_balance += amount
				}
			}
		})

		const total = winning + losing

		resolve({
			type: "macd",
			symbol: instrument,
			interval: interval,
			usdt_balance,
			token_balance,
			winning_trades: winning,
			losing_trades: losing,
			win_rate: Number(((winning / total) * 100).toFixed(2)),
			lose_rate: Number(((losing / total) * 100).toFixed(2)),
			profit: usdt_balance - 100,
			macd_short: settings.short,
			macd_long: settings.long,
			macd_signal: settings.signal,
			psar_increment: 0,
			psar_max: 0,
		})
	}).then(res => {
		if (res.profit > 0) {
			return res
		} else {
			return false
		}
	})

	return test
}

function buy(candle) {
	const { macd_line, macd_signal, macd_histogram, low } = candle
	return macd_line < 0 && macd_signal < 0 && macd_histogram > 0 //&& psar < low
}

function sell(candle) {
	const { macd_line, macd_signal, macd_histogram, high } = candle
	return macd_line > 0 && macd_signal > 0 && macd_histogram < 0 //&& psar > high
}

export { macdPromise }
