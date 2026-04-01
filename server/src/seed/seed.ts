import 'dotenv/config';
import mongoose from 'mongoose';

import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { StudentProfile } from '@/models/StudentProfile';
import { MentorshipRequest } from '@/models/MentorshipRequest';
import { Feedback } from '@/models/Feedback';
import { Notification } from '@/models/Notification';
import { Regret } from '@/models/Regret';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alumniconnect';

// ── NIRF Top-Ranked Indian Colleges ──
const COLLEGES = [
  'IIT Madras',
  'IIT Delhi',
  'IIT Bombay',
  'IIT Kanpur',
  'IIT Kharagpur',
  'IIT Roorkee',
  'IIT Guwahati',
  'IIT Hyderabad',
  'IISc Bangalore',
  'NIT Trichy',
  'NIT Surathkal',
  'NIT Warangal',
  'BITS Pilani',
  'BITS Hyderabad',
  'VIT Vellore',
  'DTU Delhi',
  'NSUT Delhi',
  'IIIT Hyderabad',
  'IIIT Delhi',
  'COEP Pune',
  'Jadavpur University',
  'Anna University',
  'Manipal Institute of Technology',
  'SRM University',
  'Thapar University',
];

// ── 10 Industries ──
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

// ── NASSCOM-aligned Skills & In-Demand Areas ──
const SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'Kotlin', 'Swift',
  'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Django', 'Spring Boot', 'Flask',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'GenAI / LLMs',
  'Data Engineering', 'Data Analysis', 'Power BI', 'Tableau',
  'Cybersecurity', 'Blockchain', 'IoT',
  'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL',
  'System Design', 'Microservices', 'CI/CD', 'DevOps',
  'Product Management', 'UI/UX Design', 'Agile / Scrum',
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
  'Open Source Contribution',
  'Research Guidance',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Indian Cities ──
const CITIES = [
  'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai',
  'Delhi NCR', 'Gurugram', 'Noida', 'Kolkata', 'Ahmedabad',
  'Jaipur', 'Kochi', 'Thiruvananthapuram', 'Indore', 'Coimbatore',
];

const INTERNATIONAL_CITIES = [
  'San Francisco, USA', 'Seattle, USA', 'New York, USA', 'London, UK',
  'Berlin, Germany', 'Singapore', 'Dubai, UAE', 'Toronto, Canada',
  'Amsterdam, Netherlands', 'Sydney, Australia',
];

