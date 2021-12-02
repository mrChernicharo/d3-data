const chart = {
	csvData: [],
	elements: {},
	dims: { width: 0, height: 0 },
	ready: false,
	colorScale(val) {
		return d3.interpolateMagma(val);
	},
};

chartInit();

async function chartInit() {
	try {
		onResize();
		// console.time('[CHART INIT]');
		const csvData = await d3.csv('../data/tokio.medals.csv');
		chart.csvData = parseCSVData(csvData);

		const initialElements = ['svg', 'xAxis', 'yAxis', 'bars'];
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

	const { csvData, elements, dims, colorScale } = chart;
	const { width, height } = dims;
	const { svg, xAxis, yAxis, barsG } = elements;
	const margins = getMargins(width, height);
	const xDataObj = reduceContinentsData(csvData);
	const barsData = Object.entries(xDataObj).map(([key, value]) => value);
	const xDomain = Object.entries(xDataObj).map(([key, value]) => key);
	const maxY = d3.max(Object.values(xDataObj)) + 5;
	const bars = d3.select('#bars').selectAll('.bar').data(barsData);

	const xScale = d3
		.scaleBand()
		.domain(xDomain)
		.range([margins.left, width - margins.right])
		.paddingOuter(0.2)
		.paddingInner(0.1);

	const yScale = d3
		.scaleLinear()
		.domain([0, maxY])
		.range([height - margins.bottom, margins.top]);

	svg.attr('width', width).attr('height', height);

	xAxis
		.call(d3.axisBottom(xScale).tickSizeOuter(0))
		.style('transform', `translate(0, ${height - margins.bottom}px)`);

	yAxis
		.call(
			d3
				.axisLeft(yScale)
				.tickSize(margins.left + margins.right - width)
				.tickSizeOuter(0)
				.ticks(height > 400 ? 4 : 2)
		)
		.style('transform', `translate(${margins.left}px, 0)`);

	yAxis.selectAll('.tick').select('line').attr('stroke', '#cdcdcd');
	yAxis.select('.domain').attr('stroke', 'none');

	bars.join(enter => enter.append('rect'))
		.attr('class', 'bar')
		.attr('fill', (d, i, e) => colorScale((i + 3) / (e.length * 2)))
		.attr('width', xScale.bandwidth())
		.attr('height', (d, i) => height - yScale(d) - margins.bottom)
		.attr('x', (d, i) => xScale(xDomain[i]))
		.attr('y', (d, i) => yScale(d));

	// console.log(xDomain);
	// console.log({ xRange, xDomain });
	// console.log({ barsData, xDataObj, xDomain });
	// console.log(colorScale(1));
	// console.log(margins);
	// console.log(maxY);
	// console.log(chart);

	// console.timeEnd('[CHART UPDATE]');
}

const reduceContinentsData = csvData =>
	csvData.reduce((acc, country) => {
		country.continent in acc
			? (acc[country.continent] += 1)
			: (acc[country.continent] = 1);
		return acc;
	}, {});

const parseCSVData = data => {
	return data.map(country => {
		return {
			continent: country.Continent,
			name: country['Team/NOC'],
			gold: Number(country.Gold),
			silver: Number(country.Silver),
			bronze: Number(country.Bronze),
			totalMedals: Number(country.Total),
			rank: Number(country.Rank),
		};
	});
};

const getMargins = (width, height) => {
	return {
		top: Math.max(32, height * 0.2),
		bottom: Math.max(24, height * 0.1),
		left: Math.max(24, width * 0.1),
		right: Math.max(16, width * 0.05),
	};
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
