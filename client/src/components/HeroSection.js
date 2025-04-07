import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ArtModal from './ArtModal';

const HeroSection = () => {
  const [selectedArt, setSelectedArt] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;  // Number of items to show at once

  const CARD_WIDTH = 250; // Width of each card
  const GAP = 24;  // Gap between cards
  const totalSlides = Math.max(1, cards.length - cardsPerView + 1); // Calculate total slides
  const offsetX = -(currentIndex * (CARD_WIDTH + GAP)); // Calculate offset for the scroll

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/artworks'); // full URL
        const data = await res.json();
  
        const formatted = data.artworks.map((art) => ({
          ...art,
          images: [`http://localhost:5000${art.image_url}`], // combine backend host + path
          price: `$${parseFloat(art.price).toFixed(2)}`
        }));
  
        setCards(formatted);
      } catch (err) {
        console.error('Error fetching artworks:', err);
      }
    };
  
    fetchCards();
  }, []);
  

  // Handle Next Button Click
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  // Handle Prev Button Click
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <section className="w-full bg-[#D3CABE]">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left Image */}
        <div className="md:w-1/2 w-full h-screen">
          <img
            src="/images/sculpture.png"
            alt="Sculpture"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text + Button + Second Image */}
        <div className="md:w-1/2 w-full flex flex-col">
          {/* Headline & CTA */}
          <div className="flex flex-col justify-center px-6 md:px-16 pt-20 pb-12">
            <h1 className="text-4xl md:text-6xl font-serif font-normal leading-tight mb-6 text-black">
              ARTISTRY IN<br />EVERY<br />AUCTION
            </h1>
            <p className="text-sm md:text-base text-black font-light mb-10 max-w-md">
              Indulge in a world of creativity and sophistication. Our art auctions offer a blend of tradition and innovation, curated for art enthusiasts.
            </p>
            <Link
              to="/explore"
              className="inline-block border border-black px-4 py-2 text-sm text-black hover:bg-black hover:text-white transition"
            >
              Explore Now
            </Link>
          </div>

          {/* Second Image (Couch) */}
          <div className="w-full h-[80%]">
            <img
              src="/images/frame.png"
              alt="Couch"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Art Carousel Section */}
      <div className="px-6 md:px-16 py-16 bg-[#D3CABE]">
        <h2 className="text-3xl md:text-4xl font-serif text-black mb-10">Trending Now</h2>

        <div className="relative overflow-hidden">
  {/* Prev Button */}
  <button
    onClick={handlePrev}
    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black text-white p-2 rounded-full shadow hover:bg-gray-800"
  >
    <FaChevronLeft />
  </button>

  {/* Scrollable Card Track */}
  <div
    className="flex gap-6 transition-transform duration-500 ease-in-out"
    style={{
      transform: `translateX(${offsetX}px)`,
      width: 'max-content',
    }}
  >
    {cards.map((art, index) => (
      <div
        key={index}
        className="w-[250px] shrink-0 bg-black text-white p-4 rounded shadow-lg flex flex-col h-[450px]"
      >
        {/* Image */}
        <img
          src={art.images[0]}
          alt={art.title}
          className="w-full h-[300px] object-cover mb-4 rounded"
        />

        {/* Title + Price + Button */}
        <div className="flex flex-col justify-between flex-grow">
          {/* Title + Price */}
          <div>
            <h3 className="text-base font-serif font-semibold mb-1 break-words">{art.title}</h3>
            <p className="text-sm mb-3">{art.price}</p>
          </div>

          {/* Details Button */}
          <button
            onClick={() => setSelectedArt(art)}
            className="mt-auto border border-white px-3 py-1 text-xs font-light hover:bg-white hover:text-black transition duration-300 ease-in-out w-fit self-start"
          >
            Details
          </button>
        </div>
      </div>
    ))}
  </div>

  {/* Next Button */}
  <button
    onClick={handleNext}
    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black text-white p-2 rounded-full shadow hover:bg-gray-800"
  >
    <FaChevronRight />
  </button>
</div>

      </div>

      {/* Modal for Selected Artwork */}
      <ArtModal
        isOpen={selectedArt !== null}
        onClose={() => setSelectedArt(null)}
        art={selectedArt}
      />
    </section>
  );
};

export default HeroSection;
