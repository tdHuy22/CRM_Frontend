import Logo from "../../assets/LOGO.png";
import { useEffect, useState, memo, useCallback } from "react";
import { NavLink } from "react-router-dom";
import UserProfile from "../account/userProfile";
import { useAuth } from "../../controller/authController";
import { MdOutlineManageAccounts } from "react-icons/md";
import { LiaHomeSolid } from "react-icons/lia";

export default memo(function HeaderUser() {
  const { currentUser } = useAuth();
  const navLinkClass = useCallback(
    ({ isActive }) => (isActive ? "text-red-500" : "text-white"),
    []
  );
  const [role, setRole] = useState();

  useEffect(() => {
    if (currentUser) {
      currentUser.getIdTokenResult().then((idTokenResult) => {
        const { role } = idTokenResult.claims;
        setRole(role);
      });
    }
  }, [currentUser]);

  return (
    <header className=" bg-uit h-20 text-white flex items-center justify-between p-4">
      <div className="flex items-center">
        <div className="mr-8">
          <NavLink to={`/${role}`}>
            <img src={Logo} alt="LOGO" className="h-12 w-auto" />
          </NavLink>
        </div>
        <div className="flex flex-col text-xs lg:text-base font-bold uppercase">
          <div className="hidden sm:block text-lg">
            Hệ thống quản lý sinh viên
          </div>
          <div className="block sm:hidden text-xs">
            Hệ thống quản lý sinh viên
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center flex-grow">
        <nav className="text-xs lg:text-base font-bold flex space-x-6">
          <NavLink to={`/${role}/course`} className={navLinkClass}>
            <span className="hidden sm:inline">Môn học</span>
            <LiaHomeSolid className="inline sm:hidden" size={30} />
          </NavLink>
          <NavLink to={`/${role}/account`} className={navLinkClass}>
            <span className="hidden sm:inline">Tài khoản</span>
            <MdOutlineManageAccounts className="inline sm:hidden" size={30} />
          </NavLink>
        </nav>
      </div>
      <div className="hidden sm:flex items-center space-x-4">
        <div>
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="rounded-full pl-4 pr-8 py-1 text-black"
            aria-label="Tìm kiếm"
          />
        </div>
        <div>
          <NavLink to={`/${role}`}>
            <UserProfile />
          </NavLink>
        </div>
      </div>
    </header>
  );
});
