import axios from 'axios';
import * as config  from '../../config/Config';
import { get, post } from './CRUD';

/**
* @retunrs single element detail
*/
export const getOrgUnitsChild = async (orgId) => {
    return await get('api/organisationUnits/'+orgId+'.json?fields=id,name,children')
    	.then(function (response) {    		
			return response;
		}).catch(function (error) {
			console.log(error);
		});
};

export const getOrgUnitDetail= async (orgId) => {

    return await get('api/organisationUnits/'+orgId+'.json?fields=:all')
    	.then(function (response) {    		
			return response;
		}).catch(function (error) {
			console.log(error);
		});
};

export const getListofUsers= async (orgId) => {

    return await get('api/organisationUnits/'+orgId+'.json?fields=users')
    	.then(function (response) {    		
			return response;
		}).catch(function (error) {
			console.log(error);
		});
};

export const getUserDetails= async (userId) => {
    return await get('api/users/'+userId+'.json')
    	.then(function (response) {    		
			return response;
		}).catch(function (error) {
			console.log(error);
		});
};

export const updateOrgUnits = async (api, jsonPayload) => {
    return await axios(config.baseUrl+api, {
        method: 'PUT',
        headers: config.fetchOptions.headers,
        data: jsonPayload,
    })
   
};

export const getSystemId= async () => {
    return await get('api/system/id')
    	.then(function (response) {    		
			return response;
		}).catch(function (error) {
			console.log(error);
		});
};

export const createUsersWithRandomCode = async (systemId, orgId, firstName, surName, userName, userRoleId, userGroupId) => {

	let jsonPayload = { "id": systemId, "firstName": firstName, "surname": surName, "userCredentials": { "userInfo": { "id": systemId },    "username": userName, "password": userName+"@APTMIS", "userRoles": [ { "id": userRoleId } ] }, "organisationUnits": [ { "id": orgId } ],   "userGroups": [ { "id": userGroupId } ] }; 
		console.log("jsonPayload: ", JSON.stringify(jsonPayload));
	    return await axios(config.baseUrl+"api/users", {
	        method: 'POST',
	        headers: config.fetchOptions.headers,
	        data: JSON.stringify(jsonPayload),
	    })
	
   
};