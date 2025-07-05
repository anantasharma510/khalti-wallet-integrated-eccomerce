'use client';

import Image from 'next/image';
import React from 'react';

const techStack = [
  {
    name: 'React',
    img: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
    desc: 'A JavaScript library for building user interfaces.',
  },
  {
    name: 'Next.js',
    img: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg',
    desc: 'A React framework for production.',
  },
  {
    name: 'Tailwind CSS',
    img: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg',
    desc: 'A utility-first CSS framework.',
  },
  {
    name: 'Khalti Gateway',
    img: 'https://seeklogo.com/images/K/khalti-logo-1D0D2280C4-seeklogo.com.png',
    desc: 'A digital wallet and payment gateway in Nepal.',
  },
  {
    name: 'MongoDB',
    img: 'https://upload.wikimedia.org/wikipedia/en/4/45/MongoDB-Logo.svg',
    desc: 'A NoSQL database for modern applications.',
  },
  {
    name: 'TypeScript',
    img: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg',
    desc: 'A superset of JavaScript that adds static typing.',
  },
  {
    name: 'Shadcn',
    img: 'https://avatars.githubusercontent.com/u/139895814?s=200&v=4',
    desc: 'UI components built with Radix UI and Tailwind.',
  },
  {
    name: 'NextAuth',
    img: 'https://next-auth.js.org/img/logo/logo-sm.png',
    desc: 'Authentication for Next.js applications.',
  },
];

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <h1 className="text-4xl font-bold text-center text-blue-700">
        Welcome to Ananta Glass
      </h1>

      {/* Cover Image */}
      <div className="flex justify-center">
        <Image
          src="/cover.png"
          alt="Ananta Glass Cover"
          width={800}
          height={400}
          className="rounded-xl shadow-lg object-cover"
        />
      </div>

      {/* About */}
      <div className="text-center text-lg text-gray-700">
        <p>
          I have created this website primarily to showcase my Khalti payment integration.
        </p>
      </div>

      {/* Tech Stack Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          Tech Stack Used
        </h2>
        <ul className="space-y-6">
  {techStack.map((tech, index) => (
    <li
      key={index}
      className="flex items-center bg-gray-50 shadow-md rounded-lg p-4 hover:bg-white transition"
    >
      {/* Image on the left */}
      <Image
        src={tech.img}
        alt={tech.name}
        width={50}
        height={50}
        className="rounded-md object-contain mr-4"
      />
      {/* Text content on the right */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{tech.name}</h3>
        <p className="text-gray-600 text-sm">{tech.desc}</p>
      </div>
    </li>
  ))}
</ul>

      </div>
    </div>
  );
}
