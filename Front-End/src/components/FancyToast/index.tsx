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
    <div
      className={clsx(
        toastObject.visible ? 'animate-enter' : 'animate-leave',
        'py-3 px-4 text-emerald-900 bg-emerald-200 rounded-lg border-emerald-500 shadow',
        className
      )}
      role="alert"
      onClick={() => toast.dismiss(toastObject.id)}>
      <div className="flex justify-center space-x-1">
        <InformationCircleIcon className="w-6 h-6" />
        <div>
          <p className="font-bold">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default FancyToast;
