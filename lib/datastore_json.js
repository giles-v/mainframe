class DataStore_JSON {
	constructor(dir) {
		this.dir = dir;
		this.data = {};
		this.fs = require("fs");
	}

	getOptsFromFile(table, force_reload) {
		if (force_reload || !(table in this.data)) {
			this.data[table] = JSON.parse(this.fs.readFileSync(this.dir+'/'+table+'.json'));
		}
		return this.data[table];
	}

	checkLoggedIn() {
		return new Promise((resolve, reject) => {
			var opts = this.getOptsFromFile('options');
			if (opts) {
				resolve(('has_logged_in' in opts) && opts.has_logged_in === true);
			}
			else {
				reject('Failed to find db.options');
			}
		});
	}
}

function DataStore_Invoker(dir) {
	return new DataStore_JSON(dir);
}

module.exports = DataStore_Invoker;