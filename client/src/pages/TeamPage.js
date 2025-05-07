import React from 'react';

const teamMembers = [
  { name: 'Raj', role: 'Lead Developer', img: '/Images/AboutUs.jpg' },
  { name: 'Smera', role: 'UI/UX Designer', img: '/Images/AboutUs.jpg' },
  { name: 'Mausham', role: 'Backend Engineer', img: '/Images/AboutUs.jpg' },
  { name: 'Nima', role: 'Frontend Engineer', img: '/Images/AboutUs.jpg' },
  { name: 'Utsav', role: 'Product Manager', img: '/Images/AboutUs.jpg' },
];

const TeamPage = () => (
  <section className="min-h-screen bg-[#D3CABE] py-8 px-4 md:px-16 font-serif">
    <div className="max-w-5xl mx-auto text-center mb-8">
      <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-black">Meet Our Team</h1>
      <p className="text-lg md:text-xl text-black/70 font-light max-w-2xl mx-auto">
        The creative minds and passionate builders behind Auctora. We blend art, code, and a love for innovation to bring you a unique auction experience.
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {teamMembers.map((member, idx) => (
        <div key={idx} className="bg-white/80 rounded-lg shadow-md p-6 flex flex-col items-center border border-black/10 hover:shadow-lg transition-shadow duration-200">
          <img
            src={member.img}
            alt={member.name}
            className="w-24 h-24 object-cover rounded-full border-2 border-[#8B7355] mb-4 shadow-sm"
          />
          <h3 className="text-xl font-semibold text-black mb-1">{member.name}</h3>
          <p className="text-sm text-black/70 font-light">{member.role}</p>
        </div>
      ))}
    </div>
  </section>
);

export default TeamPage; 