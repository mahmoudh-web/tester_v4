const createMacd = () => {
	const settings = []
	for (let short = 2; short < 51; short++) {
		for (let long = 5; long < 201; long++) {
			if (short < long) {
				const data = {
					short,
					long,
					signal: 9,
				}

				settings.push(data)
			}
		}
	}

	return settings
}

const createPsar = () => {
	const settings = []
	for (let increment = 2; increment < 500; increment++) {
		for (let max = 20; max < 90; max += 10) {
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

export { createMacd, createPsar }
