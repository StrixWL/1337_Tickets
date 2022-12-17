import firebase from 'firebase';

const database = firebase.database();

const isAuthorized = async (Authorization) => await new Promise (async resolve => {
	if (!Authorization) 
		return resolve(null);
	const userdb = database.ref(`Authorizations/${Authorization}`);
	await userdb.get().then(snapshot => {
		const val = snapshot.val();
		if (val && val.authorized)
			resolve(val);
	});
	resolve(null);
})

export {
	isAuthorized
};