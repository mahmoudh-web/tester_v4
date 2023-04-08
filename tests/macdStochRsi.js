import * as indicators from "../lib/indicators.js"
import { addIndicatorData } from "../lib/addIndicatorData.js"
import { buyAmount, sellAmount } from "../lib/trade.js"

const macdStochRsi = async (candles, settings) => {
	const macd = await indicators.macd(candles, settings.macd)
	const stochastic = await indicators.stoch(candles, settings.stoch)
	const rsi = await indicators.rsi(candles, settings.rsi)

	const candleData = addIndicatorData(
		candles,
		{ name: "macd_line", data: macd.macdLine },
		{ name: "macd_signal", data: macd.macdSignal },
		{ name: "macd_histogram", data: macd.histogram },
		{ name: "stochastic_k", data: stochastic.k },
		{ name: "stochastic_d", data: stochastic.d },
		{ name: "rsi", data: rsi }
	)

	let usdt_balance = 100
	let token_balance = 0
	let losing = 0
	let winning = 0
	let price = 0

	for (let i = 4; i < candleData.length; i++) {
		if (token_balance > 0) {
			if (sell(candleData[i], price)) {
				const amount = sellAmount(candleData[i].open, token_balance)
				usdt_balance += amount
				token_balance = 0
				if (amount <= 10) losing++
				else if (amount > 10) winning++
			}
		} else {
			if (buy(candleData[i], candleData[i - 1], candleData[i - 2])) {
				usdt_balance -= 15
				const amount = buyAmount(candleData[i].open, 15)
				token_balance += amount
				price = candleData[i].open
			}
		}
	}

	const total = winning + losing

	return {
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
		stochastic_k: settings.stoch.k,
		stochastic_d: settings.stoch.d,
		rsi: settings.rsi,
	}
}

function buy(current, prev, prev2) {
	const rsi = prev.rsi > 30 && prev2.rsi <= 30
	const stoch = current.stochastic_k > current.stochastic_d
	const macd =
		current.macd_histogram > 0 &&
		current.macd_histogram > prev.macd_histogram

	return rsi && stoch && macd
}

function sell(current, price) {
	return current.open > price * 1.01
}

export default macdStochRsi
