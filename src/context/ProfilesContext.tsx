import React from 'react';

export type Profile = {
  id: string;
  name: string;
  email: string;
  chapter: string;
  createdAt: number;
};

type ProfilesContextValue = {
  profiles: Profile[];
  isSignedIn: boolean;
  addProfile: (p: Omit<Profile, 'id' | 'createdAt'>) => Profile;
};

const ProfilesContext = React.createContext<ProfilesContextValue | undefined>(undefined);

export function useProfiles(){
  const ctx = React.useContext(ProfilesContext);
  if(!ctx) throw new Error('useProfiles must be used within ProfilesProvider');
  return ctx;
}

export function ProfilesProvider({ children }: { children: React.ReactNode }){
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [isSignedIn, setSignedIn] = React.useState(false);

  function addProfile(p: Omit<Profile, 'id' | 'createdAt'>){
    const profile: Profile = { ...p, id: String(Date.now()) + Math.random().toString(36).slice(2,8), createdAt: Date.now() };
    setProfiles((s) => [profile, ...s]);
    setSignedIn(true);
    return profile;
  }

  const value = React.useMemo(() => ({ profiles, isSignedIn, addProfile }), [profiles, isSignedIn]);

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>;
}

export default ProfilesContext;
