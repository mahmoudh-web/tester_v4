const createMacd = () => {
	const settings = []
	for (let short = 2; short < 25; short += 2) {
		for (let long = 5; long < 51; long += 2) {
			for (let signal = 2; signal < 25; signal += 2) {
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

	return settings
}

const createPsar = () => {
	const settings = []
	for (let increment = 2; increment < 50; increment++) {
		for (let max = 20; max < 80; max += 10) {
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
	for (let x = 2; x < 51; x++) {
		for (let deviation = 25; deviation < 310; deviation += 25) {
			const data = {
				period: x,
				deviation: deviation / 100,
			}
			settings.push(data)
		}
	}
	return settings
}

export { createMacd, createPsar, createBollinger }
