const config = require("./config");

class DataService {
	async post(ownerName) {
		const res = await fetch(config.fetchUrl + `/create/${ownerName}`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			}
		});

		return res;
	}

	async get(id) {
		const res = await fetch(config.fetchUrl + `/${id}`, {
			headers: {
				"content-type": "application/json"
			}
		});

		return res;
	}

	async update(match) {
		const res = await fetch(config.fetchUrl + '/update', {
			method: "PUT",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify(match)
		}

		return res;
	}
}

export default new DataService();
