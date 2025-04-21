import React, { useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import secrets from "../../secrets";
import { CgSpinner } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import { showToast } from "../Utils/toast";

const { backendUrl } = secrets;

const Login = ({ setIsLogin }) => {
  const navigate = useNavigate();
  const [isProgress, setIsProgress] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProgress(true);

    if (!data.email || !data.password) {
      showToast("Please fill all the fields", "error");
      setIsProgress(false);
      return;
    }

    try {
      const options = {
        method: "POST",
        url: `${backendUrl}/user/login`,
        headers: { "Content-Type": "application/json" },
        data: {
          email: data.email,
          password: data.password,
        },
        useCredentials: true,
      };
      const response = await axios(options);
      console.log(response.data);
      if (response.data.status === "success") {
        setData({
          email: "",
          password: "",
        });
        cookie.set("token", response.data.token, { expires: 1 });
        cookie.set("name", response.data.name, { expires: 1 });
        navigate("/booking");
      }
      showToast("Login successful", "success");
    } catch (error) {
      showToast(error.response.data.error || "Something failed", "error");
    } finally {
      setIsProgress(false);
    }
  };

  return (
    <div className="border border-white/30 p-4 md:p-5 rounded-lg min-h-[50vh] w-full sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] 2xl:w-[20%] mx-auto">
      <h3 className="text-white font-bold text-lg md:text-xl">Login</h3>
      <p className="text-white/70 font-medium text-sm md:text-base mt-1">
        Continue with your email
      </p>
      <div className="w-full flex flex-col items-center gap-5 md:gap-7 my-5 md:my-7">
        <input
          className="bg-transparent w-full border-b-[1px] outline-none border-white/20 focus:border-white/50 text-white py-2 transition-all duration-300"
          type="text"
          placeholder="Email"
          autoFocus
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
        duration-300 hover:bg-[#0062cc] text-sm md:text-base"
          onClick={handleSubmit}
          disabled={isProgress}
        >
          {isProgress ? (
            <CgSpinner className="animate-spin mx-auto text-xl" />
          ) : (
            "Login"
          )}
        </button>
        <p
          className="text-xs md:text-sm text-white/90 w-fit font-light hover:text-white/50 hover:cursor-pointer transition-all duration-300"
          onClick={() => setIsLogin(false)}
        >
          Don't have an account? Signup
        </p>
      </div>
    </div>
  );
};

export default Login;
