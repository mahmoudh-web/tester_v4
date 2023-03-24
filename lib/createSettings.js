const createMacd = () => {
	const settings = []
	const short = [2, 5, 10]
	const long = [20, 50, 75]
	const signal = [2, 5, 10]
	// for (let short = 2; short < 25; short += 2) {
	// 	for (let long = 5; long < 51; long += 2) {
	// 		for (let signal = 2; signal < 25; signal += 2) {
	// 			if (short < long && signal < long) {
	// 				const data = {
	// 					short,
	// 					long,
	// 					signal,
	// 				}

	// 				settings.push(data)
	// 			}
	// 		}
	// 	}
	// }

	short.forEach(s => {
		long.forEach(l => {
			signal.forEach(si => {
				if (s < l && si < l) {
					const data = {
						short: s,
						long: l,
						signal: si,
					}

					settings.push(data)
				}
			})
		})
	})

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

const createStoch = () => {
	const settings = []

	for (let k = 5; k < 30; k += 5) {
		for (let d = 2; d < 15; d += 5) {
			for (let smoothing = 2; smoothing < 10; smoothing += 5) {
				if (d < k && smoothing < k) {
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

export { createMacd, createPsar, createBollinger, createStoch }
