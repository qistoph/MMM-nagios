Module.register('nagios', {
	defaults: {
		reloadInterval: 5 * 60 * 1000,
		labels: {
			'ok': 'Ok',
			'warning': 'Warning',
			'critical': 'Critical',
			'unknown': 'Unknown'
		}
	},

	init: function() {
		this.status = {};
	},

	start: function() {
		Log.info('Starting module: ' + this.name);
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
		if (notification === 'STATUS_EVENT') {
			if (this.hasStatusUrl(payload.url)) {
				this.status = payload.status;
				this.loaded = true;
			}
		} else if (notification === 'FETCH_ERROR') {
			Log.error('Nagios Error. Could not fetch status: ' + payload.url);
		} else if (notification === 'INCORRECT_URL') {
			Log.error('Nagios Error. Incorrect url: ' + payload.url);
		} else {
			Log.log('Nagios received an unknown socket notification: ' + notification);
		}

		this.updateDom();
		this.show();
	},

	getStatusSpan: function(descr, key) {
		var span = document.createElement('span');
		span.innerHTML = descr + ': <span class="bright">' + this.status.servicestotals[key] + '</span> ';
		return span;
	},

	getDom: function() {
		var wrapper = document.createElement('table');
		wrapper.className = 'small';
		wrapper.style = "display: flex; justify-content: space-between;";

		if (!this.loaded) {
			wrapper.innerHTML = 'Loading...';
			return wrapper;
		}

		wrapper.appendChild(this.getStatusSpan(this.config.labels['ok'], 'ok'));
		wrapper.appendChild(this.getStatusSpan(this.config.labels['warning'], 'warning'));
		wrapper.appendChild(this.getStatusSpan(this.config.labels['critical'], 'critical'));
		wrapper.appendChild(this.getStatusSpan(this.config.labels['unknown'], 'unknown'));

		return wrapper;
	},

	addStatusUrl: function(apiUrl, username, password, reloadInterval) {
		this.sendSocketNotification('ADD_STATUS_URL', {
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

});
