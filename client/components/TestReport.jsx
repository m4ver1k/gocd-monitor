/**
 * Test results jsx-file
 */

import React from 'react';

import { Card, CardActions, CardMedia, CardText, CardTitle, IconButton } from 'material-ui';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { grey100, teal100, pink100, teal500, pink500 } from 'material-ui/styles/colors';
import Clear from 'material-ui/svg-icons/content/clear';

import Chart from 'chart.js'
import moment from 'moment';


// White and transparent white colors
const white = 'rgb(255, 255, 255)';
const transWhite = 'rgba(255, 255, 255, 0.5)';

// Style css
const styles = {
  cardSuccess: {
    backgroundColor: teal500
  },
  cardFailure: {
    backgroundColor: pink500
  },
  cardContainer: {
    paddingBottom: 0
  },
  cardMedia: {
    margin: '16px'
  },
  cardText: {
    backgroundColor: white
  },
  cardTitle: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  tableWrapper: {
    maxHeight: 440,
    overflowY: 'auto'
  },
  cardActions: {
    textAlign: 'right',
    marginRight: -10
  }
}

// Chart.js setup
Chart.defaults.global.defaultFontColor = white;
Chart.defaults.global.defaultFontFamily = 'Roboto';

const chartData = (labels, passed, failed) => {
  return {
    labels: labels || [],
    datasets: [
      {
        label: "Failed",
        fill: true,
        backgroundColor: white,
        data: failed || []
      },
      {
        label: "Passed",
        fill: true,
        backgroundColor: transWhite,
        data: passed || []
      },
    ]
  }
};

const chartOptions = {
  responsive: true,
  title: {
    display: false
  },
  legend: {
    display: false
  },
  elements: {
    line: {
      tension: 0,
      backgroundColor: white,
      borderColor: white,
      borderWidth: 1
    },
    point: {
      radius: 2,
      backgroundColor: white,
      borderColor: white
    },
  },

  scales: {
    xAxes: [{
      type: 'time',
      time: {
        unit: 'hour',
        displayFormats: {
          hour: 'ddd, MMM D'
        },
        unitStepSize: 24,
        tooltipFormat: 'dddd, MMMM Do YYYY, h:mm:ss a'
      },
      gridLines: {
        drawBorder: false,
        color: white,
        display: false
      },
      ticks: {
        callback: (value, idx, values) => {
          // To avoid duplicates
          const stringVals = values.map(val => {
            moment(val.value).format('ddd, MMM D')
          });
          if (stringVals.indexOf(value) !== idx) {
            return '';
          }
          return value;
        }
      }
    }],
    yAxes: [{
      gridLines: {
        drawBorder: false,
        color: white,
        display: false
      },
      ticks: {
        maxTicksLimit: 5
      },
      stacked: true
    }]
  },
  datasetFill: true
}

export default class TestReport extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = this.propsToState(props);

  }

  componentDidMount() {
    // Initialize chart object
    const ctx = this.refs.reportChart;

    const chartOpts = chartOptions;
    chartOpts.scales.xAxes[0].time.min = this.state.first.when;
    chartOpts.scales.xAxes[0].time.max = this.state.latest.when;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: this.state.chartData,
      options: chartOpts
    });
  }

  componentDidUpdate() {
    this.chart.data.datasets = this.state.chartData.datasets;
    this.chart.data.labels = this.state.chartData.labels;

    this.chart.options.scales.xAxes[0].time.min = this.state.first.when;
    this.chart.options.scales.xAxes[0].time.max = this.state.latest.when;
    this.chart.update();
  }

  componentWillReceiveProps(props) {
    this.setState(this.propsToState(props));
  }

  /**
   * Modifies incomming properties to state object
   * 
   * @param   {Object}   props   The properties to modify
   */
  propsToState(props) {
    const report = props.report;
    const latestTestReport = report.history[report.history.length - 1];
    const firstTestReport = report.history[0];

    // Chart data
    const chartDataView = chartData(
      report.history.map(history => history.when),
      report.history.map(history => history.passed),
      report.history.map(history => history.failed)
    )

    return {
      report: report,
      latest: latestTestReport,
      first: firstTestReport,
      chartData: chartDataView
    }
  }

  /**
   * Tests that has failed in a table 
   * 
   * @param {Array<Object>}   failures  Failed object array
   */
  generateFailInfo(failures) {
    return (
      <Table selectable={false} wrapperStyle={styles.tableWrapper}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
          <TableRow>
            <TableHeaderColumn>Test</TableHeaderColumn>
            <TableHeaderColumn>Reason</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {failures.map((failure, idx) => {
            return (
              <TableRow key={idx}>
                <TableRowColumn title={failure.test}>{failure.test}</TableRowColumn>
                <TableRowColumn title={failure.message}>{failure.message}</TableRowColumn>
              </TableRow>
            )
          }) }
        </TableBody>
      </Table>
    )
  }

  render() {
    const report = this.state.report;
    const latest = this.state.latest;
    const failed = latest.errors.length > 0;

    // String that tells how long the test has been stable
    let stableDays = '';
    if (!failed) {
      const lastFailedIdx = report.history.reduce((p, c, idx) => {
        if (c.failed > 0 && p < idx) {
          return idx;
        }
        return p;
      }, -1);
      const passedAfterFailed = report.history[lastFailedIdx + 1];
      stableDays = lastFailedIdx >= 0 && passedAfterFailed
        ? `Stable for ${moment(passedAfterFailed.when).fromNow(true)}`
        : 'Super stable!'
    }

    // Remove test action
    const actions = this.props.admin ?
      (<CardActions style={styles.cardActions}>
        <IconButton tooltip="Remove test" tooltipPosition="bottom-left"
          onClick={this.props.onRemoveTest.bind(this, report) }>
          <Clear color={white} />
        </IconButton>
      </CardActions>) : null;

    return (
      <Card style={failed ? styles.cardFailure : styles.cardSuccess} containerStyle={styles.cardContainer}>
        {actions}
        <CardTitle title={report.title} subtitle={report.subtitle}
          subtitleColor={transWhite} titleColor={white} titleStyle={styles.cardTitle} />
        <CardMedia style={styles.cardMedia}>
          <canvas ref="reportChart"></canvas>
        </CardMedia>
        <CardText style={styles.cardText}>
          {failed ? this.generateFailInfo(latest.errors) : stableDays}
        </CardText>
      </Card>
    );
  }
}
