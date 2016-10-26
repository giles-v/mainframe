class DataStore_Mongo {
	constructor(host, dbName, user, pass) {
		this.connUri = host + "/" + dbName;
		if (user && pass) {
			this.connUri = user + ":" + pass + "@" + connUri;
		}
		this.connectionAttempted = false;
		this.connected = false;
	}

	connect() {
		if (this.connectionAttempted) {
			return new Promise.resolve();
		}
		this.connectionAttempted = true;
		return new Promise((resolve, reject) => {
			this.db = require('monk')(this.connUri, (err) => { 
				if (err) {
                	reject("Failed to connect to DB with error" + err);
                }
                else {
                	this.connected = true;
                	resolve();
                }
            });
		});
	}

	checkLoggedIn() {
		return new Promise((resolve, reject) => {
			this.connect().then(() => {
				this.options = this.db.get('options');
				this.options
					.count({ 'has_logged_in': true })
					.then((result) => {
							resolve((result > 0));
						},
						(error) => {
							reject(error)
						});
			}, () => {
				return new Promise.reject('No available connection');
			});
		});
	}
}

function DataStore_Invoker(host, dbName, user, pass) {
	return new DataStore_Mongo(host, dbName, user, pass);
}

module.exports = DataStore_Invoker;