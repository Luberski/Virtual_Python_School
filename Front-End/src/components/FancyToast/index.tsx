import { InformationCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export enum FancyToastVariant {
  SUCCESS = 'bg-emerald-200 border-emerald-500 text-emerald-900',
  ERROR = 'bg-red-200 border-red-500 text-red-900',
}

type FancyToastProps = {
  message: string;
  toastObject: {
    id: string;
    visible: boolean;
  };
  className?: string;
  variant?: FancyToastVariant;
};

const FancyToast = ({
  toastObject,
  message,
  className,
  variant = FancyToastVariant.SUCCESS,
}: FancyToastProps) => {
  return (
    <button
      type="button"
      className={clsx(
        toastObject.visible ? 'animate-enter' : 'animate-leave',
        `rounded-lg ${variant} py-3 px-4 shadow`,
        className
      )}
      onClick={() => toast.dismiss(toastObject.id)}>
      <div className="flex justify-center space-x-1">
        <InformationCircleIcon className="h-6 w-6" />
        <div>
          <p className="font-bold">{message}</p>
        </div>
      </div>
    </button>
  );
};

export default FancyToast;
