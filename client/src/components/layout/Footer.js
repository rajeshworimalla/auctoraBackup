import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#D3CABE] text-black px-6 md:px-16 py-12 font-serif">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
      <div className="flex items-center space-x-3">
            <img 
                src="/images/logo.png" 
                alt="Auctora Logo" 
                className="w-50 h-auto object-contain"
            />
        </div>

        <div className="space-y-2">
          <p>123-456-7890</p>
          <p>poudelutsav65@gmail.com</p>
          <div className="pt-2">
            <p>1700 SW College Avenue</p>
            <p>Topeka, Kansas, 66604</p>
          </div>
          <div className="flex space-x-4 pt-8">
            <a href="#" className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
              <span className="text-black text-xs">f</span>
            </a>
            <a href="#" className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
              <span className="text-black text-xs">in</span>
            </a>
            <a href="#" className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
              <span className="text-black text-xs">x</span>
            </a>
            <a href="#" className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
              <span className="text-black text-xs">tik</span>
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <p><a href="#" className="hover:underline">Privacy Policy</a></p>
          <p><a href="#" className="hover:underline">Accessibility</a></p>
          <p><a href="#" className="hover:underline">Statement</a></p>
          <p><a href="#" className="hover:underline">Shipping Policy</a></p>
          <p><a href="#" className="hover:underline">Terms & Conditions</a></p>
          <p><a href="#" className="hover:underline">Refund Policy</a></p>
        </div>

        <div>
          <h4 className="font-light mb-2">Stay Connected with Us</h4>
          <div className="flex">
            <input 
              type="email" 
              placeholder="Enter your email here *" 
              className="bg-transparent border-b border-black flex-grow outline-none text-sm py-1 placeholder-black"
            />
            <button className="ml-4 text-sm underline hover:no-underline">Submit</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
