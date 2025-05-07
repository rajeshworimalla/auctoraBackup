import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ArtModal from './ArtModal';
import { supabase } from '../supabaseClient';

const HeroSection = () => {
  const [selectedArt, setSelectedArt] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;  // Number of items to show at once

  const CARD_WIDTH = 250; // Width of each card
  const GAP = 24;  // Gap between cards
  
  // Calculate visible cards and maximum scroll position
  const visibleCards = Math.min(cardsPerView, cards.length);
  const maxScroll = cards.length - visibleCards;
  const offsetX = -(currentIndex * (CARD_WIDTH + GAP));

  useEffect(() => {
    console.log({
      totalCards: cards.length,
      visibleCards,
      maxScroll,
      currentIndex,
      offsetX
    });
  }, [cards.length, visibleCards, maxScroll, currentIndex, offsetX]);

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase
          .from('trending')
          .select('count')
          .single();
        
        console.log('Connection test result:', { data, error });
      } catch (err) {
        console.error('Connection test error:', err);
      }
    };

    testConnection();
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      console.log('Fetching artworks from Supabase...');
      // Simplified query - just fetch artworks first
      const { data: artworks, error } = await supabase
        .from('trending')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Raw artworks data:', artworks);

      if (error) {
        throw error;
      }

      if (!artworks || artworks.length === 0) {
        console.log('No artworks found in the database');
        return;
      }

      // Format the data
      const formatted = artworks.map((art) => {
        console.log('Processing artwork:', art);
        return {
        id: art.id,
        title: art.title,
          image_url: art.image_url,
        images: [art.image_url],
        price: `$${parseFloat(art.starting_price).toFixed(2)}`,
        end_time: art.end_time ? new Date(art.end_time) : null,
        description: art.description,
        starting_price: art.starting_price
        };
      });

      console.log('Formatted artworks:', formatted);
      setCards(formatted);
    } catch (err) {
      console.error('Error details:', err);
    }
  };

  // Handle Next Button Click
  const handleNext = () => {
    console.log('Next clicked:', { currentIndex, maxScroll });
    
    if (currentIndex >= maxScroll) {
      console.log('Resetting to start');
      setCurrentIndex(0);
    } else {
      const nextIndex = Math.min(currentIndex + 1, maxScroll);
      console.log('Moving to index:', nextIndex);
      setCurrentIndex(nextIndex);
    }
  };

  // Handle Prev Button Click
  const handlePrev = () => {
    console.log('Prev clicked:', { currentIndex, maxScroll });
    
    if (currentIndex <= 0) {
      console.log('Moving to end');
      setCurrentIndex(maxScroll);
    } else {
      const prevIndex = Math.max(currentIndex - 1, 0);
      console.log('Moving to index:', prevIndex);
      setCurrentIndex(prevIndex);
    }
  };

  return (
    <section className="w-full bg-[#D3CABE]">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left Image */}
        <div className="md:w-1/2 w-full h-screen">
          <img
            src="/Images/Sculpture.png"
            alt="Sculpture"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text + Button + Second Image + How It Works Section */}
        <div className="md:w-1/2 w-full flex flex-col">
          {/* Headline & CTA */}
          <div className="flex flex-col justify-center px-6 md:px-16 pt-20 pb-12">
            <h1 className="text-4xl md:text-6xl font-serif font-normal leading-tight mb-6 text-black">
              ARTISTRY IN<br />EVERY<br />AUCTION
            </h1>
            <p className="text-sm md:text-base text-black font-light mb-10 max-w-md">
              Indulge in a world of creativity and sophistication. Our art auctions offer a blend of tradition and innovation, curated for art enthusiasts.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <Link
                to="/explore"
                className="inline-block"
              >
                <button className="text-xl px-8 py-4 bg-gradient-to-r from-[#8B7355] to-[#D3CABE] text-white font-bold rounded-full shadow-lg hover:scale-105 hover:from-[#6B563D] transition-all duration-200">
                  Explore Now
                </button>
              </Link>
              <a
                href="#who-we-are"
                className="inline-block"
              >
                <button className="text-xl px-8 py-4 bg-gradient-to-r from-[#D3CABE] to-[#8B7355] text-white font-bold rounded-full shadow-lg hover:scale-105 hover:to-[#6B563D] transition-all duration-200">
                  Meet Our Team
                </button>
              </a>
            </div>
          </div>

          {/* Second Image (Couch) + How It Works Section */}
          <div className="w-full h-[80%] flex flex-col md:flex-row items-stretch">
            <div className="md:w-1/2 w-full h-full">
              <img
                src="/Images/frame.png"
                alt="Frame"
                className="w-full h-full object-contain"
              />
            </div>
            {/* How It Works Section */}
            <div id="how-it-works" className="md:w-1/2 w-full flex flex-col justify-center items-center p-8 md:p-12 bg-[#D3CABE] border-l border-black">
              <div className="max-w-xl space-y-8">
                <div className="space-y-2">
                  <span className="text-sm tracking-wider text-black/60 uppercase">Get Started</span>
                  <h2 className="text-5xl mb-4 font-serif leading-tight">How It Works</h2>
                  <div className="w-20 h-1 bg-black/20"></div>
                </div>
                <h4 className="text-xl font-medium text-black/80 tracking-wide">Your Guide to Bidding & Buying</h4>
                <ul className="space-y-4 text-base font-light leading-relaxed list-disc list-inside">
                  <li>Browse trending art and discover unique pieces.</li>
                  <li>Register or log in to place bids or buy instantly.</li>
                  <li>Participate in live auctions or purchase from the gallery.</li>
                  <li>Track your bids, wins, and purchases in your profile.</li>
                  <li>Enjoy secure transactions and fast delivery.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Art Carousel Section */}
      <div className="py-16 bg-[#D3CABE]">
        <h2 className="text-3xl md:text-4xl font-serif text-black mb-10 pl-6">Trending Now</h2>

        <div className="relative mx-auto px-16 pb-12 pt-8 bg-[#C5BDB3] max-w-[1400px]">
          {/* Prev Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black text-white p-2 rounded-full shadow hover:bg-gray-800"
          >
            <FaChevronLeft />
          </button>

          <div className="overflow-hidden mx-4">
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(${offsetX}px)`,
                width: 'max-content',
              }}
            >
              {cards.map((art, index) => {
                console.log('Rendering card:', art);
                const imageUrl = art.image_url || (art.images && art.images[0]) || '/Images/placeholder-art.jpg';
                console.log('Using image URL:', imageUrl);
                return (
                <div
                  key={index}
                  className="w-[250px] shrink-0 bg-black text-white p-6 rounded shadow-lg flex flex-col h-[450px]"
                >
                  <img
                      src={imageUrl}
                    alt={art.title}
                    className="w-full h-[300px] object-cover mb-4 rounded"
                      onError={(e) => {
                        console.log('Image failed to load:', imageUrl);
                        e.target.src = '/Images/placeholder-art.jpg';
                      }}
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
                );
              })}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black text-white p-2 rounded-full shadow hover:bg-gray-800"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <section className="bg-[#D3CABE] text-black font-serif">

        {/* Section 1: About Us (Text Left, Image Right) */}
        <div id="about" className="flex flex-col lg:flex-row h-[90vh]">
          <div className="lg:w-1/2 w-full flex flex-col justify-center items-center p-8 lg:p-20 bg-[#D3CABE]">
            <div className="max-w-xl space-y-8">
              <div className="space-y-2">
                <span className="text-sm tracking-wider text-black/60 uppercase">Our Story</span>
                <h2 className="text-6xl mb-4 font-serif leading-tight">About Us</h2>
                <div className="w-20 h-1 bg-black/20"></div>
              </div>
              <h4 className="text-xl font-medium text-black/80 tracking-wide">Where Art Meets Innovation</h4>
              <div className="space-y-6 text-base font-light leading-relaxed">
                <p>
                  Auctora isn't your average auction house — because average is boring and we don't do boring. We're a bold platform built for artists, collectors, and curious scrollers who think "maybe I do have an eye for this."
                </p>
                <p>
                  Whether you're a first-time bidder or a seasoned connoisseur, you'll find a space here that's as inspiring as the art itself.
                </p>
                <p className="italic text-black/75">
                  Real artists. Real collectors. Real drama (but the good kind — the bidding kind).
                </p>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 w-full h-full">
            <img
              src="/Images/AboutUs1.jpg"
              alt="About Section Visual"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Section 2: Mission Statement (Image Left, Text Right) */}
        <div className="flex flex-col lg:flex-row h-[90vh]">
          <div className="lg:w-1/2 w-full h-full">
            <img
              src="/Images/AboutUs3.jpg"
              alt="Mission Section Visual"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:w-1/2 w-full flex flex-col justify-center items-center p-8 lg:p-20 bg-[#D3CABE]">
            <div className="max-w-xl space-y-8">
              <div className="space-y-2">
                <span className="text-sm tracking-wider text-black/60 uppercase">Our Purpose</span>
                <h2 className="text-6xl mb-4 font-serif leading-tight">Mission Statement</h2>
                <div className="w-20 h-1 bg-black/20"></div>
              </div>
              <h4 className="text-xl font-medium text-black/80 tracking-wide">Redefining Art Access</h4>
              <div className="space-y-6 text-base font-light leading-relaxed">
                <p>
                  Our mission is simple: shake up the art world without spilling the paint. We're here to connect creators and collectors through a fair, beautiful, and occasionally fierce auction experience.
                </p>
                <p>
                  No elitist gatekeeping. No stuffy gallery silence. Just authentic art, honest bidding, and a whole lot of passion.
                </p>
                <p className="italic text-black/75">
                  We're building a platform where art meets everyone — no velvet rope required.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Who We Are (Text Left, Custom Size Image Grid Right) */}
        <div className="flex flex-col lg:flex-row h-[90vh]">
          {/* Text Column */}
          <div className="lg:w-1/2 w-full flex flex-col justify-center items-center p-8 lg:p-20 bg-[#D3CABE]">
            <div className="max-w-xl space-y-8">
              <div className="space-y-2">
                <span className="text-sm tracking-wider text-black/60 uppercase">Our Team</span>
                <h2 className="text-6xl mb-4 font-serif leading-tight">Who We Are</h2>
                <div className="w-20 h-1 bg-black/20"></div>
              </div>
              <h4 className="text-xl font-medium text-black/80 tracking-wide">The Creative Force</h4>
              <div className="space-y-6 text-base font-light leading-relaxed">
                <p>
                  We're students, creatives, caffeine-powered coders, and design nerds who believe the art world needs a little...redecoration.
                </p>
                <p>
                  From the front-end to the frame, our team brings together bold ideas and an even bolder love for creativity.
                </p>
                <p className="italic text-black/75 mb-10">
                  We don't just run an art platform — we breathe it, build it, and sometimes lose sleep over it (usually around 2:00 AM, when the last bug decides to throw a tantrum.
                </p>
              </div>
              <Link
                to="/about"
                className="inline-block border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition"
              >
                Meet Our Team
              </Link>
            </div>
          </div>

          {/* Image Grid Column with dynamic layout */}
          <div className="lg:w-1/2 w-full h-full">
            <div className="grid grid-cols-12 grid-rows-12 h-full relative">
              {/* Large square image - top left */}
              <div className="col-span-6 row-span-6 border-t-[3px] border-l-[3px] border-b-[1.5px] border-r-[1.5px] border-black">
                <img 
                  src="/Images/AboutUs.jpg" 
                  alt="Raj" 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              {/* Rectangle - top right */}
              <div className="col-span-6 row-span-3 col-start-7 border-t-[3px] border-r-[3px] border-b-[1.5px] border-l-[1.5px] border-black">
                <img 
                  src="/Images/AboutUs.jpg" 
                  alt="Smera" 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              {/* Small square - bottom left */}
              <div className="col-span-3 row-span-6 row-start-7 border-t-[1.5px] border-l-[3px] border-b-[3px] border-r-[1.5px] border-black">
                <img 
                  src="/Images/AboutUs.jpg" 
                  alt="Mausham" 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Small rectangle - middle bottom */}
              <div className="col-span-3 row-span-6 col-start-4 row-start-7 border-t-[1.5px] border-l-[1.5px] border-b-[3px] border-r-[1.5px] border-black">
                <img 
                  src="/Images/AboutUs.jpg" 
                  alt="Nima" 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              {/* Tall rectangle - bottom right */}
              <div className="col-span-6 row-span-9 col-start-7 row-start-4 border-t-[1.5px] border-r-[3px] border-b-[3px] border-l-[1.5px] border-black">
                <img 
                  src="/Images/AboutUs.jpg" 
                  alt="Utsav" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </div>

      </section>

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
