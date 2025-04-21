import React, { useState } from "react";
import Login from "../Components/Login";
import Signup from "../Components/Signup";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div className="bg-[#131313] min-h-screen w-full flex justify-center items-center">
      {isLogin ? (
        <Login setIsLogin={setIsLogin} />
      ) : (
        <Signup setIsLogin={setIsLogin} />
      )}
    </div>
  );
};

export default Auth;
