import React from 'react';

 const ProgressBar = ({ goal, balance }) => {
  const percentage = (balance / goal) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
};


export default ProgressBar ;