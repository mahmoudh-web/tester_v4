import * as indicators from "../lib/indicators.js"
import { addIndicatorData } from "../lib/addIndicatorData.js"
import { buyAmount, sellAmount } from "../lib/trade.js"
import { pull } from "lodash-es"

const macdStochScalp = async (candles, settings) => {
	const fast_macd = await indicators.macd(candles, settings.fast_macd)
	const slow_macd = await indicators.macd(candles, settings.slow_macd)
	const stochastic = await indicators.stoch(candles, settings.stoch)

	const candleData = addIndicatorData(
		candles,
		{ name: "fast_macd_line", data: fast_macd.macdLine },
		{ name: "fast_macd_signal", data: fast_macd.macdSignal },
		{ name: "fast_macd_histogram", data: fast_macd.histogram },
		{ name: "slow_macd_line", data: slow_macd.macdLine },
		{ name: "slow_macd_signal", data: slow_macd.macdSignal },
		{ name: "slow_macd_histogram", data: slow_macd.histogram },
		{ name: "stochastic_k", data: stochastic.k },
		{ name: "stochastic_d", data: stochastic.d }
	)

	let usdt_balance = 100
	let token_balance = 0
	let losing = 0
	let winning = 0

	for (let i = 4; i < candleData.length; i++) {
		if (token_balance > 0) {
			if (
				sell(
					candleData[i],
					candleData[i - 1],
					candleData[i - 2],
					candleData[i - 3]
				)
			) {
				const amount = sellAmount(candleData[i].open, token_balance)
				usdt_balance += amount
				token_balance = 0
				if (amount <= 10) losing++
				else if (amount > 10) winning++
			}
		} else {
			if (buy(candleData[i], candleData[i - 1])) {
				usdt_balance -= 15
				const amount = buyAmount(candleData[i].open, 15)
				token_balance += amount
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
		fast_macd_short: settings.fast_macd.short,
		fast_macd_long: settings.fast_macd.long,
		fast_macd_signal: settings.fast_macd.signal,
		slow_macd_short: settings.slow_macd.short,
		slow_macd_long: settings.slow_macd.long,
		slow_macd_signal: settings.slow_macd.signal,
		stochastic_k: settings.stoch.k,
		stochastic_d: settings.stoch.d,
	}
}

function buy(current, prev) {
	const trend = current.slow_macd_histogram > 0
	const pullback = current.fast_macd_histogram < 0
	const signal =
		prev.stochastic_k < 20 && current.stochastic_k > current.stochastic_d

	return trend && pullback && signal
}

function sell(current, prev, prev2, prev3) {
	const converging =
		prev.fast_macd_histogram < prev2.fast_macd_histogram &&
		prev2.fast_macd_histogram < prev3.fast_macd_histogram
	const signal =
		current.stochastic_k < current.stochastic_d &&
		prev.stochastic_k > prev.stochastic_d

	return converging && signal
}

export default macdStochScalp