// ── Realistic Indian Company Data by Industry ──
const COMPANIES: Record<string, { company: string; jobTitle: string }[]> = {
  Tech: [
    { company: 'Google India', jobTitle: 'Senior Software Engineer' },
    { company: 'Microsoft India', jobTitle: 'Software Development Engineer II' },
    { company: 'Amazon India', jobTitle: 'SDE III' },
    { company: 'Flipkart', jobTitle: 'Senior Backend Engineer' },
    { company: 'Razorpay', jobTitle: 'Staff Engineer' },
    { company: 'Zerodha', jobTitle: 'Lead Engineer' },
    { company: 'PhonePe', jobTitle: 'Principal Engineer' },
    { company: 'Swiggy', jobTitle: 'Engineering Manager' },
    { company: 'Zomato', jobTitle: 'Senior Full Stack Developer' },
    { company: 'Infosys', jobTitle: 'Technology Lead' },
    { company: 'TCS', jobTitle: 'Solution Architect' },
    { company: 'Wipro', jobTitle: 'Technical Architect' },
    { company: 'Freshworks', jobTitle: 'Senior Product Engineer' },
    { company: 'Atlassian India', jobTitle: 'Senior Developer' },
    { company: 'Adobe India', jobTitle: 'Computer Scientist' },
  ],
  Finance: [
    { company: 'Goldman Sachs India', jobTitle: 'Vice President — Engineering' },
    { company: 'JP Morgan Chase', jobTitle: 'Associate — Technology' },
    { company: 'HDFC Bank', jobTitle: 'Senior Manager — Digital Banking' },
    { company: 'ICICI Bank', jobTitle: 'Deputy Manager — Analytics' },
    { company: 'Paytm', jobTitle: 'Lead Product Manager' },
    { company: 'CRED', jobTitle: 'Senior Data Scientist' },
  ],
  Healthcare: [
    { company: 'Practo', jobTitle: 'Engineering Manager' },
    { company: 'PharmEasy', jobTitle: 'Senior Software Engineer' },
    { company: '1mg (Tata Health)', jobTitle: 'Tech Lead' },
    { company: 'Narayana Health', jobTitle: 'Data Analytics Lead' },
  ],
  Education: [
    { company: 'Byju\'s', jobTitle: 'Senior Engineer' },
    { company: 'Unacademy', jobTitle: 'Tech Lead' },
    { company: 'upGrad', jobTitle: 'Principal Engineer' },
    { company: 'Physics Wallah', jobTitle: 'Lead Backend Engineer' },
  ],
  Manufacturing: [
    { company: 'Tata Motors', jobTitle: 'Senior Design Engineer' },
    { company: 'L&T', jobTitle: 'Project Manager' },
    { company: 'Mahindra & Mahindra', jobTitle: 'Lead — R&D' },
    { company: 'Bharat Electronics', jobTitle: 'Deputy Manager — Systems' },
  ],
  Consulting: [
    { company: 'McKinsey & Company', jobTitle: 'Associate' },
    { company: 'BCG India', jobTitle: 'Consultant' },
    { company: 'Deloitte India', jobTitle: 'Senior Consultant' },
    { company: 'Accenture India', jobTitle: 'Manager — Technology Consulting' },
  ],
  Media: [
    { company: 'Hotstar (Disney+)', jobTitle: 'Senior Engineer — Streaming' },
    { company: 'Times Internet', jobTitle: 'Lead Engineer' },
    { company: 'ShareChat', jobTitle: 'ML Engineer' },
    { company: 'InMobi', jobTitle: 'Senior Product Manager' },
  ],
  Retail: [
    { company: 'Myntra', jobTitle: 'Staff Engineer' },
    { company: 'Nykaa', jobTitle: 'Engineering Manager' },
    { company: 'Meesho', jobTitle: 'Senior Backend Engineer' },
    { company: 'BigBasket', jobTitle: 'Tech Lead' },
  ],
  Government: [
    { company: 'ISRO', jobTitle: 'Scientist/Engineer — SC' },
    { company: 'DRDO', jobTitle: 'Senior Research Fellow' },
    { company: 'NIC (National Informatics Centre)', jobTitle: 'Technical Director' },
    { company: 'CDAC', jobTitle: 'Senior Engineer' },
  ],
  Other: [
    { company: 'Ola', jobTitle: 'Senior Engineer — Maps' },
    { company: 'Urban Company', jobTitle: 'Lead Engineer' },
    { company: 'Dunzo', jobTitle: 'Senior Full Stack Developer' },
    { company: 'Lenskart', jobTitle: 'Engineering Manager' },
  ],
};

