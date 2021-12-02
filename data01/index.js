const chart = {
	data: [],
	elements: {},
	dims: { width: 0, height: 0 },
	ready: false,
	colorScale(val) {
		return d3.interpolateMagma(val);
	},
};
console.log(chart);

chartInit();

async function chartInit() {
	try {
		onResize();
		// console.time('[CHART INIT]');
		const csvData = await d3.csv('../data/tokio.medals.csv');
		chart.data = parseChartData(csvData);

		const initialElements = ['svg', 'xAxis', 'yAxis', 'bars', 'line'];
		initialElements.forEach((elName, i) => {
			chart.elements[elName] =
				i === 0
					? d3.select('#canvas').append('svg').attr('id', elName)
					: d3.select('#svg').append('g').attr('id', elName);
		});

		chart.ready = true;
		updateChart();
		// console.timeEnd('[CHART INIT]');
	} catch (err) {
		console.error(err);
	}
}

function updateChart() {
	// console.time('[CHART UPDATE]');

	const { data, elements, dims } = chart;
	const { width, height } = dims;
	const { svg, xAxis, yAxis, bars } = elements;
	const maxY = d3.max(data.map(item => item.totalMedals));
	const margins = {
		top: Math.max(32, height * 0.2),
		bottom: Math.max(16, height * 0.1),
		left: Math.max(32, width * 0.1),
		right: Math.max(16, width * 0.05),
	};

	svg.attr('width', width).attr('height', height);

	// console.log(margins);
	// console.log(maxY);
	// console.log(chart);
	// console.timeEnd('[CHART UPDATE]');

	d3.select('#line')
		.selectAll('line#line')
		.data(d => [1, 2])
		.join(enter => enter.append('line').attr('id', 'line'))
		.attr('x1', margins.left)
		.attr('x2', width - margins.right)
		.attr('y1', d => (d === 1 ? margins.top : height - margins.bottom))
		.attr('y2', d => (d === 1 ? margins.top : height - margins.bottom))
		.attr('stroke-width', 5)
		.attr('stroke', 'red');
}

const parseChartData = data => {
	return data.map(country => {
		return {
			continent: country.Continent,
			country: country['Team/NOC'],
			gold: Number(country.Gold),
			silver: Number(country.Silver),
			bronze: Number(country.Bronze),
			totalMedals: Number(country.Total),
			rank: Number(country.Rank),
		};
	});
};

function onResize() {
	// console.time('[CHART RESIZE]');

	// prettier-ignore
	const getCanvasRect = () => document.querySelector('#canvas').getBoundingClientRect();
	const { width, height } = getCanvasRect();

	chart.dims.width = width;
	chart.dims.height = height;

	// console.log(chart.dims);

	// console.timeEnd('[CHART RESIZE]');
}

window.addEventListener('resize', () => {
	onResize();
	updateChart();
});
