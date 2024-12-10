import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="w-14 h-14 border-4 border-t-4 border-gray-300 border-solid rounded-full animate-spin border-t-blue-500"></div>
    </div>
  );
};

export default Loader;
