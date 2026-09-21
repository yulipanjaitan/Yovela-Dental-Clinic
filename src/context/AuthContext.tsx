'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'DOKTER' | 'PENDAFTARAN' | 'KASIR';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  sipNumber?: string;
}

export interface AccountData extends User {
  pass: string;
}

export const INITIAL_ACCOUNTS: Record<string, AccountData> = {
  yulipanjaitan: {
    id: 'USR-01',
    username: 'yulipanjaitan',
    pass: 'admin123',
    name: 'drg. Yuli Kartilla Panjaitan',
    role: 'DOKTER',
    roleLabel: 'Dokter Gigi Umum & Penanggung Jawab',
    sipNumber: 'SIP.503/449/DRG/2026',
  },
  pendaftaran: {
    id: 'USR-02',
    username: 'pendaftaran',
    pass: 'fo123',
    name: 'Budi Santoso, A.Md.Kes',
    role: 'PENDAFTARAN',
    roleLabel: 'Petugas Front Office & Registrasi',
  },
  kasir: {
    id: 'USR-03',
    username: 'kasir',
    pass: 'kasir123',
    name: 'Siti Rahma, S.E.',
    role: 'KASIR',
    roleLabel: 'Staf Kasir & Billing',
  },
};

interface AuthContextType {
  currentUser: User | null;
  accounts: Record<string, AccountData>;
  loginWithCredentials: (username: string, pass: string) => { success: boolean; message?: string };
  updateAccounts: (newAccounts: Record<string, AccountData>) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  accounts: INITIAL_ACCOUNTS,
  loginWithCredentials: () => ({ success: false }),
  updateAccounts: () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Record<string, AccountData>>(INITIAL_ACCOUNTS);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Muat akun tersimpan dan sesi pengguna saat aplikasi dimuat
  useEffect(() => {
    const savedAccounts = localStorage.getItem('yovela_accounts_db');
    let loadedAccounts = INITIAL_ACCOUNTS;
    if (savedAccounts) {
      try {
        loadedAccounts = JSON.parse(savedAccounts);
        setAccounts(loadedAccounts);
      } catch {
        localStorage.setItem('yovela_accounts_db', JSON.stringify(INITIAL_ACCOUNTS));
      }
    } else {
      localStorage.setItem('yovela_accounts_db', JSON.stringify(INITIAL_ACCOUNTS));
    }

    const savedUser = localStorage.getItem('yovela_auth_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('yovela_auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const updateAccounts = (newAccounts: Record<string, AccountData>) => {
    setAccounts(newAccounts);
    localStorage.setItem('yovela_accounts_db', JSON.stringify(newAccounts));

    // Jika dokter mengubah datanya sendiri, perbarui juga currentUser aktif
    if (currentUser) {
      const activeAccount = Object.values(newAccounts).find((a) => a.id === currentUser.id);
      if (activeAccount) {
        const updatedUser: User = {
          id: activeAccount.id,
          username: activeAccount.username,
          name: activeAccount.name,
          role: activeAccount.role,
          roleLabel: activeAccount.roleLabel,
          sipNumber: activeAccount.sipNumber,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('yovela_auth_user', JSON.stringify(updatedUser));
      }
    }
  };

  const loginWithCredentials = (username: string, pass: string) => {
    const savedAccounts = localStorage.getItem('yovela_accounts_db');
    const currentList: Record<string, AccountData> = savedAccounts
      ? JSON.parse(savedAccounts)
      : accounts;

    const target = Object.values(currentList).find(
      (acc) => acc.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (target && target.pass === pass) {
      const userData: User = {
        id: target.id,
        username: target.username,
        name: target.name,
        role: target.role,
        roleLabel: target.roleLabel,
        sipNumber: target.sipNumber,
      };
      setCurrentUser(userData);
      localStorage.setItem('yovela_auth_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: 'Username atau kata sandi tidak cocok!' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('yovela_auth_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accounts,
        loginWithCredentials,
        updateAccounts,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);