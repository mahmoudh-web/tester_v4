import * as indicators from "../lib/indicators.js"
import { addIndicatorData } from "../lib/addIndicatorData.js"
import { buyAmount, sellAmount } from "../lib/trade.js"

const macdBollinger = async (candles, settings) => {
	const fast_macd = await indicators.macd(candles, settings.fast_macd)
	const slow_macd = await indicators.macd(candles, settings.slow_macd)
	const fast_bband = await indicators.bollinger(candles, settings.fast_bband)
	const slow_bband = await indicators.bollinger(candles, settings.slow_bband)
	const stochastic = await indicators.stoch(candles, settings.stoch)

	const candleData = addIndicatorData(
		candles,
		{ name: "fast_macd_line", data: fast_macd.macdLine },
		{ name: "fast_macd_signal", data: fast_macd.macdSignal },
		{ name: "fast_macd_histogram", data: fast_macd.histogram },
		{ name: "slow_macd_line", data: slow_macd.macdLine },
		{ name: "slow_macd_signal", data: slow_macd.macdSignal },
		{ name: "slow_macd_histogram", data: slow_macd.histogram },
		{ name: "fast_bband_lower", data: fast_bband.lower },
		{ name: "fast_bband_middle", data: fast_bband.middle },
		{ name: "fast_bband_upper", data: fast_bband.upper },
		{ name: "slow_bband_lower", data: slow_bband.lower },
		{ name: "slow_bband_middle", data: slow_bband.middle },
		{ name: "slow_bband_upper", data: slow_bband.upper },
		{ name: "stochastic_k", data: stochastic.k },
		{ name: "stochastic_d", data: stochastic.d }
	)

	let usdt_balance = 100
	let token_balance = 0
	let losing = 0
	let winning = 0
	let entryPrice = 0

	for (let i = 0; i < candleData.length; i++) {
		// candleData.forEach(candle => {
		if (token_balance > 0) {
			if (candleData[i].close <= entryPrice) {
				if (sellSl(candleData[i], candleData[i - 1])) {
					const amount = sellAmount(candleData[i].open, token_balance)
					usdt_balance += amount
					token_balance = 0
					entryPrice = 0
					losing++
				}
			} else {
				if (sellTP(candleData[i], candleData[i - 1])) {
					const amount = sellAmount(candleData[i].open, token_balance)
					usdt_balance += amount
					token_balance = 0
					entryPrice = 0
					winning++
				}
			}
		} else {
			if (buy(candleData[i])) {
				// console.log("buy")
				usdt_balance -= 15
				const amount = buyAmount(candleData[i].open, 15)
				token_balance += amount
				entryPrice = candleData[i].open
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
		fast_bband_period: settings.fast_bband.period,
		fast_bband_deviation: settings.fast_bband.deviation,
		slow_bband_period: settings.slow_bband.period,
		slow_bband_deviation: settings.slow_bband.deviation,
		stochastic_k: settings.stoch.k,
		stochastic_d: settings.stoch.d,
	}
}

function buy(candle) {
	// console.log(candle)
	const {
		open,
		fast_macd_line: macd_line,
		fast_macd_signal: macd_signal,
		fast_macd_histogram: macd_histogram,
		slow_bband_lower: bband_lower,
		stochastic_k,
		stochastic_d,
	} = candle

	const bollingerCheck = open < bband_lower
	const macdHistogramCheck = macd_histogram > 0
	const macdLinesCheck = macd_line < 0 && macd_signal < 0
	const stoch_k = stochastic_k > 10
	const stoch_d = stochastic_d > 10
	const stoch_direction = stochastic_k > stochastic_d

	return (
		bollingerCheck &&
		macdHistogramCheck &&
		macdLinesCheck &&
		stoch_k &&
		stoch_d &&
		stoch_direction
	)
}

function sellSl(candle, prev) {
	const {
		close,
		fast_bband_lower: bband_lower,
		stochastic_k,
		stochastic_d,
	} = candle

	const { stochastic_k: prev_stochastic_k, stochastic_d: prev_stochastic_d } =
		prev

	const sl_bollinger = close < bband_lower
	const sl_stoch_k = stochastic_k < 5 && prev_stochastic_k >= 5
	const sl_stoch_d = stochastic_d < 5 && prev_stochastic_d >= 5
	const sl_stoch_direction = stochastic_k < stochastic_d

	return sl_bollinger && sl_stoch_k && sl_stoch_d && sl_stoch_direction
}

function sellTP(candle, prev) {
	const {
		slow_macd_line: macd_line,
		slow_macd_signal: macd_signal,
		slow_macd_histogram: macd_histogram,
		stochastic_k,
		stochastic_d,
	} = candle

	const { stochastic_k: prev_stochastic_k, stochastic_d: prev_stochastic_d } =
		prev

	const tp_macd_histogram = macd_histogram < 0
	const tp_macd_line = macd_line > 0
	const tp_macd_signal = macd_signal > 0
	const tp_stoch_k = stochastic_k < 90 && prev_stochastic_k >= 90
	const tp_stoch_d = stochastic_d < 90 && prev_stochastic_d >= 90
	const tp_stoch_direction = stochastic_k < stochastic_d

	return (
		tp_macd_histogram &&
		tp_macd_line &&
		tp_macd_signal &&
		tp_stoch_k &&
		tp_stoch_d &&
		tp_stoch_direction
	)
}
export default macdBollinger
