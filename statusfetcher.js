var Client = require('node-rest-client').Client;

var StatusFetcher = function(url, user, pass, reloadInterval) {
	var self = this;

	var reloadTimer = null;
	var status = {};

	var fetchFailedCallback = function() {};
	var statusReceivedCallback = function() {};

	var opts = {
		mimetypes: {
			'json': ['application/json']
		}
	};

	if (user && pass) {
		opts.user = user;
		opts.password = pass;
	}

	var apiClient = new Client(opts);
	apiClient.registerMethod('getStatus', url, 'GET');

	/* fetchStatus()
	 * Initiates status fetch.
	 */
	var fetchStatus = function() {
		clearTimeout(reloadTimer);
		reloadTimer = null;

		apiClient.methods.getStatus(handleApiResponse);
	};

	var handleApiResponse = function(data, response) {
		if (data === undefined) {
			fetchFailedCallback(self, 'Received data empty or invalid.');
			return;
		}

		var serviceStatusTotals = getServiceStatusTotals(data);
		status = {servicestotals: serviceStatusTotals};

		self.broadcastStatus();
		scheduleTimer();
	}

	var getServiceStatusTotals = function(data) {
		var statusCounts = {ok: 0, warning: 0, unknown: 0, critical: 0};

		var hostServices = data['services'];
		Object.keys(hostServices).forEach(function(hostname) {
			Object.keys(hostServices[hostname]).forEach(function(servicename) {
				switch(parseInt(hostServices[hostname][servicename].current_state)) {
					case 0:
						statusCounts.ok++;
						break;
					case 1:
						statusCounts.warning++;
						break;
					case 2:
						statusCounts.critical++;
						break;
					default:
						statusCounts.unknown++;
						break;
				}
			});
		});

		return statusCounts;
	}

	/* scheduleTimer()
	 * Schedule the timer for the next update.
	 */
	var scheduleTimer = function() {
		//console.log('Schedule update timer.');
		clearTimeout(reloadTimer);
		reloadTimer = setTimeout(function() {
			fetchStatus();
		}, reloadInterval);
	};

	/* public methods */

	/* startFetch()
	 * Initiate fetchStatus();
	 */
	this.startFetch = function() {
		fetchStatus();
	};

	/* broadcastStatus()
	 * Broadcast the existing trains.
	 */
	this.broadcastStatus = function() {
		trainsReceivedCallback(self);
	};

	/* onReceive(callback)
	 * Sets the on success callback
	 *
	 * argument callback function - The on success callback.
	 */
	this.onReceive = function(callback) {
		trainsReceivedCallback = callback;
	};

	/* onError(callback)
	 * Sets the on error callback
	 *
	 * argument callback function - The on error callback.
	 */
	this.onError = function(callback) {
		fetchFailedCallback = callback;
	};

	/* status()
	 * Returns the status of this fetcher.
	 *
	 * return string - The status of this fetcher.
	 */
	this.status = function() {
		return status;
	};

	/* url()
	 * Returns the url of this fetcher.
	 *
	 * return string - The url of this fetcher.
	 */
	this.url = function() {
		return url;
	};

	/* trains()
	 * Returns current available trains for this fetcher.
	 *
	 * return array - The current available trains for this fetcher.
	 */
	this.trains = function() {
		return trains;
	};

};

module.exports = StatusFetcher;
