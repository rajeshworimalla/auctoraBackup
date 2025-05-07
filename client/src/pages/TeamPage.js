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
    <section className="min-h-screen bg-[#D3CABE] py-16 px-4 md:px-8 font-serif relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black tracking-tight">
            Meet Our Team
          </h1>
          <div className="w-24 h-1 bg-[#8B7355] mx-auto mb-6"></div>
          <p className="text-lg md:text-xl text-black/70 font-light max-w-2xl mx-auto leading-relaxed">
            The creative minds and passionate builders behind Auctora. We blend art, code, and a love for innovation to bring you a unique auction experience.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* First Row - 3 members */}
          {teamMembers.slice(0, 3).map((member, idx) => (
            <div 
              key={idx} 
              className="group bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 flex flex-col items-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-black/5"
            >
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#8B7355] shadow-lg transform transition-transform duration-300 group-hover:scale-105">
                  <img 
                    src={member.img}
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-black mb-3 text-center">{member.name}</h3>
              <p className="text-gray-600 text-center italic leading-relaxed group-hover:text-black transition-colors duration-300">
                {member.bio}
              </p>
            </div>
          ))}
        </div>

        {/* Second Row - 2 members (centered) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-8">
          {teamMembers.slice(3, 5).map((member, idx) => (
            <div 
              key={idx} 
              className="group bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 flex flex-col items-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-black/5"
            >
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#8B7355] shadow-lg transform transition-transform duration-300 group-hover:scale-105">
                  <img 
                    src={member.img}
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-black mb-3 text-center">{member.name}</h3>
              <p className="text-gray-600 text-center italic leading-relaxed group-hover:text-black transition-colors duration-300">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamPage; 