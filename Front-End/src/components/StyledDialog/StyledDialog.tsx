import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

type StyledDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: JSX.Element;
  icon?: JSX.Element;
};

export default function StyledDialog({
  isOpen,
  onClose,
  title,
  children,
  icon,
}: StyledDialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div
            // eslint-disable-next-line tailwindcss/migration-from-tailwind-2
            className="fixed inset-0 bg-neutral-900 bg-opacity-75"
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="brand-shadow2 flex w-auto justify-center overflow-hidden rounded-lg bg-white p-6 text-left shadow-neutral-900/25 transition-all dark:bg-neutral-800">
                <div className="mt-4 mr-2">{icon}</div>
                <div className="mt-4">
                  <Dialog.Title as="h3" className="text-2xl font-bold">
                    {title}
                  </Dialog.Title>
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
