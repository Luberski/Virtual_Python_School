import React, { useState } from "react";
import Button from "../components/Button";

export default function IndexPage() {
  const [profile, setProfile] = useState(false);
  return (
    <>
      <div className="absolute w-full h-full bg-gray-50">
        <nav className="w-full mx-auto bg-white">
          <div className="container flex items-center justify-between h-16 px-6 mx-auto lg:items-stretch">
            <div className="flex items-center h-full">
              <div className="flex items-center mr-10">
                <h3 className="hidden ml-3 text-base font-bold leading-tight tracking-normal text-gray-900 lg:block">
                  Virtual Python School
                </h3>
              </div>
              <ul className="items-center hidden h-full pr-12 xl:flex">
                <li className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 cursor-pointer rounded-xl">
                  Home
                </li>
                <li className="flex items-center px-4 py-2 mx-4 text-sm tracking-normal text-gray-700 cursor-pointer rounded-xl">
                  Courses
                </li>
              </ul>
            </div>
            <div className="items-center justify-end hidden h-full xl:flex">
              <div className="flex items-center w-full h-full">
                <div className="flex w-full h-full">
                  <div
                    aria-haspopup="true"
                    className="relative flex items-center justify-end w-full cursor-pointer"
                    onClick={() => setProfile(!profile)}
                  >
                    {profile ? (
                      <div className="flex">
                        <ul className="absolute right-0 z-40 w-40 p-2 mt-48 bg-white border-r rounded ">
                          <li className="py-2 text-sm leading-3 tracking-normal text-gray-600 cursor-pointer hover:text-blue-500 focus:text-blue-500 focus:outline-none">
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="icon icon-tabler icon-tabler-user"
                                width={20}
                                height={20}
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" />
                                <circle cx={12} cy={7} r={4} />
                                <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                              </svg>
                              <span className="ml-2">My Profile</span>
                            </div>
                          </li>
                          <li className="flex items-center py-2 mt-2 text-sm leading-3 tracking-normal text-gray-600 cursor-pointer hover:text-blue-500 focus:text-blue-500 focus:outline-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="icon icon-tabler icon-tabler-help"
                              width={20}
                              height={20}
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path stroke="none" d="M0 0h24v24H0z" />
                              <circle cx={12} cy={12} r={9} />
                              <line x1={12} y1={17} x2={12} y2="17.01" />
                              <path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />
                            </svg>
                            <span className="ml-2">Help Center</span>
                          </li>
                          <li className="flex items-center py-2 mt-2 text-sm leading-3 tracking-normal text-gray-600 cursor-pointer hover:text-blue-500 focus:text-blue-500 focus:outline-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="icon icon-tabler icon-tabler-settings"
                              width={20}
                              height={20}
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path stroke="none" d="M0 0h24v24H0z" />
                              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <circle cx={12} cy={12} r={3} />
                            </svg>
                            <span className="ml-2">Account Settings</span>
                          </li>
                        </ul>
                        <img
                          className="object-cover w-10 h-10 rounded"
                          src="https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/3b/3b80afb3cc996edde4b3c8d599196c032410f754_full.jpg"
                          alt="logo"
                        />
                        <p className="ml-2 text-sm text-gray-800">John Xina</p>
                      </div>
                    ) : (
                      <div className="space-x-4">
                        <Button>Log in</Button>
                        <Button primary>Register</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex items-center visible xl:hidden">
              <ul className="absolute top-0 right-0 hidden w-64 p-2 mt-12 -ml-2 bg-white border-r rounded lg:mt-16">
                <li className="py-2 text-sm leading-3 tracking-normal text-gray-600 cursor-pointer hover:text-blue-500 focus:text-blue-500 focus:outline-none">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon icon-tabler icon-tabler-user"
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <circle cx={12} cy={7} r={4} />
                      <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                    <span className="ml-2">Profile</span>
                  </div>
                </li>
                <li className="flex py-2 mt-2 text-sm leading-3 tracking-normal text-gray-600 cursor-pointer xl:hidden hover:text-blue-700 focus:text-blue-700 focus:outline-none">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon icon-tabler icon-tabler-grid"
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <rect x={4} y={4} width={6} height={6} rx={1} />
                      <rect x={14} y={4} width={6} height={6} rx={1} />
                      <rect x={4} y={14} width={6} height={6} rx={1} />
                      <rect x={14} y={14} width={6} height={6} rx={1} />
                    </svg>
                    <span className="ml-2">Home</span>
                  </div>
                </li>
                <li className="relative flex items-center py-2 mt-2 text-sm leading-3 tracking-normal text-gray-600 cursor-pointer xl:hidden hover:text-blue-700 focus:text-blue-700 focus:outline-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-help"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" />
                    <circle cx={12} cy={12} r={9} />
                    <line x1={12} y1={17} x2={12} y2="17.01" />
                    <path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />
                  </svg>
                  <span className="ml-2">Courses</span>
                </li>
                <li className="flex items-center py-2 mt-2 text-sm leading-3 tracking-normal text-gray-600 cursor-pointer xl:hidden hover:text-blue-700 focus:text-blue-700 focus:outline-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-settings"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" />
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <circle cx={12} cy={12} r={3} />
                  </svg>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="container flex flex-col justify-center px-6 pb-4 mx-auto my-6 lg:my-12 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-4xl font-bold text-center text-gray-900">
              Python for everyone
            </h1>
            <h2 className="text-xl text-center text-gray-900">
              Choose your skill level
            </h2>
          </div>
        </div>
        <div className="container px-6 mx-auto">
          <div className="flex items-center justify-center w-full space-x-12">
            <div className="flex flex-col justify-center p-8 bg-green-100 rounded-xl">
              <h3 className="text-xl font-bold">Beginners</h3>
              <p className="text-gray-700">
                For beginers starting with programming.
              </p>
              <Button className="mt-16 w-36">Learn More</Button>
            </div>
            <div className="flex flex-col justify-center p-8 bg-blue-100 rounded-xl">
              <h3 className="text-xl font-bold">Intermediate</h3>
              <p className="text-gray-700">
                For people who know the basics of programming
              </p>
              <Button className="mt-16 w-36">Learn More</Button>
            </div>
            <div className="flex flex-col justify-center p-8 bg-yellow-100 rounded-xl">
              <h3 className="text-xl font-bold">Advanced</h3>
              <p className="text-gray-700">For people mastering own skills.</p>
              <Button className="mt-16 w-36">Learn More</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
