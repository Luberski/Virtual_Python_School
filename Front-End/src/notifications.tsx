import { InformationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const notifyUserJoined = (i18msg: string) =>
  toast.custom(
    (to) => (
      <button
        type="button"
        className="brand-shadow rounded-lg border-sky-500 bg-sky-200 py-3 px-4 text-sky-900 shadow-sky-900/25"
        onClick={() => toast.dismiss(to.id)}>
        <div className="flex justify-center space-x-1">
          <InformationCircleIcon className="h-6 w-6" />
          <div>
            <p className="font-bold">{i18msg}</p>
          </div>
        </div>
      </button>
    ),
    {
      id: 'classroom-user-joined-notification',
      position: 'top-center',
      duration: 1000,
    }
  );

export const notifyUserLeft = (i18msg: string) =>
  toast.custom(
    (to) => (
      <button
        type="button"
        className="brand-shadow rounded-lg border-sky-500 bg-sky-200 py-3 px-4 text-sky-900 shadow-sky-900/25"
        onClick={() => toast.dismiss(to.id)}>
        <div className="flex justify-center space-x-1">
          <InformationCircleIcon className="h-6 w-6" />
          <div>
            <p className="font-bold">{i18msg}</p>
          </div>
        </div>
      </button>
    ),
    {
      id: 'classroom-user-left-notification',
      position: 'top-center',
      duration: 1000,
    }
  );

export const notifyConnectionFailed = (i18msg: string) =>
  toast.custom(
    (to) => (
      <button
        type="button"
        className="brand-shadow rounded-lg border-sky-500 bg-sky-200 py-3 px-4 text-sky-900 shadow-sky-900/25"
        onClick={() => toast.dismiss(to.id)}>
        <div className="flex justify-center space-x-1">
          <InformationCircleIcon className="h-6 w-6" />
          <div>
            <p className="font-bold">{i18msg}</p>
          </div>
        </div>
      </button>
    ),
    {
      id: 'classroom-connection-failed-notification',
      position: 'top-center',
      duration: 1000,
    }
  );

export const notifyClassroomDeleted = (i18msg: string) =>
  toast.custom(
    (to) => (
      <button
        type="button"
        className="brand-shadow rounded-lg border-sky-500 bg-sky-200 py-3 px-4 text-sky-900 shadow-sky-900/25"
        onClick={() => toast.dismiss(to.id)}>
        <div className="flex justify-center space-x-1">
          <InformationCircleIcon className="h-6 w-6" />
          <div>
            <p className="font-bold">{i18msg}</p>
          </div>
        </div>
      </button>
    ),
    {
      id: 'classroom-deleted-notification',
      position: 'top-center',
      duration: 1000,
    }
  );

export const notifyUnauthorized = (i18msg: string) =>
  toast.custom(
    (to) => (
      <button
        type="button"
        className="brand-shadow rounded-lg border-sky-500 bg-sky-200 py-3 px-4 text-sky-900 shadow-sky-900/25"
        onClick={() => toast.dismiss(to.id)}>
        <div className="flex justify-center space-x-1">
          <InformationCircleIcon className="h-6 w-6" />
          <div>
            <p className="font-bold">{i18msg}</p>
          </div>
        </div>
      </button>
    ),
    {
      id: 'classroom-unathorized-notification',
      position: 'top-center',
      duration: 1000,
    }
  );

export const notifyClassroomLeave = (i18msg: string) =>
  toast.custom(
    (to) => (
      <button
        type="button"
        className="brand-shadow rounded-lg border-sky-500 bg-sky-200 py-3 px-4 text-sky-900 shadow-sky-900/25"
        onClick={() => toast.dismiss(to.id)}>
        <div className="flex justify-center space-x-1">
          <InformationCircleIcon className="h-6 w-6" />
          <div>
            <p className="font-bold">{i18msg}</p>
          </div>
        </div>
      </button>
    ),
    {
      id: 'classroom-leave-notification',
      position: 'top-center',
      duration: 1000,
    }
  );

export const notifyAssignmentCreated = (i18msg: string) =>
  toast.custom(
    (to) => (
      <button
        type="button"
        className="brand-shadow rounded-lg border-sky-500 bg-sky-200 py-3 px-4 text-sky-900 shadow-sky-900/25"
        onClick={() => toast.dismiss(to.id)}>
        <div className="flex justify-center space-x-1">
          <InformationCircleIcon className="h-6 w-6" />
          <div>
            <p className="font-bold">{i18msg}</p>
          </div>
        </div>
      </button>
    ),
    {
      id: 'classroom-assignment-create-notification',
      position: 'top-center',
      duration: 1000,
    }
  );
