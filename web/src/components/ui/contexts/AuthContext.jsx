import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (name, email, password, passwordConfirm) => {
    try {
      const userData = {
        email,
        password,
        passwordConfirm,
        name,
        role: 'user'
      };
      
      const user = await pb.collection('users').create(userData);
      
      // Auto-login after signup
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      
      return { success: true, user: authData.record };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      return { success: true, user: authData.record };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const deleteAccount = async () => {
    try {
      if (!currentUser) return { success: false, error: 'No user logged in' };
      
      await pb.collection('users').delete(currentUser.id, { $autoCancel: false });
      pb.authStore.clear();
      setCurrentUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: error.message };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await pb.collection('users').requestPasswordReset(email);
      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: error.message };
    }
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    deleteAccount,
    requestPasswordReset,
    isAdmin,
    isAuthenticated: !!currentUser,
    initialLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};