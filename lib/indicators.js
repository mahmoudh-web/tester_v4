import tulind from "tulind"
import { formatCandles } from "./formatCandles.js"

const macd = async (candles, settings) => {
	const { open, high, low, close, volume } = formatCandles(candles)
	const macdLine = []
	const macdSignal = []
	const histogram = []

	await tulind.indicators.macd.indicator(
		[close],
		[settings.short, settings.long, settings.signal],
		(err, results) => {
			if (err) console.log(err)
			results[0].forEach(res => macdLine.push(res))
			results[1].forEach(res => macdSignal.push(res))
			results[2].forEach(res => histogram.push(res))
		}
	)
	return { macdLine, macdSignal, histogram }
}

const psar = async (candles, settings) => {
	const { open, high, low, close, volume } = formatCandles(candles)
	const output = []

	await tulind.indicators.psar.indicator(
		[high, low],
		[settings.increment, settings.max],
		(err, results) => {
			if (err) console.log(err)
			results[0].forEach(res => output.push(res))
		}
	)
	return output
}

const bollinger = async (candles, settings) => {
	const { open, high, low, close, volume } = formatCandles(candles)
	// console.log(settings)

	const upper = []
	const lower = []
	const middle = []

	await tulind.indicators.bbands.indicator(
		[close],
		[settings.period, settings.deviation],
		(err, results) => {
			if (err) console.log(err)
			results[0].forEach(res => lower.push(res))
			results[1].forEach(res => middle.push(res))
			results[2].forEach(res => upper.push(res))
		}
	)

	return { lower, middle, upper }
}

const stoch = async (candles, settings) => {
	const { open, high, low, close, volume } = formatCandles(candles)

	const k = []
	const d = []

	await tulind.indicators.stoch.indicator(
		[high, low, close],
		[settings.k, settings.d, settings.smoothing],
		(err, results) => {
			if (err) console.log(err)
			results[0].forEach(res => k.push(res))
			results[1].forEach(res => d.push(res))
		}
	)

	return { k, d }
}

const rsi = async (candles, settings) => {
	const { open, high, low, close, volume } = formatCandles(candles)
	const data = []

	await tulind.indicators.rsi.indicator(
		[close],
		[settings],
		(err, results) => {
			if (err) console.log(err)
			results[0].forEach(res => data.push(res))
		}
	)

	return data
}

export { macd, psar, bollinger, stoch, rsi }
