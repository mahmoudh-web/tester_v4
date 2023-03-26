import { reverse, min } from "lodash-es"

const addIndicatorData = (candles, ...data) => {
	const candleData = reverse(candles)
	const lengths = []

	data.forEach(indicator => {
		const indicatorData = reverse(indicator.data)
		const name = indicator.name

		lengths.push(indicatorData.length)

		for (let i = 0; i < indicatorData.length; i++) {
			candleData[i][name] = indicatorData[i]
		}
	})
	const trimTo = min(lengths)

	do {
		candleData.pop()
	} while (candleData.length > trimTo)

	const cleanData = []
	candleData.forEach(candle => {
		const data = {
			startTime: candle.startTime,
			closeTime: candle.closeTime,
			startTimeISO: candle.startTimeISO,
			closeTimeISO: candle.closeTimeISO,
			open: candle.open,
			high: candle.high,
			low: candle.low,
			close: candle.close,
			volume: candle.volume,
			symbol: candle.symbol,
			fast_macd_line: candle.fast_macd_line,
			fast_macd_signal: candle.fast_macd_signal,
			fast_macd_histogram: candle.fast_macd_histogram,
			slow_macd_line: candle.slow_macd_line,
			slow_macd_signal: candle.slow_macd_signal,
			slow_macd_histogram: candle.slow_macd_histogram,
			stochastic_k: candle.stochastic_k,
			stochastic_d: candle.stochastic_d,
		}

		cleanData.push(data)
	})
	return reverse(cleanData)
}

export { addIndicatorData }
