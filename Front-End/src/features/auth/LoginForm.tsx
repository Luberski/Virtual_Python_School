import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import Input from '@app/components/Input';
import { useAppSelector } from '@app/hooks';
import {
  loginUser,
  selectAuthError,
  selectAuthStatus,
} from '@app/features/auth/authSlice';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';

type LoginFormProps = {
  translations: (key: string) => string;
};

export default function LoginForm({ translations }: LoginFormProps) {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthStatus);

  const onSubmit = (data: { username: string; password: string }) => {
    const { username, password } = data;

    try {
      dispatch(loginUser({ username, password }));
      if (status === 'succeeded') {
        router.push('/');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      className="flex flex-col items-center justify-center space-y-6"
      onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="username"
        type="username"
        placeholder={translations('Auth.username')}
        register={register}
        required
      />
      <Input
        label="password"
        type="password"
        placeholder={translations('Auth.password')}
        register={register}
        required
      />
      <IconButton
        variant={IconButtonVariant.SECONDARY}
        type="submit"
        icon={
          status === 'pending' ? (
            <svg
              className="mr-1 h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <div className="relative top-0.5">
              <Image
                width="24"
                height="16"
                src="/ZUT_logo_kolor.svg"
                alt="zut logo"
              />
            </div>
          )
        }>
        {translations('Auth.login')}
      </IconButton>
      {status === 'failed' && error && (
        <div className="rounded-lg bg-red-300 py-2 px-4 text-red-700">
          {error}
        </div>
      )}
    </form>
  );
}
