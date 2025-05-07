import React from 'react';

const TeamPage = () => {
  const teamMembers = [
    { 
      name: 'Rajeshwori Malla', 
      img: '/Images/Raj.jpeg',
      bio: 'If lost, return to GitHub. Probably left my sanity in the last commit.'
    },
    { 
      name: 'Utsav Poudel', 
      img: '/Images/Utsav.jpeg',
      bio: 'Coded more than I slept. Debugged life one semicolon at a time.'
    },
    { 
      name: 'Smera Shrestha', 
      img: '/Images/Smera.jpeg',
      bio: 'Believed every bug had a deeper meaning. Still waiting on that breakthrough.'
    },
    { 
      name: 'Mousam Bhandari', 
      img: '/Images/Mousam.jpeg',
      bio: 'Said "just one more push" and three hours later was still styling the button.'
    },
    { 
      name: 'Nima Lama', 
      img: '/Images/Nima.jpeg',
      bio: 'Built Auctora, broke it twice, fixed it with snacks and vibes.'
    },
  ];

  return (
    <section className="min-h-screen bg-[#D3CABE] py-8 px-4 md:px-16 font-serif">
      <div className="max-w-5xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-black">Meet Our Team</h1>
        <p className="text-base md:text-lg text-black/70 font-light max-w-2xl mx-auto">
          The creative minds and passionate builders behind Auctora. We blend art, code, and a love for innovation to bring you a unique auction experience.
        </p>
      </div>
      
      <div className="max-w-6xl mx-auto">
        {/* First Row - 3 members */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-4">
          {teamMembers.slice(0, 3).map((member, idx) => (
            <div key={idx} className="bg-white/80 rounded-lg shadow-md p-4 flex flex-col items-center border border-black/10 hover:shadow-lg transition-shadow duration-200 h-[250px]">
              <img 
                src={member.img}
                alt={member.name} 
                className="w-20 h-20 object-cover rounded-full border-2 border-[#8B7355] mb-3 shadow-sm"
              />
              <h3 className="text-lg font-semibold text-black mb-2">{member.name}</h3>
              <p className="text-sm text-gray-600 text-center italic">{member.bio}</p>
            </div>
          ))}
        </div>

        {/* Second Row - 2 members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {teamMembers.slice(3, 5).map((member, idx) => (
            <div key={idx} className="bg-white/80 rounded-lg shadow-md p-4 flex flex-col items-center border border-black/10 hover:shadow-lg transition-shadow duration-200 h-[250px]">
              <img 
                src={member.img}
                alt={member.name} 
                className="w-20 h-20 object-cover rounded-full border-2 border-[#8B7355] mb-3 shadow-sm"
              />
              <h3 className="text-lg font-semibold text-black mb-2">{member.name}</h3>
              <p className="text-sm text-gray-600 text-center italic">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamPage; 