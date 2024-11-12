import React from "react";
import { UserButton } from "@clerk/nextjs";
import MobileSidebar from "./mobile-sidebar";

const NavBar = () => {
  return (
    <div className="flex items-center p-4">
      <div>
        <MobileSidebar />
      </div>
      <div className="flex w-full justify-end">
        <UserButton />
      </div>
    </div>
  );
};

export default NavBar;
