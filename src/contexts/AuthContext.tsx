import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface Profile {
  role: string;
  // Add other profile fields if needed
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      // Sempre que o estado de autenticação mudar, entramos em modo de carregamento
      setLoading(true);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        // Se houver um usuário, buscamos o perfil dele
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentSession.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile on auth change:', error);
          setProfile(null);
        } else {
          setProfile(profileData);
        }
      } else {
        // Se não houver usuário, limpamos o perfil
        setProfile(null);
      }
      // Finalizamos o carregamento após buscar todas as informações
      setLoading(false);
    });

    // O listener acima é acionado no carregamento inicial da página com o evento 'INITIAL_SESSION',
    // então não precisamos de uma função separada para buscar a sessão inicial.
    // Isso simplifica o código e evita problemas de concorrência.
    // Apenas garantimos que, se não houver sessão alguma, o carregamento pare.
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            setLoading(false);
        }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};