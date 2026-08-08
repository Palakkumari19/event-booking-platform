import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------
  // Restore logged-in user on page refresh
  // ---------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser(token)
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ---------------------------------------
  // Login
  // ---------------------------------------
  const login = async (email, password) => {
    const data = await loginUser({
      email,
      password,
    });

    localStorage.setItem(
      "access_token",
      data.access
    );

    localStorage.setItem(
      "refresh_token",
      data.refresh
    );

    const currentUser = await getCurrentUser(
      data.access
    );

    setUser(currentUser);

    return currentUser;
  };

  // ---------------------------------------
  // Signup
  // ---------------------------------------
  const signup = async (userData) => {
    await registerUser(userData);

    return login(
      userData.email,
      userData.password
    );
  };

  // ---------------------------------------
  // Logout
  // ---------------------------------------
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};