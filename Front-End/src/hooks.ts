import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { TypedUseSelectorHook } from 'react-redux';
import { useSelector } from 'react-redux';
import type { RootState } from '@app/store';
import type User from '@app/models/User';
import { selectAuthUser, selectIsLogged } from '@app/features/auth/authSlice';
import { parseMarkdown } from '@app/utils';

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

export const useAdminAuthRedirect = (path = '/login'): [User, boolean] => {
  const router = useRouter();
  const user: User = useAppSelector(selectAuthUser);
  const isLoggedIn: boolean = useAppSelector(selectIsLogged);

  useEffect(() => {
    if (!user && !isLoggedIn) {
      router.replace(path, undefined, { shallow: true });
    } else if (user && isLoggedIn && user.role.role_name !== 'admin') {
      router.replace('/404', undefined, { shallow: true });
    }
  }, [user, isLoggedIn, router, path]);

  return [user, isLoggedIn];
};

export const useMarkdown = (markdown: string): string => {
  const [parsedMarkdown, setParsedMarkdown] = useState('');

  useEffect(() => {
    const parsedMarkdown = parseMarkdown(markdown);
    setParsedMarkdown(parsedMarkdown);
  }, [markdown]);

  return parsedMarkdown;
};
