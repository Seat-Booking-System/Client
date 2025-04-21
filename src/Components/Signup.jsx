import React, { useState } from "react";
import secrets from "../../secrets.js";
import { showToast } from "../Utils/toast";
import axios from "axios";
import cookie from "js-cookie";
import { CgSpinner } from "react-icons/cg";
import { useNavigate } from "react-router-dom";

const { backendUrl } = secrets;

const Signup = ({ setIsLogin }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isProgress, setIsProgress] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name || !data.email || !data.password) {
      showToast("Please fill all the fields", "error");
      return;
    }

    setIsProgress(true);

    try {
      const options = {
        method: "POST",
        url: `${backendUrl}/user/signup`,
        data: data,
        headers: {
          "Content-Type": "application/json",
        },
        useCredentials: true,
      };

      const response = await axios(options);
      console.log(response.data);
      showToast(response.data.message, response.data.status);
      if (response.data.status === "success") {
        setData({
          name: "",
          email: "",
          password: "",
        });
        cookie.set("token", response.data.token, { expires: 1 });
        cookie.set("name", response.data.name, { expires: 1 });
        navigate("/booking");
      }
    } catch (error) {
      console.error(error);
      showToast(error.response.data.error || "Error", "error");
    } finally {
      setIsProgress(false);
    }
  };

  return (
    <div className="border border-white/30 p-4 md:p-5 rounded-lg min-h-[50vh] w-full sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] 2xl:w-[20%] mx-auto">
      <h3 className="text-white font-bold text-lg md:text-xl">Signup</h3>
      <p className="text-white/70 font-medium text-sm md:text-base mt-1">
        Create a new account
      </p>
      <div className="w-full flex flex-col items-center gap-5 md:gap-7 my-5 md:my-7">
        <input
          className="bg-transparent w-full border-b-[1px] outline-none border-white/20 focus:border-white/50 text-white py-2 transition-all duration-300"
          type="text"
          placeholder="Name"
          autoFocus
          name="name"
          value={data.name}
          onChange={handleChange}
        />
        <input
          className="bg-transparent w-full border-b-[1px] outline-none border-white/20 focus:border-white/50 text-white py-2 transition-all duration-300"
          type="text"
          placeholder="Email"
          name="email"
          value={data.email}
          onChange={handleChange}
        />
        <div className="relative w-full">
          <input
            className="bg-transparent w-full border-b-[1px] outline-none border-white/20 focus:border-white/50 text-white py-2 transition-all duration-300"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            name="password"
            value={data.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 text-sm md:text-base"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button
          className="bg-[#0071eb] w-full text-white py-2 rounded-md transition-all
      duration-300 hover:bg-[#0062cc] flex items-center justify-center text-sm md:text-base"
          onClick={handleSubmit}
          disabled={isProgress}
        >
          {isProgress ? (
            <CgSpinner className="animate-spin text-lg md:text-xl" />
          ) : (
            <p>Register</p>
          )}
        </button>
        <p
          className="text-xs md:text-sm text-white/90 w-fit font-light hover:text-white/50 hover:cursor-pointer transition-all duration-300"
          onClick={() => setIsLogin(true)}
        >
          Already have an account? Login
        </p>
      </div>
    </div>
  );
};

export default Signup;
