import React, { useState } from "react";
import Button from "../components/Button";
import Image from "next/image";
import Footer from "../components/Footer";
import Input from "../components/Input";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <>
      <div className="absolute w-full h-full bg-white">
        <nav className="w-full mx-auto bg-white">
          <div className="container flex items-center justify-between h-16 px-6 mx-auto lg:items-stretch">
            <div className="flex items-center h-full">
              <div className="flex items-center mr-10">
                <Link href="/" passHref={true}>
                  <a className="hidden ml-3 text-base font-bold leading-tight tracking-normal text-gray-900 lg:block no-underline hover:no-underline">
                    Virtual Python School
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="container flex flex-col justify-center px-6 pb-4 mx-auto my-6 lg:my-12 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-5xl font-bold text-center text-gray-900">
              Join us!
            </h1>
          </div>
        </div>
        <div className="container px-6 mx-auto">
          <div className="flex flex-col space-y-8 items-center justify-center">
            <Input type="email" placeholder="E-mail" />
            <Input type="text" placeholder="Name" />
            <Input type="text" placeholder="Last name" />
            <Input type="password" placeholder="Password" />
            <Input type="password" placeholder="Repeat password" />
            <Button primary className="w-36">
              Register
            </Button>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
