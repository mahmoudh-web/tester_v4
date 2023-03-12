import * as indicators from "./indicators.js"
import { addIndicatorData } from "./addIndicatorData.js"
import { buyAmount, sellAmount } from "./trade.js"
import { storeResults } from "./results.js"

const psarPromise = async (candles, settings, instrument, interval) => {
	const test = new Promise((resolve, reject) => {
		const psar = indicators.psar(candles, settings.psar)
		const macd = indicators.macd(candles, settings.macd)
		const bollinger = indicators.bollinger(candles, settings.bollinger)

		const candleData = addIndicatorData(
			candles,
			{ name: "macd_line", data: macd.macdLine },
			{ name: "macd_signal", data: macd.macdSignal },
			{ name: "macd_histogram", data: macd.histogram },
			{ name: "psar", data: psar },
			{ name: "bollinger_lower", data: bollinger.lower },
			{ name: "bollinger_middle", data: bollinger.middle },
			{ name: "bollinger_upper", data: bollinger.upper }
		)

		let usdt_balance = 100
		let token_balance = 0
		let losing = 0
		let winning = 0

		for (let candle of candleData) {
			if (token_balance > 0) {
				// look for sell
				if (sell(candle)) {
					// console.log("sell")
					const amount = sellAmount(candle.open, token_balance)
					usdt_balance += amount
					token_balance = 0
					// console.log(usdt_balance, token_balance)
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
					// console.log(usdt_balance, token_balance)
				}
			}
		}

		const total = winning + losing

		resolve({
			type: "psar",
			symbol: instrument,
			interval: interval,
			usdt_balance,
			token_balance,
			winning_trades: winning,
			losing_trades: losing,
			win_rate: Number(((winning / total) * 100).toFixed(2)),
			lose_rate: Number(((losing / total) * 100).toFixed(2)),
			profit: token_balance > 0 ? usdt_balance - 90 : usdt_balance - 100,
			macd_short: settings.macd.short,
			macd_long: settings.macd.long,
			macd_signal: settings.macd.signal,
			psar_increment: settings.psar.increment,
			psar_max: settings.psar.max,
			bollinger_lower: settings.bollinger.lower,
			bollinger_middle: settings.bollinger.middle,
			bollinger_upper: settings.bollinger.upper,
		})
	}).then(res => {
		// console.log(res)
		if (res.profit > 0) {
			return res
		} else {
			return false
		}
	})

	return test
}

function buy(candle) {
	const {
		macd_line,
		macd_signal,
		macd_histogram,
		low,
		open,
		psar,
		bollinger_lower,
	} = candle
	// console.log(
	// 	macd_line < 0 && macd_signal < 0 && macd_histogram > 0 && psar < low
	// )
	return open < bollinger_lower && psar < low
}

function sell(candle) {
	const { macd_line, macd_signal, macd_histogram, high, psar } = candle
	return macd_line > 0 && macd_signal > 0 && macd_histogram < 0 && psar > high
}

export { psarPromise }
