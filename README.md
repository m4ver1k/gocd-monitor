<img src="https://github.com/karmats/gocd-monitor/blob/master/assets/images/logo.png?raw=true" width="150" align="right" />


# GoCD monitor [![Build Status](https://travis-ci.org/karmats/gocd-monitor.svg?branch=master)](https://travis-ci.org/karmats/gocd-monitor) [![Dependencies](https://david-dm.org/karmats/gocd-monitor.svg)](https://david-dm.org/karmats/gocd-monitor) [![Code Climate](https://codeclimate.com/github/karmats/gocd-monitor/badges/gpa.svg)](https://codeclimate.com/github/karmats/gocd-monitor)

Build monitor for Go cd build server https://www.go.cd/
#### Pipeline status
* Blue - Pipeline is building
* Green - Pipeline build passed
* Red - Pipeline has failed
* Yellow - Pipeline has been paused
* Orange - Pipeline build been cancelled

![Pipelines](https://github.com/karmats/gocd-monitor/blob/gh-pages/images/pipelines.png?raw=true)

#### Pipeline attributes
![Pipeline explanation](https://github.com/karmats/gocd-monitor/blob/gh-pages/images/pipeline-expl.png?raw=true)

## Setup
Open app-config.js and change the three lines
```   
// Url for your go server
goServerUrl: 'https://ci.example.com',
// Go user to use for communication with go server
goUser: 'xxx',
// Password for go user
goPassword: 'xxx',
  ```
Open a terminal and enter
```
npm install
npm start
```
Go to `http://localhost:3000`

Enjoy :)

## DOCKER Setup

`docker pull adarshkkumar/gocd-monitor`

` docker run -d -p3000:3000 -e GO_URL=http://goserverhost:port -e GO_USER=user_name -e GO_PASSWORD=password  -e PORT=3000 -e POLL_INTERVAL=30 -e SWITCH_PAGE_INTERVAL=30 -e SHOW_BUILD_LABEL=false   gocd-mon:latest `


### Build  Container from source: 

Clone this repository.

Add following configuration to `app-config.js` :

```
var config = {
    
    jsFilename : 'app.js',
    
    port: process.env.PORT,
    
    devPort: 3001,
    
    goServerUrl: process.env.GO_URL,
    
    goUser: process.env.GO_USER,
    
    goPassword: process.env.GO_PASSWORD,
    
    goPollingInterval: process.env.POLL_INTERVAL,
    
    switchBetweenPagesInterval: process.env.SWITCH_PAGE_INTERVAL,
    
    showBuildLabels: process.env.SHOW_BUILD_LABEL
}
module.exports = config;

```

from the repository directory run the following command:

`docker build -t gocd-mon .`

Now you will have a docker image created in your local machine with tag gocd-mon. Use the above docker run command to create a container from this image.

## Configuration
Go to `http://localhost:3000?admin` and click the settings button in the bottom-right corner to open the configuration dialog.
* Sort Order - Sort pipelines by status or latest build time
* Filter Pipelines - Disable/enable pipelines to retrieve from go server
![Configuration](https://github.com/karmats/gocd-monitor/blob/gh-pages/images/configuration.png?raw=true)

## Test reports
To configure test reports, go to `http://localhost:3000/test-results?admin`. Click the '+'-button and choose the pipeline you want to generate test reports for. The system then retrieves all test files and creates graph and possible error table for all tests found in that pipeline. For now only cucumber tests are supported. If defined, the system will switch between monitor and test report page every `switchBetweenPagesInterval` seconds.
![Test reports](https://github.com/karmats/gocd-monitor/blob/gh-pages/images/test-report.png?raw=true)

## How it works
The server polls the go server every `goPollingInterval` seconds. The results are then reported to the client using [socket.io](http://socket.io/). The pipelines and its pause info are refreshed once every day.

## Development
To run the application in development mode, open a terminal and enter `npm run dev-start`. The server and client will be rebuilt when a js or jsx-file changes.
To run tests, enter `npm test`.

## Troubleshooting
If the project has been installed with root user or by using `sudo npm install` there might be problems with the `postinstall` script since npm tries to downgrade its priviligies when running scripts. More information about this problem and how to fix it can be found [here](https://til.codes/npm-install-failed-with-cannot-run-in-wd-2/) (hint, add the `--unsafe-perm` flag when running `npm install`)
