"use client";
import { ChangeEvent, useEffect, useState } from "react";
import avatarIcon from "../../../public/assets/avatar.png";
import Image from "next/image";
import { AiOutlineCamera } from "react-icons/ai";
import { styles } from "@/app/styles/style";
import {
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
} from "@/redux/features/user/userApi";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import toast from "react-hot-toast";

type Props = {
  user: any;
  avatar: string | null;
};

const ProfileInfo = ({ user, avatar }: Props) => {
  const [name, setName] = useState(user && user.name);
  const [profilePicture, setProfilePicture] = useState(user.avatar || avatar ? user.avatar.url || avatar : avatarIcon);
  const [updateAvatar, { isSuccess, error, data }] = useUpdateAvatarMutation();
  const [
    editProfile,
    { isSuccess: updateSuccess, error: updateError, data: updateData },
  ] = useUpdateProfileMutation();
  const [loadUser, setLoadUser] = useState(false);
  const {} = useLoadUserQuery(undefined, { skip: loadUser ? false : true });

  const imageHandler = async (e: any) => {
    const fileReader = new FileReader();

    fileReader.onload = async () => {
      if (fileReader.readyState === 2) {
        const avatar = fileReader.result;
        await updateAvatar(avatar);
      }
    };
    fileReader.readAsDataURL(e.target.files[0]);
  };

  useEffect(() => {
    if (isSuccess || updateSuccess) {
      const message = data?.message || "Updated Successfully!";
      toast.success(message, { duration: 3000 });
      setLoadUser(true);
      if(updateData) {
        setName(updateData.user.name)
      }
      if(data) {
        setProfilePicture(data.user.avatar.url);
      }
    }
    if (error || updateError) {
      console.log(error);
    }
  }, [isSuccess, error, updateSuccess, updateError]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (name !== "") {
      await editProfile({
        name: name
      });
    }
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="relative">
          <Image
            src={profilePicture}
            alt=""
            width={120}
            height={120}
            className="cursor-pointer w-[120px] h-[120px] object-contain border-[3px] border-[#37a39a] rounded-full"
          />
          <input
            type="file"
            name=""
            id="avatar"
            className="hidden"
            onChange={imageHandler}
            accept="image/png,image/jpeg,image/jpg,image/webp"
          />
          <label htmlFor="avatar">
            <div className="w-[30px] h-[30px] bg-slate-900 rounded-full absolute bottom-2 right-2 flex items-center justify-center cursor-pointer">
              <AiOutlineCamera size={20} className="z-10" />
            </div>
          </label>
        </div>
      </div>
      <br />
      <br />
      <div className="w-full pl-6 800px:pl-10">
        <form onSubmit={handleSubmit}>
          <div className="800px:w-[50%] m-auto block pb-4">
            <div className="w-[100%] ">
              <label className="block dark:text-white text-black">
                Full name
              </label>
              <input
                type="text"
                className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="w- [100%] pt-2">
              <label className="block dark:text-white text-black">
                Email Address
              </label>
              <input
                type="text"
                readOnly
                className={`${styles.input} !w-[95%] mb-1 800px:mb-0`}
                required
                value={user?.email}
              />
            </div>
            <input
              className={`w-full 800px:w- [250px] h-[40px] border-2 border-[#37a39a] hover:bg-[#37a39a] text-center font-bold dark:text-[#fff] text-black rounded-[3px] mt-8 cursor-pointer`}
              required
              value="UPDATE"
              type="submit"
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default ProfileInfo;