// ── Bios per Industry ──
const BIOS: Record<string, string[]> = {
  Tech: [
    'Passionate about building scalable distributed systems and mentoring the next generation of engineers.',
    'Full-stack developer with a love for clean code, open source, and solving complex problems.',
    'Cloud-native enthusiast. I believe in shipping fast, learning faster.',
    'Spent years building products used by millions. Happy to share what I\'ve learned along the way.',
    'Backend engineer at heart. Ask me about system design, databases, or career growth in big tech.',
  ],
  Finance: [
    'Bridging finance and technology. Excited about fintech innovation in India.',
    'Quantitative thinker with a passion for building reliable financial platforms.',
    'From coding trading algorithms to leading engineering teams — happy to guide you through the fintech journey.',
  ],
  Healthcare: [
    'Using technology to make healthcare accessible. Healthtech is the future.',
    'Passionate about solving real-world health problems with data and engineering.',
  ],
  Education: [
    'Edtech builder. Helping democratize quality education through technology.',
    'Building the future of learning, one feature at a time.',
  ],
  Manufacturing: [
    'Engineering the physical world with software. Industry 4.0 excites me.',
    'From factory floors to digital dashboards — manufacturing is evolving fast.',
  ],
  Consulting: [
    'Helping organizations solve their toughest problems with data-driven strategy.',
    'Strategy meets technology. Happy to share insights on the consulting career path.',
  ],
  Media: [
    'Building platforms that entertain and inform billions.',
    'From content recommendation engines to streaming infrastructure — media tech is fascinating.',
  ],
  Retail: [
    'E-commerce engineer building seamless shopping experiences at scale.',
    'Retail tech is where supply chain meets consumer psychology meets engineering.',
  ],
  Government: [
    'Contributing to India\'s technological sovereignty. Proud to serve.',
    'Research-driven engineering for national-scale impact.',
  ],
  Other: [
    'Building products that simplify everyday life for millions of Indians.',
    'Startup life — wearing many hats and learning something new every day.',
  ],
};

// ── 50 Realistic Indian Alumni Names ──
const ALUMNI_DATA: { name: string; gender: 'M' | 'F' }[] = [
  { name: 'Aarav Sharma', gender: 'M' },
  { name: 'Priya Nair', gender: 'F' },
  { name: 'Rohit Mehta', gender: 'M' },
  { name: 'Ananya Iyer', gender: 'F' },
  { name: 'Vikram Singh', gender: 'M' },
  { name: 'Sneha Reddy', gender: 'F' },
  { name: 'Arjun Patel', gender: 'M' },
  { name: 'Kavya Krishnan', gender: 'F' },
  { name: 'Aditya Joshi', gender: 'M' },
  { name: 'Meera Gupta', gender: 'F' },
  { name: 'Karthik Subramaniam', gender: 'M' },
  { name: 'Divya Venkatesh', gender: 'F' },
  { name: 'Rahul Verma', gender: 'M' },
  { name: 'Ishita Banerjee', gender: 'F' },
  { name: 'Siddharth Agarwal', gender: 'M' },
  { name: 'Pooja Deshmukh', gender: 'F' },
  { name: 'Nikhil Rao', gender: 'M' },
  { name: 'Shruti Kulkarni', gender: 'F' },
  { name: 'Amit Choudhary', gender: 'M' },
  { name: 'Tanvi Bhatt', gender: 'F' },
  { name: 'Harsh Malviya', gender: 'M' },
  { name: 'Neha Saxena', gender: 'F' },
  { name: 'Pranav Menon', gender: 'M' },
  { name: 'Ritu Aggarwal', gender: 'F' },
  { name: 'Varun Tiwari', gender: 'M' },
  { name: 'Aditi Pillai', gender: 'F' },
  { name: 'Manish Kumar', gender: 'M' },
  { name: 'Swati Hegde', gender: 'F' },
  { name: 'Deepak Pandey', gender: 'M' },
  { name: 'Nandini Srinivasan', gender: 'F' },
  { name: 'Rajat Mishra', gender: 'M' },
  { name: 'Bhavna Chauhan', gender: 'F' },
  { name: 'Suresh Narayanan', gender: 'M' },
  { name: 'Anjali Deshpande', gender: 'F' },
  { name: 'Gaurav Kapoor', gender: 'M' },
  { name: 'Simran Kaur', gender: 'F' },
  { name: 'Akash Dubey', gender: 'M' },
  { name: 'Pallavi Jain', gender: 'F' },
  { name: 'Vivek Raghavan', gender: 'M' },
  { name: 'Madhuri Patil', gender: 'F' },
  { name: 'Rohan Bose', gender: 'M' },
  { name: 'Kriti Thakur', gender: 'F' },
  { name: 'Abhishek Yadav', gender: 'M' },
  { name: 'Sanya Mittal', gender: 'F' },
  { name: 'Tarun Goel', gender: 'M' },
  { name: 'Megha Shetty', gender: 'F' },
  { name: 'Vishal Rawat', gender: 'M' },
  { name: 'Aparna Nambiar', gender: 'F' },
  { name: 'Kunal Dhawan', gender: 'M' },
  { name: 'Ritika Prasad', gender: 'F' },
];

