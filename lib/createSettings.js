const createMacd = (
	short_min,
	short_max,
	long_min,
	long_max,
	signal_min,
	signal_max
) => {
	const settings = []
	// const short = [2, 5, 10]
	// const long = [20, 50, 75]
	// const signal = [2, 5, 10]
	for (let short = short_min; short < short_max; short += 4) {
		for (let long = long_min; long < long_max; long += 4) {
			for (let signal = signal_min; signal < signal_max; signal += 2) {
				if (short < long && signal < long) {
					const data = {
						short,
						long,
						signal,
					}

					settings.push(data)
				}
			}
		}
	}

	// short.forEach(s => {
	// 	long.forEach(l => {
	// 		signal.forEach(si => {
	// 			if (s < l && si < l) {
	// 				const data = {
	// 					short: s,
	// 					long: l,
	// 					signal: si,
	// 				}

	// 				settings.push(data)
	// 			}
	// 		})
	// 	})
	// })

	return settings
}

const createPsar = () => {
	const settings = []
	for (let increment = 2; increment < 50; increment++) {
		for (let max = 20; max < 50; max += 10) {
			if (increment < max) {
				const data = {
					increment: increment / 100,
					max: max / 100,
				}
				settings.push(data)
			}
		}
	}

	return settings
}

const createBollinger = () => {
	const settings = []

	const periods = [5, 10, 25, 50]
	const deviations = [25, 50, 100, 150, 200]

	periods.forEach(period => {
		deviations.forEach(deviation => {
			const data = {
				period,
				deviation: deviation / 100,
			}

			settings.push(data)
		})
	})
	// for (let x = 2; x < 31; x += 3) {
	// 	for (let deviation = 25; deviation < 210; deviation += 25) {
	// 		const data = {
	// 			period: x,
	// 			deviation: deviation / 100,
	// 		}
	// 		settings.push(data)
	// 	}
	// }
	return settings
}

const createStoch = (kMax, dMax, smoothingMax) => {
	const settings = []

	for (let k = 5; k < kMax; k += 1) {
		for (let d = 2; d < dMax; d += 1) {
			for (let smoothing = 2; smoothing < smoothingMax; smoothing += 1) {
				if (d < k && smoothing <= k) {
					const data = {
						k,
						d,
						smoothing,
					}

					settings.push(data)
				}
			}
		}
	}

	return settings
}

const createRsi = max => {
	const settings = []

	for (let i = 2; i < max + 1; i++) {
		settings.push(i)
	}

	return settings
}

export { createMacd, createPsar, createBollinger, createStoch, createRsi }
