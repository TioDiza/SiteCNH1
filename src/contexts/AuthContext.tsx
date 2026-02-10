import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface Profile {
  role: string;
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
  const [loading, setLoading] = useState(true); // Começa como true para o carregamento inicial

  // Este efeito roda uma vez para pegar a sessão inicial e configurar o listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Se não houver sessão inicial, terminamos o carregamento.
      // Se houver, o próximo efeito cuidará do carregamento do perfil.
      if (!session) {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Se o usuário sair, não estamos carregando.
        if (!session) {
            setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Este efeito roda sempre que o usuário muda (após login, logout, ou carregamento inicial)
  useEffect(() => {
    // Se temos um usuário, buscamos o perfil dele.
    if (user) {
      // Mostra o loader de página inteira apenas no carregamento inicial do perfil.
      // Atualizações subsequentes (ex: ao focar na aba) acontecerão em segundo plano.
      if (!profile) {
        setLoading(true);
      }
      
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
          } else {
            setProfile(data);
          }
          // Finaliza o carregamento após buscar o perfil (ou falhar).
          setLoading(false);
        });
    } else {
      // Sem usuário, sem perfil, e não estamos carregando.
      setProfile(null);
      setLoading(false);
    }
  }, [user]); // Dependência no `user`

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { session, user, profile, loading, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};