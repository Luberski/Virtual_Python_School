import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
// import type { FormEventHandler } from 'react';
// import { useForm } from 'react-hook-form';
import IconButton from '../IconButton';
import Button, { ButtonVariant } from '@app/components/Button';
import { XMarkIcon } from '@heroicons/react/20/solid';

type FormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: JSX.Element;
  submitHandler: (data: unknown) => undefined;
};

export default function FormDialog({
  isOpen,
  onClose,
  title,
  children,
  submitHandler,
}: FormDialogProps) {
  const onSubmit = (data: unknown) => console.log(data);

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
              <Dialog.Panel className="brand-shadow2 flex w-fit justify-center overflow-hidden rounded-lg bg-white text-left shadow-neutral-900/25 transition-all dark:bg-neutral-800">
                <form method="dialog" onSubmit={submitHandler(onSubmit)}>
                  <div>
                    <div className="flex flex-row items-center justify-between border-b-2 border-b-gray-400 p-3">
                      <IconButton
                        variant={ButtonVariant.FLAT_DANGER}
                        className="ml-1 p-1 pr-0"
                        onClick={onClose}
                        icon={
                          <XMarkIcon className="h-5 w-5"></XMarkIcon>
                        }></IconButton>

                      <div>
                        <Button
                          onClick={onClose}
                          className="mr-2"
                          variant={ButtonVariant.DANGER}>
                          Cancel
                        </Button>
                        <Button type="submit" variant={ButtonVariant.PRIMARY}>
                          Send
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="p-3">{children}</div>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
