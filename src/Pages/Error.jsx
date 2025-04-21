import React from "react";

const Error = () => {
  return (
    <div className="h-screen w-full bg-[#131313] flex flex-col justify-center items-center">
      <h1 className="text-white text-4xl">Not Found</h1>
      <p className="text-white/70 font-light mt-2">
        Check the Url you've typed
      </p>
    </div>
  );
};

export default Error;
