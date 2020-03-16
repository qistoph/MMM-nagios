# Nagios - MagicMirror² module

[![Build Status](https://travis-ci.org/qistoph/MMM-nagios.svg?branch=master)](https://travis-ci.org/qistoph/MMM-nagios)

This is a module for [MagicMirror²](https://github.com/MichMich/MagicMirror).
Shows informantion from nagios.

![Example Visualization](.previews/nagios.png)

## Installing the module

The module uses the JSON formatted Nagios status as formattted by [php-nagios-json](https://github.com/lizell/php-nagios-json).

To install the module, just clone this repository to your __modules__ folder:
`git clone https://github.com/qistoph/MMM-nagios.git nagios`.
The run `cd nagios` and `npm install` to install the dependencies.

## Updating the module

Pull the git updates: `git pull`.
The update dependencies in the module folder: `cd nagios` followed by `npm install`.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:

```javascript
modules: [
  {
    module: 'nagios',
    position: 'top_right',
    header: 'Nagios - Services',
    config: {
      statusUrl: 'https://<YOUR URL>/',
      username:'Basic auth username',
      password: 'Basic auth password',
      showDetails: true,
      showHosts: false
    }
  },
  {
    module: 'nagios',
    position: 'top_right',
    header: 'Nagios - Hosts',
    config: {
      statusUrl: 'https://<YOUR URL>/',
      username:'Basic auth username',
      password: 'Basic auth password',
      showDetails: true,
      showHosts: true
    }
  }
]
```

## Configuration options

The following properties can be configured:

Option           | Description
---------------- | -----------
`statusUrl`      | The URL to get the status from. Must be a php-nagios-json page.<br>**Required**
`username`       | HTTP Basic Auth username, if need to access the page.<br>**Optional**
`password`       | HTTP Basic Auth password, should be specified if the username is.<br>**Optional**
`showDetails`    | Show the service and host for each nagios status (except OK).<br>**Optional**
`showHosts`      | Show information about hosts instead of services.<br>**Default value:** `false`
`reloadInterval` | Number of milliseconds between refresh.<br>**Default value:** `5 * 60 * 1000` (5 minutes)
`labels`         | Defines the labels for each type of status.<br>**Default value:** See [Default labels](#default-labels)

### Default labels

````javascript
labels: {
  'ok': 'Ok',
  'warning': 'Warning',
  'critical': 'Critical',
  'unknown': 'Unknown'
}
````

## Notifications

This module supports the following notifications:

Notification   | Description
-------------- | -----------
`SHOW_DETAILS` | Payload is a `boolean` indicating if the details should be shown, just like (`showDetails` in the config).
