import 'dotenv/config';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { StudentProfile } from '@/models/StudentProfile';
import { MentorshipRequest } from '@/models/MentorshipRequest';
import { Feedback } from '@/models/Feedback';
import { Notification } from '@/models/Notification';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alumniconnect';

const INDUSTRIES = [
  'Tech',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Consulting',
  'Media',
  'Retail',
  'Government',
  'Other',
] as const;

const ALL_SKILLS = [
  'JavaScript',
  'Python',
  'React',
  'Node.js',
  'Java',
  'AWS',
  'Docker',
  'SQL',
  'MongoDB',
  'TypeScript',
  'Machine Learning',
  'Product Management',
  'Data Analysis',
  'UI/UX Design',
  'DevOps',
  'Go',
  'Swift',
  'Kotlin',
  'Rust',
  'GraphQL',
];

const MENTORSHIP_AREAS = [
  'Resume Review',
  'Interview Prep',
  'Career Switch',
  'Salary Negotiation',
  'Technical Mentorship',
  'Leadership Skills',
  'Startup Advice',
  'Higher Education Guidance',
  'Networking Tips',
  'Work-Life Balance',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomFloat(min: number, max: number, decimals: number): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  console.log('Clearing collections...');
  await Promise.all([
    User.deleteMany({}),
    AlumniProfile.deleteMany({}),
    StudentProfile.deleteMany({}),
    MentorshipRequest.deleteMany({}),
    Feedback.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('Collections cleared.');

  // --- Admin ---
  console.log('Creating admin...');
  const adminName = 'Admin User';
  await User.create({
    name: adminName,
    email: 'admin@alumni.com',
    passwordHash: 'admin123',
    role: 'admin',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(adminName)}`,
    bio: 'Platform administrator',
    isOnboarded: true,
    isActive: true,
  });
  console.log('Admin created: admin@alumni.com / admin123');

  // --- Alumni ---
  console.log('Creating 40 alumni users...');
  const alumniPassword = 'alumni123';

  for (let i = 1; i <= 40; i++) {
    const industry = INDUSTRIES[(i - 1) % 10];
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = `alumni${i}@test.com`;
    const graduationYear = faker.number.int({ min: 2015, max: 2023 });
    const yearsOfExperience = new Date().getFullYear() - graduationYear;

    const totalSessions = faker.number.int({ min: 0, max: 50 });
    const reviewCount = faker.number.int({ min: 0, max: totalSessions });
    const averageRating = reviewCount > 0 ? randomFloat(3.5, 5.0, 2) : 0;

    const numSkills = faker.number.int({ min: 3, max: 7 });
    const mentorshipAreas = pickRandom(MENTORSHIP_AREAS, faker.number.int({ min: 2, max: 5 }));

    const numAvailability = faker.number.int({ min: 1, max: 3 });
    const availability = pickRandom(DAYS, numAvailability).map((day) => ({
      day,
      startTime: '09:00',
      endTime: '17:00',
    }));

    const user = await User.create({
      name,
      email,
      passwordHash: alumniPassword,
      role: 'alumni',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      bio: faker.lorem.sentence(),
      college: faker.company.name() + ' University',
      graduationYear,
      linkedIn: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${faker.string.alphanumeric(6)}`,
      github: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      isOnboarded: true,
      isActive: true,
    });

    await AlumniProfile.create({
      userId: user._id,
      company: faker.company.name(),
      jobTitle: faker.person.jobTitle(),
      industry,
      mentorshipAreas,
      availability,
      isAcceptingRequests: faker.datatype.boolean({ probability: 0.85 }),
      yearsOfExperience,
      location: `${faker.location.city()}, ${faker.location.country()}`,
      totalSessions,
      averageRating,
      reviewCount,
    });

    void numSkills; // skills stored in mentorshipAreas per spec
  }
  console.log('40 alumni created (alumni1@test.com ... alumni40@test.com / alumni123)');

  // --- Students ---
  console.log('Creating 10 student users...');
  const studentPassword = 'student123';

  const majors = [
    'Computer Science',
    'Electrical Engineering',
    'Business Administration',
    'Data Science',
    'Mechanical Engineering',
    'Finance',
    'Information Technology',
    'Mathematics',
    'Psychology',
    'Biology',
  ];

  for (let i = 1; i <= 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = `student${i}@test.com`;

    const user = await User.create({
      name,
      email,
      passwordHash: studentPassword,
      role: 'student',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      bio: faker.lorem.sentence(),
      college: faker.company.name() + ' University',
      linkedIn: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      github: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      isOnboarded: true,
      isActive: true,
    });

    await StudentProfile.create({
      userId: user._id,
      major: majors[i - 1],
      currentYear: faker.number.int({ min: 1, max: 4 }),
      interests: pickRandom(ALL_SKILLS, faker.number.int({ min: 2, max: 5 })),
      careerGoals: faker.lorem.sentence(),
      resumeUrl: '',
    });
  }
  console.log('10 students created (student1@test.com ... student10@test.com / student123)');

  console.log('\nSeed complete!');
  console.log('  Admin:    admin@alumni.com      / admin123');
  console.log('  Alumni:   alumni1@test.com ...alumni40@test.com / alumni123');
  console.log('  Students: student1@test.com ...student10@test.com / student123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
