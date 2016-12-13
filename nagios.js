/* global Module, Log */

Module.register("nagios", {
	defaults: {
		reloadInterval: 5 * 60 * 1000,
		labels: {
			"ok": "Ok",
			"warning": "Warning",
			"critical": "Critical",
			"unknown": "Unknown"
		}
	},

	init: function() {
		this.status = {};
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		var self = this;
		setInterval(function() {
			self.updateDom();
		}, this.config.reloadInterval);

		this.addStatusUrl(this.config.statusUrl, this.config.username, this.config.password, this.config.reloadInterval);
	},

	getStyles: function() {
		return [];
	},

	getScripts: function() {
		return [];
	},

	// Override socket notification handler.
	socketNotificationReceived: function (notification, payload) {
		if (notification === "STATUS_EVENT") {
			if (this.hasStatusUrl(payload.url)) {
				this.status = payload.status;
				this.loaded = true;
			}
		} else if (notification === "FETCH_ERROR") {
			Log.error("Nagios Error. Could not fetch status: " + payload.url);
		} else if (notification === "INCORRECT_URL") {
			Log.error("Nagios Error. Incorrect url: " + payload.url);
		} else {
			Log.log("Nagios received an unknown socket notification: " + notification);
		}

		this.updateDom();
		this.show();
	},

	getStatusSpan: function(counts, descr, key) {
		var span = document.createElement("span");
		span.innerHTML = descr + ": <span class='bright'>" + counts[key] + "</span> ";
		return span;
	},

	getGroupDiv: function(title, state) {
		var groupDiv = document.createElement("div");

		var catHeader = document.createElement("div");
		catHeader.className = "small bright";
		catHeader.innerHTML = title;
		groupDiv.appendChild(catHeader);

		this.getServiceListWithStatus(this.status, state).forEach(function(service, i) {
			var divRow = document.createElement("div");
			divRow.style = "display: flex; justify-content: space-between";

			var divService = document.createElement("span");
			divService.innerHTML = service.service;
			divRow.appendChild(divService);

			var divHost = document.createElement("span");
			divHost.innerHTML = service.host;
			divRow.appendChild(divHost);

			groupDiv.appendChild(divRow);
		});

		return groupDiv;
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "small";

		var summary = document.createElement("div");
		summary.style = "display: flex; justify-content: space-between;";

		if (!this.loaded) {
			wrapper.innerHTML = "Loading...";
			return wrapper;
		}

		var statusTotals = this.getServiceStatusTotals(this.status);

		summary.appendChild(this.getStatusSpan(statusTotals, this.config.labels["critical"], "critical"));
		summary.appendChild(this.getStatusSpan(statusTotals, this.config.labels["warning"], "warning"));
		summary.appendChild(this.getStatusSpan(statusTotals, this.config.labels["unknown"], "unknown"));
		summary.appendChild(this.getStatusSpan(statusTotals, this.config.labels["ok"], "ok"));
		wrapper.appendChild(summary);

		if (statusTotals["critical"] > 0) {
			wrapper.appendChild(this.getGroupDiv(this.config.labels["critical"], "critical"));
		}
		if (statusTotals["warning"] > 0) {
			wrapper.appendChild(this.getGroupDiv(this.config.labels["warning"], "warning"));
		}
		if (statusTotals["unknown"] > 0) {
			wrapper.appendChild(this.getGroupDiv(this.config.labels["unknown"], "unknown"));
		}

		return wrapper;
	},

	addStatusUrl: function(apiUrl, username, password, reloadInterval) {
		this.sendSocketNotification("ADD_STATUS_URL", {
			"apiUrl": apiUrl,
			"username": username,
			"password": password,
			"reloadInterval": reloadInterval,
		});
	},

	hasStatusUrl: function(apiUrl) {
		if(this.config.statusUrl === apiUrl) {
			return true;
		}
		return false;
	},

	getServiceListWithStatus: function(data, state) {
		var stateId = state == "ok" ? 0 : state == "warning" ? 1 : state == "critical" ? 2 : 3;

		var ret = [];
		var hostServices = data["services"];
		Object.keys(hostServices).forEach(function(hostname) {
			Object.keys(hostServices[hostname]).forEach(function(servicename) {
				var currentState = hostServices[hostname][servicename].current_state;
				if (currentState == stateId) {
					ret.push({"host": hostname, "service": servicename, "state": currentState});
				}
			});
		});
		return ret;
	},

	getServiceStatusTotals: function(data) {
		var statusCounts = {ok: 0, warning: 0, unknown: 0, critical: 0};

		var hostServices = data["services"];
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
	},

});
