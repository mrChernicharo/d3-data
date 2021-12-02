const sleep = ms => new Promise(res => setTimeout(res, ms));
const chart = {
	dims: { width: 0, height: 0 },
};

onResize();
updateChart();

async function updateChart() {
	const { width, height } = chart.dims;
	d3.select('#svg').attr('width', width).attr('height', height);

	const colorFn = d3.scaleOrdinal(d3.schemeCategory10);
	const domain = setDomain(colorFn);
	const colors = domain.map((d, i) => colorFn(d));
	const xScale = d3
		.scaleOrdinal()
		.domain(domain)
		.range(
			domain.map((word, i, arr) =>
				i === 0 ? 12 : (i * width) / arr.length
			)
		);

	console.log(domain, colors);

	let i = 0;
	while (i < domain.length) {
		await sleep(300);

		d3.select('#svg')
			.append(`text`)
			.html(domain[i])
			.attr('fill', colors[i])
			.attr('y', 200)
			.attr('x', xScale(domain[i]));
		i++;
	}
}

function onResize() {
	// prettier-ignore
	const getCanvasRect = () => document.querySelector('#canvas').getBoundingClientRect();
	const { width, height } = getCanvasRect();

	chart.dims.width = width;
	chart.dims.height = height;
}

function setDomain(color) {
	color.domain(
		'A list of ten words to explore this scale’s domain'.split(/ /)
	);
	return color.domain();
}

window.addEventListener('resize', () => {
	onResize();
	updateChart();
});
