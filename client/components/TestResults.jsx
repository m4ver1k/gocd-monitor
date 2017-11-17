/**
 * Test results jsx-file
 */

import React from 'react';

import { Dialog, FlatButton, FloatingActionButton, Snackbar } from 'material-ui';
import Add from 'material-ui/svg-icons/content/add';
import { purple700 } from 'material-ui/styles/colors';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';

import moment from 'moment';

import TestReport from './TestReport';
import AddTest from './AddTest';


const muiTheme = getMuiTheme({
  palette: {
    primary1Color: purple700,
  }
});

const styles = {
  addTestBtn: {
    position: 'fixed',
    right: 50,
    bottom: 50
  }
};

// From latest report to this number of days back in time
const daysInterval = 20;

export default class TestResults extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.socket = props.socket;

    // Setup initial state
    this.state = {
      // Results
      testReports: [],
      pipelines: [],
      addTestDialogOpened: false,
      // Snackbar message
      msg: ''
    };
  }

  componentDidMount() {
    // All pipeline names
    this.socket.on('pipelines:names', (pipelines) => {
      this.setState({
        pipelines: pipelines
      });
    });

    // Updated test results
    this.socket.on('tests:updated', (testReports) => {
      this.setState({
        testReports: testReports.map(this.convertReport).sort(this.sortReports)
      });
    });

    this.socket.on('tests:message', (message) => {
      this.setState({
        msg: message
      });
    });

    // Request latest test results
    this.socket.emit('tests:get');
  }

  closeAddTest() {
    this.setState({
      addTestDialogOpened: false
    });
    // Reset the test to add
    this.selectedPipeline = null;
  }

  openAddTest() {
    this.setState({
      addTestDialogOpened: true
    });
  }

  /**
   * Sort reports. Failed first, then time for latest report
   */
  sortReports(r1, r2) {
    const latest1 = r1.history[r1.history.length - 1];
    const latest2 = r2.history[r2.history.length - 1];
    if (latest2.failed > 0 && latest1.failed <= 0) {
      return 1;
    }
    if (latest1.failed > 0 && latest2.failed <= 0) {
      return -1;
    }
    if (latest2.when > latest1.when) {
      return 1;
    }
    return -1;
  }

  /**
   * Converts report data to report object
   */
  convertReport(report) {
    // Report model
    const reportView = {
      id: report._id,
      title: `${report.pipeline} (${report.stage})`,
      subtitle: report.job
    };
    if (report.cucumber) {
      // Create chart history data      
      reportView.history = report.cucumber
        // Sort by time ascending
        .sort((a, b) => {
          return a.timestamp > b.timestamp ? 1 : -1;
        })
        // Filter reports that are not in defined interval
        .filter((report, idx, arr) => {
          // Latest test case = last in list
          const latestTestTime = moment(arr[arr.length - 1].timestamp);
          const currTestTime = moment(report.timestamp);
          return latestTestTime.diff(currTestTime, 'days') <= daysInterval;
        })
        .reduce((acc, c) => {
          const errors = [];
          let passed = 0;
          let failed = 0;
          c.features.forEach((feature) => {
            feature.scenarios.forEach((scenario) => {
              scenario.steps.forEach((step) => {
                if (step.result === 'passed') {
                  passed++;
                } else {
                  failed++;
                  errors.push({
                    test: scenario.name,
                    message: step.error,
                  });
                }
              })
            })
          })
          acc.push({
            passed: passed,
            failed: failed,
            errors: errors,
            when: c.timestamp
          });
          return acc;
        }, []);

    }
    return reportView;
  }

  resetMessage() {
    this.setState({
      msg: ''
    });
  }

  /**
   * Add test reports for a pipeline
   */
  addTest() {
    this.socket.emit('tests:add', this.selectedPipeline);
    this.closeAddTest();
  }

  /**
   * Removes a test
   * 
   * @param {Object} report The report to remove
   */
  removeTest(report) {
    this.socket.emit('tests:remove', report.id);
  }

  /**
   * Select a pipeline to generate tests for
   */
  selectTestPipeline(pipelineTest) {
    this.selectedPipeline = pipelineTest;
  }

  render() {
    // In adminMode tests can be added
    const adminMode = window.location.search.indexOf('admin') >= 0;

    const addBtn = adminMode ? (
      <FloatingActionButton
        style={styles.addTestBtn}
        onClick={this.openAddTest.bind(this) }>
        <Add />
      </FloatingActionButton>
    ) : null;

    const addTestActions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={this.closeAddTest.bind(this) }
        />,
      <FlatButton
        label="Add"
        primary={true}
        onClick={this.addTest.bind(this) }
        />
    ];

    const reports = this.state.testReports.map((report) => {
      return (
        <div key={report.title} className="col-md-4 col-sm-6 col-xs-12">
          <TestReport report={report} admin={adminMode} onRemoveTest={this.removeTest.bind(this)} />
        </div>)
    });

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className="appcontainer">
          <div className="row">
            {reports}
          </div>
          <Dialog
            title="Add Test"
            open={this.state.addTestDialogOpened}
            actions={addTestActions}
            onRequestClose={this.closeAddTest.bind(this) }>
            Select a pipeline to generate test reports for. For now only cucumber json is supported.
            <AddTest pipelines={this.state.pipelines} onPipelineSelect={this.selectTestPipeline.bind(this) } />
          </Dialog>
          <Snackbar
            open={this.state.msg.length > 0}
            message={this.state.msg}
            autoHideDuration={5000}
            onRequestClose={this.resetMessage.bind(this)} />
          {addBtn}
        </div>
      </MuiThemeProvider>
    );
  }
}