// ── 15 Realistic Indian Student Names ──
const STUDENT_DATA: { name: string; gender: 'M' | 'F' }[] = [
  { name: 'Aryan Khanna', gender: 'M' },
  { name: 'Diya Rajan', gender: 'F' },
  { name: 'Om Prakash Soni', gender: 'M' },
  { name: 'Isha Malhotra', gender: 'F' },
  { name: 'Dev Narayan Gupta', gender: 'M' },
  { name: 'Aisha Khan', gender: 'F' },
  { name: 'Yash Rajput', gender: 'M' },
  { name: 'Saanvi Menon', gender: 'F' },
  { name: 'Kabir Ahuja', gender: 'M' },
  { name: 'Myra Chowdhury', gender: 'F' },
  { name: 'Reyansh Sinha', gender: 'M' },
  { name: 'Navya Shukla', gender: 'F' },
  { name: 'Ishan Mukherjee', gender: 'M' },
  { name: 'Anvi Mahajan', gender: 'F' },
  { name: 'Vihaan Oberoi', gender: 'M' },
];

const STUDENT_MAJORS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Information Technology',
  'Data Science & AI',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Civil Engineering',
  'Mathematics & Computing',
  'Aerospace Engineering',
  'Metallurgical Engineering',
  'Industrial Engineering',
  'Physics',
  'Applied Mathematics',
];

const CAREER_GOALS = [
  'Aspiring to become a software engineer at a top product company and contribute to open source.',
  'Want to break into data science and eventually lead an analytics team.',
  'Dreaming of building my own edtech startup that makes quality education affordable.',
  'Interested in pursuing an MS in Computer Science from a top US university.',
  'Passionate about AI/ML and want to work on real-world NLP applications.',
  'Looking to transition into product management after gaining engineering experience.',
  'Want to join a fast-growing fintech startup and work on payments infrastructure.',
  'Goal is to become a full-stack developer and freelance while traveling India.',
  'Interested in cybersecurity and want to work with a Big 4 consulting firm.',
  'Aspiring ML researcher — planning to pursue a PhD in deep learning.',
  'Want to work in the Indian space-tech ecosystem after graduating.',
  'Aiming for a role in cloud infrastructure at a hyperscaler like AWS or GCP.',
  'Dream of becoming a design engineer and building products people love.',
  'Passionate about robotics and embedded systems. Want to work at an EV company.',
  'Looking to join the semiconductor industry and contribute to India\'s chip-making ambitions.',
];

// ── 8 Graduation Years ──
const GRADUATION_YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

