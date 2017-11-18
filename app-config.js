var config = {
    // Name of built js-file
    jsFilename : 'app.js',
    // Port to run the application on | if using docker set as `process.env.PORT`
    port: process.env.PORT,
    // Webpack dev port to run on
    devPort: 3001,
    // Url for your go server | if using docker set as `process.env.GO_URL`
    goServerUrl: process.env.GO_URL,
    // Go user to use for communication with go server | if using docker set as `process.env.GO_USER`
    goUser: process.env.GO_USER,
    // Password for go user | if using docker set as `process.env.GO_PASSWORD`
    goPassword: process.env.GO_PASSWORD,
    // How often data from go should be refreshed in seconds | if using docker set as `process.env.POLL_INTERVAL`
    goPollingInterval: process.env.POLL_INTERVAL,
    // If > 0 switches between pipeline and test results page every n seconds | if using docker set as `process.env.SWITCH_PAGE_INTERVAL`
    switchBetweenPagesInterval: process.env.SWITCH_PAGE_INTERVAL,
    // Whether to display build labels | if using docker set as `process.env.SHOW_BUILD_LABEL`
    showBuildLabels: process.env.SHOW_BUILD_LABEL
}
module.exports = config;
