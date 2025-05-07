import React from 'react';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

const TeamPage = () => {
  const teamMembers = [
    {
      name: 'Rajesh Kumar',
      role: 'Full Stack Developer',
      image: '/Images/team/rajesh.jpg',
      bio: 'Passionate about creating seamless user experiences and robust backend systems.',
      github: 'https://github.com/rajeshkumar',
      linkedin: 'https://linkedin.com/in/rajeshkumar',
      email: 'rajesh.kumar@example.com'
    },
    {
      name: 'Sarah Chen',
      role: 'UI/UX Designer',
      image: '/Images/team/sarah.jpg',
      bio: 'Creative designer focused on intuitive and beautiful user interfaces.',
      github: 'https://github.com/sarahchen',
      linkedin: 'https://linkedin.com/in/sarahchen',
      email: 'sarah.chen@example.com'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Backend Developer',
      image: '/Images/team/michael.jpg',
      bio: 'Specializing in scalable architecture and database optimization.',
      github: 'https://github.com/michaelrodriguez',
      linkedin: 'https://linkedin.com/in/michaelrodriguez',
      email: 'michael.rodriguez@example.com'
    },
    {
      name: 'Emily Thompson',
      role: 'Frontend Developer',
      image: '/Images/team/emily.jpg',
      bio: 'Expert in modern JavaScript frameworks and responsive design.',
      github: 'https://github.com/emilythompson',
      linkedin: 'https://linkedin.com/in/emilythompson',
      email: 'emily.thompson@example.com'
    },
    {
      name: 'David Kim',
      role: 'DevOps Engineer',
      image: '/Images/team/david.jpg',
      bio: 'Ensuring smooth deployment and optimal system performance.',
      github: 'https://github.com/davidkim',
      linkedin: 'https://linkedin.com/in/davidkim',
      email: 'david.kim@example.com'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-[#8B7355] mb-8 text-center">Our Team</h1>
        
        {/* First Row - 3 members */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-3 gap-8 max-w-5xl">
            {teamMembers.slice(0, 3).map((member, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
                style={{ height: '400px' }}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-serif font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-[#8B7355] font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 mb-4 flex-grow">{member.bio}</p>
                  <div className="flex space-x-4 mt-auto">
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#8B7355]">
                      <FiGithub size={20} />
                    </a>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#8B7355]">
                      <FiLinkedin size={20} />
                    </a>
                    <a href={`mailto:${member.email}`} className="text-gray-600 hover:text-[#8B7355]">
                      <FiMail size={20} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second Row - 2 members */}
        <div className="flex justify-center">
          <div className="grid grid-cols-2 gap-8 max-w-3xl">
            {teamMembers.slice(3, 5).map((member, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
                style={{ height: '400px' }}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-serif font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-[#8B7355] font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 mb-4 flex-grow">{member.bio}</p>
                  <div className="flex space-x-4 mt-auto">
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#8B7355]">
                      <FiGithub size={20} />
                    </a>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#8B7355]">
                      <FiLinkedin size={20} />
                    </a>
                    <a href={`mailto:${member.email}`} className="text-gray-600 hover:text-[#8B7355]">
                      <FiMail size={20} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage; 