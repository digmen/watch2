import React, { createContext, useContext, useEffect, useReducer } from "react";
import { ACTIONS, ADMINS } from "../utils/const";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

const authContext = createContext();

export function useAuthContext() {
  return useContext(authContext);
}

const initState = {
  user: null,
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.user:
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

function AuthContext({ children }) {
  const [state, dispatch] = useReducer(reducer, initState);

  async function register({ email, password, displayName, photoURL }) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL,
      });
    } catch (error) {}
  }

  async function login({ email, password }) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {}
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      dispatch({
        type: ACTIONS.user,
        payload: user,
      });
    });
  }, []);

  function isAdmin() {
    if (state.user) {
      const bool = ADMINS.includes(state.user.email);
      return bool;
    }
  }

  const value = {
    login,
    register,
    isAdmin,
    logout,
    user: state.user,
  };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
}

export default AuthContext;
