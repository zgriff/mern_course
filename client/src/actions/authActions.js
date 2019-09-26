import { GET_ERRORS, SET_CURRENT_USER } from "./types";
import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

//Register User

export const registerUser = (userData, history) => dispatch => {
	axios
		.post("/api/users/register", userData)
		.then(res => history.push("/login"))
		.catch(err =>
			dispatch({
				type: GET_ERRORS,
				payload: err.response.data
			})
		);
};

//Login - get user token
export const loginUser = userData => dispatch => {
	axios
		.post("/api/users/login", userData)
		.then(res => {
			const { token } = res.data;
			//Save to local storage
			localStorage.setItem("jwtToken", token);
			//Set token ot Auth header
			setAuthToken(token);
			//decode token to get user data
			const decoded = jwt_decode(token);
			//Set curr user
			dispatch(setCurrentUser(decoded));
		})
		.catch(err =>
			dispatch({
				type: GET_ERRORS,
				payload: err.response.data
			})
		);
};

//Set logged in user
export const setCurrentUser = decoded => {
	return {
		type: SET_CURRENT_USER,
		payload: decoded
	};
};

//Log user out
export const logoutUser = () => dispatch => {
	//Remove token from localstorage
	localStorage.removeItem("jwtToken");
	//delete auth header
	setAuthToken(false);
	//Set curr user to {} which set isAuth to false
	dispatch(setCurrentUser({}));
};
