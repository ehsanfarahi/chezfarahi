import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa"

import { useEffect, useState } from "react";

export default function SocialMedias() {


 const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fade = Math.max(1 - scrollY / 300, 0.2);
      setOpacity(fade);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


    return (
      <SocialMedia>
        <span
          style={{ opacity }}
          className="fixed left-8 bottom-10 gap-6 flex flex-col text-3xl rounded-3xl
    bg-white/20 backdrop-blur-xl
    border border-white/30
    shadow-lg
    transition-all duration-300
    hover:bg-white/30 hover:scale-110 group px-3 py-4 max-sm:px-2 max-sm:py-3"
        >
          <FaInstagram className="cursor-pointer" />
          <FaFacebookF className="cursor-pointer" />
          <FaTiktok className="cursor-pointer" />
        </span>
      </SocialMedia>
    );
}

function SocialMedia({children}) { 
    return children;
}