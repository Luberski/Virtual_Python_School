import { InformationCircleIcon } from '@heroicons/react/outline';
import clsx from 'clsx';
import toast from 'react-hot-toast';

type FancyToastProps = {
  message: string;
  toastObject: {
    id: string;
    visible: boolean;
  };
  className?: string;
};

const FancyToast = ({ toastObject, message, className }: FancyToastProps) => {
  return (
    <button
      type="button"
      className={clsx(
        toastObject.visible ? 'animate-enter' : 'animate-leave',
        'rounded-lg border-emerald-500 bg-emerald-200 py-3 px-4 text-emerald-900 shadow',
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
