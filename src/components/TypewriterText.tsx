import { useState, useEffect } from "react";

const TypewriterText = () => {
  const texts = [
    "Discover curated events, exclusive offers, and unforgettable moments",
    "Connect with like-minded people through amazing experiences",
    "Book tickets seamlessly and create lasting memories",
    "Explore concerts, conferences, sports, and cultural events",
    "Join thousands of event enthusiasts in your city"
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [typingSpeed, setTypingSpeed] = useState(30);

  useEffect(() => {
    const handleTyping = () => {
      const fullText = texts[currentTextIndex];

      if (currentText.length < fullText.length) {
        // Typing
        setCurrentText(fullText.substring(0, currentText.length + 1));
        setTypingSpeed(30);
      } else {
        // Finished typing, wait 3-4 seconds then vanish and move to next
        setTimeout(() => {
          setCurrentText("");
          setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }, 3500);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, currentTextIndex, typingSpeed, texts]);

  return (
    <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto h-16 flex items-center justify-center">
      {currentText}
    </p>
  );
};

export default TypewriterText;
