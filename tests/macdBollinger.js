import { addIndicatorData } from "../lib/addIndicatorData.js"
import * as indicators from "../lib/indicators.js"
import { sellAmount, buyAmount } from "../lib/trade.js"
import { formatCandles } from "../lib/formatCandles.js"

const macdBollinger = async (candles, settings) => {
	const fast_macd = await indicators.macd(candles, settings.fast_macd)
	const slow_macd = await indicators.macd(candles, settings.slow_macd)
	const fast_bband = await indicators.bollinger(candles, settings.fast_bband)
	const slow_bband = await indicators.bollinger(candles, settings.slow_bband)
	const stochastic = await indicators.stoch(candles, settings.stoch)

	const candleData = addIndicatorData(
		candles,
		{
			name: "fast_macd_line",
			data: fast_macd.macdLine,
		},
		{
			name: "fast_macd_signal",
			data: fast_macd.macdSignal,
		},
		{
			name: "fast_macd_histogram",
			data: fast_macd.histogram,
		},
		{
			name: "slow_macd_line",
			data: slow_macd.macdLine,
		},
		{
			name: "slow_macd_signal",
			data: slow_macd.macdSignal,
		},
		{
			name: "slow_macd_histogram",
			data: slow_macd.histogram,
		},
		{
			name: "fast_bband_upper",
			data: fast_bband.upper,
		},
		{
			name: "fast_bband_middle",
			data: fast_bband.middle,
		},
		{
			name: "fast_bband_lower",
			data: fast_bband.lower,
		},
		{
			name: "slow_bband_upper",
			data: slow_bband.upper,
		},
		{
			name: "slow_bband_middle",
			data: slow_bband.middle,
		},
		{
			name: "slow_bband_lower",
			data: slow_bband.lower,
		},
		{
			name: "stochastic_k",
			data: stochastic.k,
		},
		{
			name: "stochastic_d",
			data: stochastic.d,
		}
	)

	let usdt_balance = 100
	let token_balance = 0
	let buy_price = 0
	let losing = 0
	let winning = 0

	candleData.forEach(candle => {
		if (token_balance > 0) {
			// look for sell
			if (candle.open < buy_price && sl(candle)) {
				const amount = sellAmount(candle.open, token_balance)
				usdt_balance += amount
				token_balance = 0
				losing++
			} else if (tp(candle)) {
				const amount = sellAmount(candle.open, token_balance)
				usdt_balance += amount
				token_balance = 0
				winning++
			}
		}
		// look for buy
		else if (buy(candle)) {
			usdt_balance -= 15
			const amount = buyAmount(candle.open, 10)
			buy_price = candle.open
			token_balance += amount
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
	}
}

const sl = candle => {
	// console.log("sl: ", candle)
	const sl_bollinger = candle.close < candle.fast_bband_lower
	const sl_stoch_k = stochastic.k.at(-1) < 5 && stochastic.k.at(-2) > 5
	const sl_stoch_d = stochastic.d.at(-1) < 5 && stochastic.k.at(-2) > 5
	const sl_stoch_direction = stochastic.k.at(-1) < stochastic.d.at(-1)

	// console.log(
	// 	`sl: ${sl_bollinger && sl_stoch_k && sl_stoch_d && sl_stoch_direction}`
	// )
	return sl_bollinger && sl_stoch_k && sl_stoch_d && sl_stoch_direction
}

const tp = candle => {
	// console.log("tp: ", candle)

	const tp_bollinger = candle.close < candle.fast_bbands.upper
	const tp_macd_histogram = candle.slow_macd.histogram < 0
	const tp_macd_line = candle.slow_macd.macdLine > 0
	const tp_macd_signal = candle.slow_macd.macdSignal > 0
	const tp_stoch_k = candle.stochastic.k < 90 && candle.stochastic.k > 90
	const tp_stoch_d = candle.stochastic.d < 90 && candle.stochastic.k > 90
	const tp_stoch_direction = candle.stochastic.k < candle.stochastic.d

	// console.log(
	// 	`tp: ${
	// 		tp_macd_histogram &&
	// 		tp_macd_line &&
	// 		tp_macd_signal &&
	// 		tp_stoch_k &&
	// 		tp_stoch_d &&
	// 		tp_stoch_direction
	// 	}`
	// )
	return (
		tp_macd_histogram &&
		tp_macd_line &&
		tp_macd_signal &&
		tp_stoch_k &&
		tp_stoch_d &&
		tp_stoch_direction
	)
}

const buy = candle => {
	// console.log("buy: ", candle)

	const bollingerCheck = candle.open < candle.slow_bband_lower
	const macdHistogramCheck = candle.fast_macd_histogram > 0
	const macdLinesCheck =
		candle.fast_macd_macdLine < 0 && candle.fast_macd_macdSignal < 0
	const stoch_k = candle.stochastic_k > 10
	const stoch_d = candle.stochastic_d > 10
	const stoch_direction = candle.stochastic_k > candle.stochastic_d

	// console.log(
	// 	`buy: `,
	// 	bollingerCheck && macdHistogramCheck && macdLinesCheck,
	// 	stoch_k,
	// 	stoch_d,
	// 	stoch_direction
	// )
	return (
		bollingerCheck &&
		macdHistogramCheck &&
		macdLinesCheck &&
		stoch_k &&
		stoch_d &&
		stoch_direction
	)
}

export default macdBollinger
