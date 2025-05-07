import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ArtModal from './ArtModal';
import { supabase } from '../supabaseClient';

const HeroSection = () => {
  const [selectedArt, setSelectedArt] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;
  const CARD_WIDTH = 250;
  const GAP = 24;
  const visibleCards = Math.min(cardsPerView, cards.length);
  const maxScroll = cards.length - visibleCards;
  const offsetX = -(currentIndex * (CARD_WIDTH + GAP));

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    const { data: artworks, error } = await supabase
      .from('trending')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && artworks.length > 0) {
      const formatted = artworks.map((art) => ({
        id: art.id,
        title: art.title,
        image_url: art.image_url,
        images: [art.image_url],
        price: `$${parseFloat(art.starting_price).toFixed(2)}`,
        end_time: art.end_time ? new Date(art.end_time) : null,
        description: art.description,
        starting_price: art.starting_price
      }));
      setCards(formatted);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxScroll ? 0 : Math.min(prev + 1, maxScroll)));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxScroll : Math.max(prev - 1, 0)));
  };

  return (
    <section className="w-full bg-[#D3CABE]">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left: Sculpture + How It Works */}
        <div className="md:w-1/2 w-full flex flex-col">
          <div className="h-1/2">
            <img
              src="/Images/Sculpture.png"
              alt="Sculpture"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-1/2 bg-[#D3CABE] flex flex-col justify-center items-center px-6 md:px-12">
            <div className="max-w-xl space-y-6">
              <span className="text-sm tracking-wider text-black/60 uppercase">Get Started</span>
              <h2 className="text-4xl font-serif mb-4">How It Works</h2>
              <div className="w-20 h-1 bg-black/20"></div>
              <p className="text-base font-light">
                <strong>Auctions:</strong> Bid on exclusive artwork in real-time and win ownership with the highest bid.
              </p>
              <p className="text-base font-light">
                <strong>Gallery:</strong> Prefer to buy now? Browse our curated selection and purchase instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Hero Text + CTA + Couch Image */}
        <div className="md:w-1/2 w-full flex flex-col">
          <div className="flex flex-col justify-center px-6 md:px-16 pt-20 pb-12">
            <h1 className="text-4xl md:text-6xl font-serif font-normal leading-tight mb-6 text-black">
              ARTISTRY IN<br />EVERY<br />AUCTION
            </h1>
            <p className="text-sm md:text-base text-black font-light mb-10 max-w-md">
              Indulge in a world of creativity and sophistication. Our art auctions offer a blend of tradition and innovation, curated for art enthusiasts.
            </p>
            <Link to="/explore" className="inline-block">
              <button className="text-lg px-6 py-3 bg-[#8B7355] text-white font-medium rounded-md shadow hover:bg-[#6B563D] hover:shadow-lg hover:scale-105 transition-all duration-200">
                Explore Now
              </button>
            </Link>
          </div>
          <div className="w-full h-[80%]">
            <img
              src="/Images/frame.png"
              alt="Frame"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="py-16 bg-[#D3CABE]">
        <h2 className="text-3xl md:text-4xl font-serif text-black mb-10 pl-6">Trending Now</h2>
        <div className="relative mx-auto px-16 pb-12 pt-8 bg-[#C5BDB3] max-w-[1400px]">
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black text-white p-2 rounded-full shadow hover:bg-gray-800"
          >
            <FaChevronLeft />
          </button>

          <div className="overflow-hidden mx-4">
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(${offsetX}px)`, width: 'max-content' }}
            >
              {cards.map((art, index) => (
                <div
                  key={index}
                  className="w-[250px] shrink-0 bg-black text-white p-6 rounded shadow-lg flex flex-col h-[450px]"
                >
                  <img
                    src={art.image_url || '/Images/placeholder-art.jpg'}
                    alt={art.title}
                    className="w-full h-[300px] object-cover mb-4 rounded"
                    onError={(e) => (e.target.src = '/Images/placeholder-art.jpg')}
                  />
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="text-base font-serif font-semibold mb-1 break-words">{art.title}</h3>
                      <p className="text-sm mb-3">{art.price}</p>
                    </div>
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
          </div>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black text-white p-2 rounded-full shadow hover:bg-gray-800"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Art Modal */}
      <ArtModal
        isOpen={selectedArt !== null}
        onClose={() => setSelectedArt(null)}
        art={selectedArt}
      />
    </section>
  );
};

export default HeroSection;
