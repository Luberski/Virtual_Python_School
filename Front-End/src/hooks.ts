import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { selectAuthUser, selectIsLogged } from './features/auth/authSlice';
import { User } from './models/User';
import type { RootState } from './store';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuthRedirect = (path = '/login'): [User, boolean] => {
  const router = useRouter();
  const user: User = useAppSelector(selectAuthUser);
  const isLoggedIn: boolean = useAppSelector(selectIsLogged);

  useEffect(() => {
    if (!user && !isLoggedIn) {
      router.replace(path);
    }
  }, [user, isLoggedIn, router, path]);

  return [user, isLoggedIn];
};
