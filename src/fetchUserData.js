import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, ALLOWED_CAMPUS} from '../Config/constants.js';
import got from 'got';
import { URLSearchParams } from 'url';

const getNewToken = async (code) => {
	const cred = new URLSearchParams();
	cred.append("grant_type", "client_credentials");
	cred.append("client_id", CLIENT_ID);
	cred.append("client_secret", CLIENT_SECRET);
  	if (code) {
		cred.append("code", code);
		cred.append("redirect_uri", REDIRECT_URI);
		cred.set("grant_type", "authorization_code");
	}
  	try {
    	const data = await got
      		.post("https://api.intra.42.fr/oauth/token", {
        		searchParams: cred,
      		});
    	return data;
  	} catch (err) {
    	return null;
  	}
};

const getStudentData = async (data) => await new Promise (async resolve => {
	if (data) {
		await got("https://api.intra.42.fr/oauth/token/info", {
			headers: {
				Authorization: `Bearer ${JSON.parse(data.body).access_token}`
			}
		}).then(async (r) => {
			await got("https://api.intra.42.fr/v2/users/" + JSON.parse(r.body).resource_owner_id, {
		 		headers: {
			  		Authorization: `Bearer ${JSON.parse(data.body).access_token}`
		 		}
			}).then(r => {
				const studentData = JSON.parse(r.body);
			  	const userCampuses = studentData.campus_users;
				studentData.campuses = [];
			  	userCampuses.forEach(campus => {
					studentData.campuses.push(campus.campus_id);
			  	});
				studentData.campuses.forEach(campus => {
					if (campus == ALLOWED_CAMPUS)
						resolve(studentData);
				});
		  	});
	  	}).catch((e) => {
			console.error(e);
	  	});
	}
	resolve(null);
});

export {
	getNewToken,
	getStudentData
};