// ── Helpers ──
function pickRandom<T>(arr: readonly T[] | T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function pickOne<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  console.log('Clearing ALL collections...');
  await Promise.all([
    User.deleteMany({}),
    AlumniProfile.deleteMany({}),
    StudentProfile.deleteMany({}),
    MentorshipRequest.deleteMany({}),
    Feedback.deleteMany({}),
    Notification.deleteMany({}),
    Regret.deleteMany({}),
  ]);
  console.log('All collections cleared.\n');

  // ═══════════════ ADMIN ═══════════════
  console.log('Creating admin...');
  const adminName = 'Admin — AlumniConnect';
  await User.create({
    name: adminName,
    email: 'admin@alumniconnect.in',
    passwordHash: 'admin@123',
    role: 'admin',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(adminName)}`,
    bio: 'Platform administrator for AlumniConnect India.',
    isOnboarded: true,
    isActive: true,
  });
  console.log('  ✓ admin@alumniconnect.in / admin@123\n');

  // ═══════════════ ALUMNI (50) ═══════════════
  console.log(`Creating ${ALUMNI_DATA.length} alumni...`);

  for (let i = 0; i < ALUMNI_DATA.length; i++) {
    const { name } = ALUMNI_DATA[i];
    const industry = INDUSTRIES[i % 10];
    const gradYear = GRADUATION_YEARS[i % 8];
    const yearsOfExp = new Date().getFullYear() - gradYear;
    const college = pickOne(COLLEGES);
    const companyData = pickOne(COMPANIES[industry]);

    const totalSessions = randomInt(0, 40);
    const reviewCount = randomInt(0, totalSessions);
    const averageRating = reviewCount > 0 ? randomFloat(3.5, 5.0, 2) : 0;

    const mentorshipAreas = pickRandom(MENTORSHIP_AREAS, randomInt(2, 5));
    const availability = pickRandom(DAYS, randomInt(1, 3)).map((day) => ({
      day,
      startTime: pickOne(['09:00', '10:00', '11:00', '14:00']),
      endTime: pickOne(['17:00', '18:00', '19:00', '20:00']),
    }));

    const isAbroad = i % 7 === 0; // ~14% alumni abroad
    const location = isAbroad ? pickOne(INTERNATIONAL_CITIES) : pickOne(CITIES);
    const bio = pickOne(BIOS[industry]);
    const slug = slugify(name);
    const email = `alumni${i + 1}@test.com`;

    const user = await User.create({
      name,
      email,
      passwordHash: 'alumni@123',
      role: 'alumni',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      bio,
      college,
      graduationYear: gradYear,
      linkedIn: `https://linkedin.com/in/${slug}`,
      github: `https://github.com/${slug}`,
      isOnboarded: true,
      isActive: true,
    });

    await AlumniProfile.create({
      userId: user._id,
      company: companyData.company,
      jobTitle: companyData.jobTitle,
      industry,
      mentorshipAreas,
      availability,
      isAcceptingRequests: Math.random() > 0.15,
      yearsOfExperience: yearsOfExp,
      location,
      totalSessions,
      averageRating,
      reviewCount,
    });
  }
  console.log(`  ✓ ${ALUMNI_DATA.length} alumni created (alumni1@test.com ... alumni${ALUMNI_DATA.length}@test.com / alumni@123)\n`);

  // ═══════════════ STUDENTS (15) ═══════════════
  console.log(`Creating ${STUDENT_DATA.length} students...`);

  for (let i = 0; i < STUDENT_DATA.length; i++) {
    const { name } = STUDENT_DATA[i];
    const college = pickOne(COLLEGES);
    const major = STUDENT_MAJORS[i % STUDENT_MAJORS.length];
    const slug = slugify(name);
    const email = `student${i + 1}@test.com`;

    const user = await User.create({
      name,
      email,
      passwordHash: 'student@123',
      role: 'student',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      bio: CAREER_GOALS[i % CAREER_GOALS.length],
      college,
      linkedIn: `https://linkedin.com/in/${slug}`,
      github: `https://github.com/${slug}`,
      isOnboarded: true,
      isActive: true,
    });

    await StudentProfile.create({
      userId: user._id,
      major,
      currentYear: randomInt(1, 4),
      interests: pickRandom(SKILLS, randomInt(3, 6)),
      careerGoals: CAREER_GOALS[i % CAREER_GOALS.length],
      resumeUrl: '',
    });
  }
  console.log(`  ✓ ${STUDENT_DATA.length} students created (student1@test.com ... student${STUDENT_DATA.length}@test.com / student@123)\n`);

  // ═══════════════ SUMMARY ═══════════════
  console.log('════════════════════════════════════════');
  console.log('  SEED COMPLETE');
  console.log('════════════════════════════════════════');
  console.log('  Admin:    admin@alumniconnect.in    / admin@123');
  console.log(`  Alumni:   alumni1@test.com ... alumni${ALUMNI_DATA.length}@test.com / alumni@123`);
  console.log(`  Students: student1@test.com ... student${STUDENT_DATA.length}@test.com / student@123`);
  console.log(`\n  Total: 1 admin + ${ALUMNI_DATA.length} alumni + ${STUDENT_DATA.length} students = ${1 + ALUMNI_DATA.length + STUDENT_DATA.length} users`);
  console.log('════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
