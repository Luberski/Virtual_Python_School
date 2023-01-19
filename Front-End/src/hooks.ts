import { useRouter } from 'next/router';
import { useEffect } from 'react';
import type { TypedUseSelectorHook } from 'react-redux';
import { useSelector } from 'react-redux';
import { selectAuthUser, selectIsLogged } from '@app/features/auth/authSlice';
import type User from '@app/models/User';
import type { RootState } from '@app/store';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuthRedirect = (path = '/login'): [User, boolean] => {
  const router = useRouter();
  const user: User = useAppSelector(selectAuthUser);
  const isLoggedIn: boolean = useAppSelector(selectIsLogged);

  useEffect(() => {
    if (!user && !isLoggedIn) {
      router.replace(path, undefined, { shallow: true });
    }
  }, [user, isLoggedIn, router, path]);

  return [user, isLoggedIn];
};
