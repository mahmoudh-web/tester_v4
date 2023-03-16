import { addIndicatorData } from "../lib/addIndicatorData.js"
import * as indicators from "../lib/indicators.js"
import { sellAmount, buyAmount } from "../lib/trade.js"

const macdDifferent = async (candles, settingsSame, settingsDifferent) => {
	const macdIn = await indicators.macd(candles, settingsSame)
	const macdOut = await indicators.macd(candles, settingsDifferent)

	const candleData = addIndicatorData(
		candles,
		{ name: "macd_line_in", data: macdIn.macdLine },
		{ name: "macd_signal_in", data: macdIn.macdSignal },
		{ name: "macd_histogram_in", data: macdIn.histogram },
		{ name: "macd_line_out", data: macdOut.macdLine },
		{ name: "macd_signal_out", data: macdOut.macdSignal },
		{ name: "macd_histogram_out", data: macdOut.histogram }
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

	return {
		usdt_balance,
		token_balance,
		winning_trades: winning,
		losing_trades: losing,
		win_rate: Number(((winning / total) * 100).toFixed(2)),
		lose_rate: Number(((losing / total) * 100).toFixed(2)),
		profit: token_balance > 0 ? usdt_balance - 90 : usdt_balance - 100,
		macd_short_in: settingsSame.short,
		macd_long_in: settingsSame.long,
		macd_signal_in: settingsSame.signal,
		macd_short_out: settingsDifferent.short,
		macd_long_out: settingsDifferent.long,
		macd_signal_out: settingsDifferent.signal,
	}
}

function buy(candle) {
	const { macd_line_in, macd_signal_in, macd_histogram_in } = candle
	// return open < bollinger_lower && psar < low
	return macd_line_in < 0 && macd_signal_in < 0 && macd_histogram_in > 0
}

function sell(candle) {
	const { macd_line_out, macd_signal_out, macd_histogram_out } = candle
	return macd_line_out > 0 && macd_signal_out > 0 && macd_histogram_out < 0
}

export default macdDifferent
