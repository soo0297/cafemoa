import React from 'react';
import { Link } from 'react-router-dom';

const WritingFixBtn = () => {
  return (
    <>
      <button className="fixed bottom-[3%] right-[3%] z-10 w-[80px] h-[80px] bg-black text-white rounded-full cursor-pointer">
        <Link to="/write">글쓰기</Link>
      </button>
    </>
  );
};

export default WritingFixBtn;