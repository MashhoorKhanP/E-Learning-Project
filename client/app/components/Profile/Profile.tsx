"use client";
import { useState } from "react";
import SideBarProfile from "./SideBarProfile";
import { useLogOutQuery } from "@/redux/features/auth/authApi";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import ProfileInfo from "./ProfileInfo";
import ChangePassword from "./ChangePassword";

type Props = {
  user: any;
};

const Profile = ({ user }: Props) => {
  const [scroll, setScroll] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [active, setActive] = useState(1);
  const [logout, setLogout] = useState(false);
  const {isSuccess} = useLogOutQuery( undefined, {
    skip: !logout ? true : false
  })
  const logOutHandler = async () => {
    setLogout(true);
    await signOut();
    if(isSuccess) {
      toast.success("Logged out successfully!");
    }
  };

  // if (typeof window !== "undefined") {
  //   window.addEventListener("scroll", () => {
  //     if (window.scrollY > 85) {
  //       setScroll(true);
  //     } else {
  //       setScroll(false);
  //     }
  //   });
  // }

  return (
    <div className="w-[85%] flex mx-auto">
      <div
        className={`w-[60px] 800px:w-[310px] h-[450px] dark:bg-slate-900 bg-white bg-opacity-90 border dark:border-[#ffffff1d] border-[#ffffff12d] rounded-[5px] shadow-md dark:shadow-sm mt-[80px] mb-[80px] sticky ${
          scroll ? "top-[120px]" : "top-[30px]"
        } left-[30px]`}
      >
        <SideBarProfile
          user={user}
          active={active}
          avatar={avatar}
          setActive={setActive}
          logOutHandler={logOutHandler}
        />
      </div>
        {active ===1 && (
          <div className="w-full h-full bg-transparent mt-[80px] ">
            <ProfileInfo user={user} avatar={avatar}/>
          </div>
        )}
        {active ===2 && user.isVerified === false &&
  (
          <div className="w-full h-full bg-transparent mt-[80px] ">
            <ChangePassword />
          </div>
        )}
    </div>
  );
};

export default Profile;
