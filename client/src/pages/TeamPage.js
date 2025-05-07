import React from 'react';

const teamMembers = [
  { name: 'Raj', role: 'Lead Developer', img: '/Images/AboutUs.jpg' },
  { name: 'Smera', role: 'UI/UX Designer', img: '/Images/AboutUs.jpg' },
  { name: 'Mausham', role: 'Backend Engineer', img: '/Images/AboutUs.jpg' },
  { name: 'Nima', role: 'Frontend Engineer', img: '/Images/AboutUs.jpg' },
  { name: 'Utsav', role: 'Product Manager', img: '/Images/AboutUs.jpg' },
];

const TeamPage = () => (
  <section className="min-h-screen bg-[#D3CABE] py-16 px-4 md:px-16 font-serif">
    <div className="max-w-5xl mx-auto text-center mb-16">
      <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-black">Meet Our Team</h1>
      <p className="text-lg md:text-xl text-black/70 font-light max-w-2xl mx-auto">
        The creative minds and passionate builders behind Auctora. We blend art, code, and a love for innovation to bring you a unique auction experience.
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
      {teamMembers.map((member, idx) => (
        <div key={idx} className="bg-white/80 rounded-2xl shadow-lg p-8 flex flex-col items-center border border-black/10 hover:scale-105 transition-transform duration-200">
          <img
            src={member.img}
            alt={member.name}
            className="w-32 h-32 object-cover rounded-full border-4 border-[#8B7355] mb-6 shadow-md"
          />
          <h3 className="text-2xl font-semibold text-black mb-2">{member.name}</h3>
          <p className="text-base text-black/70 font-light">{member.role}</p>
        </div>
      ))}
    </div>
  </section>
);

export default TeamPage; 