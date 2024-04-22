"use client";
import Image from "next/image";
import avatarDefault from "../../../public/assets/avatar.png";
import { RiBookMarkedLine, RiLockPasswordLine } from "react-icons/ri";
import { BiLogOut } from "react-icons/bi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import Link from "next/link";

type Props = {
  user: any;
  active: number;
  avatar: string | null;
  setActive: (active: number) => void;
  logOutHandler: any;
};

const SideBarProfile = ({
  user,
  active,
  avatar,
  setActive,
  logOutHandler,
}: Props) => {
  return (
    <div className="w-full">
      <div
        className={`w-full flex items-center px-3 py-4 cursor-pointer ${
          active === 1 ? "dark:bg-slate-800 bg-slate-200" : "bg-transparent"
        }`}
        onClick={() => setActive(1)}
      >
        <Image
          src={
            user.avatar || avatar ? user.avatar?.url || avatar : avatarDefault
          }
          alt=""
          width={30}
          height={30}
          className="800px:w-[40px] 800px:h-[40px] cursor-pointer object-contain rounded-full"
        />
        <h5 className="pl-2 800px:block hidden font-Poppins font-semibold dark:text-white text-black">
          My Account
        </h5>
      </div>
      {user.isVerified === false && (
        <div
          className={`w-full flex items-center px-3 py-4 cursor-pointer ${
            active === 2 ? "dark:bg-slate-800  bg-slate-200" : "bg-transparent"
          }`}
          onClick={() => setActive(2)}
        >
          <RiLockPasswordLine
            size={20}
            fill="#fff"
            className="dark:fill-white fill-black"
          />
          <h5 className="pl-2 800px:block hidden font-Poppins font-semibold dark:text-white text-black">
            Change Password
          </h5>
        </div>
      )}
      <div
        className={`w-full flex items-center px-3 py-4 cursor-pointer ${
          active === 3 ? "dark:bg-slate-800  bg-slate-200" : "bg-transparent"
        }`}
        onClick={() => setActive(3)}
      >
        <RiBookMarkedLine
          size={20}
          fill="#fff"
          className="dark:fill-white fill-black"
        />
        <h5 className="pl-2 800px:block hidden font-Poppins font-semibold dark:text-white text-black">
          Enrolled Courses
        </h5>
      </div>
      {user?.role === "admin" && (
        <Link href={"/admin"} 
          className={`w-full flex items-center px-3 py-4 cursor-pointer ${
            active === 6 ? "dark:bg-slate-800  bg-slate-200" : "bg-transparent"
          }`}
          onClick={() => setActive(6)}
        >
          <MdOutlineAdminPanelSettings
            size={20}
            fill="#fff"
            className="dark:fill-white fill-black"
          />
          <h5 className="pl-2 800px:block hidden font-Poppins font-semibold dark:text-white text-black">
            Admin Dashboard
          </h5>
        </Link>
      )}

      <div
        className={`w-full flex items-center px-3 py-4 cursor-pointer`}
        onClick={() => logOutHandler()}
      >
        <BiLogOut size={20} className="dark:fill-red-500 fill-red-500" />
        <h5 className="pl-2 800px:block hidden font-Poppins dark:text-red-500 text-red-500">
          Log Out
        </h5>
      </div>
    </div>
  );
};

export default SideBarProfile;
