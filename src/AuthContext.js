import React, { useReducer, useContext, createContext, useEffect } from 'react';
import qs from 'qs';
import jwt from 'jwt-decode';
import axios from 'axios';
import { SocketContext } from './socket';
import dotenv from 'dotenv';
dotenv.config();

const initialState = {
  authenticated: false,
  token: null,
  userInfo: null,
};

function authReducer(state, action) {
  switch(action.type) {
    case 'LOGIN':
      return { ...state, token: action.token, authenticated: action.authenticated, userInfo: action.userInfo };
    case 'UPDATE':
      return { ...state, userInfo: action.userInfo };
    case 'LOGOUT':
      return initialState;
    default:
      // console.log('call default in auth reducer');
      return state;
  }
}

const AuthStateContext = createContext(null);
const AuthDispatchContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  const context = useContext(AuthStateContext);
  if(!context) {
    throw new Error('need context provider');
  }
  return context;
}

export function useAuthDispatch() {
  const context = useContext(AuthDispatchContext);
  if(!context) {
    throw new Error('need context provider');
  }
  return context;
}

export function AuthInit({ location, history }) {
  const dispatch = useAuthDispatch();
  const socket = useContext(SocketContext);
  // console.log('here socket', socket);
  useEffect(() => {
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    if(!query.t) return null;
    const queryDecoded = jwt(query.t);
    socket.emit('init', {
      userId: queryDecoded.id,
      userName: queryDecoded.name
    });
    // console.log('socket',)
    const userInfo = { ...queryDecoded, socket };
    // console.log('ui', userInfo);
    dispatch({ type: 'LOGIN', token: query.t, authenticated: true, userInfo: userInfo });
    axios.defaults.headers.common['x-access-token'] = query.t;
    history.push('/');
  }, []);
  return null;

}

export async function updateUser(state, dispatch) {
  const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/users/${state.userInfo.id}`);
  dispatch({ type: 'UPDATE', userInfo: res.data[0] });
}

// get userInfo
export function getName(authState) {
  const name = !authState.userInfo ? false : authState.userInfo.name; 
  return name;
}

export function getUserId(authState) {
  const userId = !authState.userInfo ? false : authState.userInfo.id; 
  return userId;
}

export function getUserImg(authState) {
  const userImg = !authState.userInfo ? false : authState.userInfo.image; 
  return userImg;
}

export function checkLogin(authState) {
    if(authState.userInfo === null) {
      return false;
    } else {
      return true;
    } 
}


