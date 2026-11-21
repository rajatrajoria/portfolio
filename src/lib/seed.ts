import type { Entry, SiteData } from './types';

// Starter content. Once Supabase is connected and you hit "Save" in the admin,
// the database copy takes over and this file is only used as a fallback.
//
// Images: covers are from Unsplash (free under the Unsplash License), logos from
// Wikimedia / Simple Icons. Replace any of them from the admin with your own photos.

export const SITE_VERSION = 2;

const U = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const LOGO = {
  wellsFargo: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Wells_Fargo_Logo_%282020%29.svg',
  jadavpur: 'https://upload.wikimedia.org/wikipedia/en/5/58/Jadavpur_University_Logo.svg',
  coursera: 'https://commons.wikimedia.org/wiki/Special:FilePath/Coursera-Logo_600x600.svg',
  claude: 'https://cdn.simpleicons.org/claude',
};

export const seedSite: SiteData = {
  version: SITE_VERSION,
  profile: {
    name: 'Rajat Rajoria',
    shortName: 'Rajat',
    headline: 'Software Engineer',
    roles: ['Software Engineer', 'Payments engineer', 'AI tinkerer', 'Weekend builder', '“What if…?” person'],
    intro:
      'I build the payment systems that move **billions of dollars a month** at **Wells Fargo**. After hours I build whatever my latest *“what if…?”* happens to be — usually with **Claude** and a stack of AI tools riding shotgun.',
    about:
      "I'm a software engineer in **Hyderabad**, and I'm happiest on problems where *almost right* isn't an option.\n\n**By day, that's payments.** I'm part of the team at Wells Fargo rebuilding how the bank moves money — retiring legacy vendor platforms in favour of an in-house, enterprise-grade wires and instant-payments system that now carries **$300B+ every month**. Microservices, Kafka, chaos tests, dashboards: the unglamorous machinery that makes sure a wire lands exactly once.\n\n**By night, it's “what if…?”** What if a spare laptop could be my own private AI cloud? What if shopping search understood how people actually describe things? What if a team of AI agents could write a script with a real voice? Most of my side projects start as a half-joke in my notes app. With **Claude** and a growing toolbox of AI tools as my pair, the gap between *“wouldn't it be funny if…”* and a working prototype is often a single weekend.\n\nSome of those ideas just… work out. The rest teach me something — honestly the better deal.\n\nBefore all this I graduated as a **Silver Medalist from Jadavpur University** and spent a year as an undergraduate researcher building attention-based neural networks for medical imaging — three papers' worth.\n\nAway from the keyboard you'll find me on a mountain trail, headphones on, or losing an evening to a good game.",
    location: 'Hyderabad, India',
    avatar: 'https://i.imgur.com/Bcn8Ezw.jpeg',
    email: 'rajatrajoria.ju@gmail.com',
    resumeUrl: '',
    badges: [
      { id: 'b-problems', label: 'Open to interesting problems', color: 'emerald', pulse: true },
      { id: 'b-roles', label: 'Open to new opportunities', color: 'sky', pulse: false },
      { id: 'b-ai', label: 'Building with AI', color: 'violet', pulse: false },
    ],
    socials: [
      { id: 's-gh', label: 'GitHub', url: 'https://github.com/rajatrajoria', icon: 'github' },
      { id: 's-li', label: 'LinkedIn', url: 'https://www.linkedin.com/in/rajat-rajoria-bbb999202/', icon: 'linkedin' },
      { id: 's-tw', label: 'X / Twitter', url: 'https://twitter.com/rajat_rajoria', icon: 'twitter' },
      { id: 's-ig', label: 'Instagram', url: 'https://www.instagram.com/rajat_.8/', icon: 'instagram' },
      { id: 's-mail', label: 'Email', url: 'mailto:rajatrajoria.ju@gmail.com', icon: 'mail' },
    ],
  },
  settings: {
    siteTitle: 'Rajat Rajoria — Software Engineer & builder',
    description:
      'Software engineer at Wells Fargo building payment systems at scale — and an after-hours builder of AI experiments, side projects and “what if…?” ideas.',
    accent: '#a78bfa',
    footerNote: 'Designed & built by Rajat — with Claude as co-pilot.',
    experienceLabel: 'Years of full-time experience',
    showSkillIcons: true,
  },
  sections: [
    { id: 'sec-hero', type: 'hero', visible: true, eyebrow: '', title: '', subtitle: '', showInNav: false },
    { id: 'sec-stats', type: 'stats', visible: true, eyebrow: '', title: '', subtitle: '', showInNav: false },
    { id: 'sec-about', type: 'about', visible: true, eyebrow: 'About', title: 'Payments by day. “What if…?” by night.', subtitle: '', showInNav: true },
    {
      id: 'sec-xp', type: 'experience', visible: true, eyebrow: 'Experience', title: 'Where I’ve been building',
      subtitle: 'From ML experiments as an intern to the systems that move a bank’s money. Open any role for the full story, photos and certificates.',
      showInNav: true,
    },
    {
      id: 'sec-projects', type: 'projects', visible: true, eyebrow: 'Projects', title: 'Things I’ve built (and broken)',
      subtitle: 'Side projects, experiments and products — every one of them started life as a “what if…?”.', showInNav: true, limit: 6,
    },
    {
      id: 'sec-how', type: 'cards', visible: true, eyebrow: 'How I build', title: 'From shower thought to shipped',
      subtitle: 'The habits — and the AI co-pilots — that turn a half-joke idea into something you can actually click.', showInNav: false,
      cards: [
        {
          id: 'how-1', title: 'It starts with “what if…?”', image: '', url: '', meta: 'The idea',
          body: 'Every project on this page began as a slightly ridiculous question. I write them all down; the ones that keep nagging me get a weekend. Worst case, I learn something. Best case — it just works out.',
        },
        {
          id: 'how-2', title: 'Claude as my pair', image: '', url: '', logo: LOGO.claude, meta: 'The co-pilot',
          body: 'I build alongside **Claude** and other AI tools — for design debates, scaffolding, debugging and brutally honest second opinions. I stay the engineer; they make me a much faster one. (This very site was built that way.)',
        },
        {
          id: 'how-3', title: 'Make it work, then make it honest', image: '', url: '', meta: 'The loop',
          body: 'Get it running end to end first, then measure everything. My favourite bugs are the ones that reveal how the machine really works — like 14 threads fighting over 5 cores.',
        },
        {
          id: 'how-4', title: 'Production habits, side-project speed', image: '', url: '', meta: 'The standard',
          body: 'Day-job instincts come along for the ride: observability, failure modes, retries and job queues — even when the “server” is a laptop on my desk.',
        },
      ],
    },
    { id: 'sec-skills', type: 'skills', visible: true, eyebrow: 'Toolkit', title: 'What I build with', subtitle: 'The languages, frameworks and tools I reach for most — at work and after hours.', showInNav: false },
    {
      id: 'sec-certs', type: 'cards', visible: true, eyebrow: 'Certifications', title: 'Licenses & certifications', subtitle: '', showInNav: false,
      cards: [
        {
          id: 'cert-ml', title: 'Supervised Machine Learning: Regression and Classification', meta: 'Coursera · DeepLearning.AI & Stanford · Apr 2023',
          body: 'Linear and logistic regression, gradient descent, regularisation and the fundamentals of building ML models that generalise.', image: '', logo: LOGO.coursera, url: '',
        },
      ],
    },
    {
      id: 'sec-pubs', type: 'publications', visible: true, eyebrow: 'Research', title: 'Publications',
      subtitle: 'Deep learning for medical imaging and blockchain for healthcare — from my university research days.', showInNav: true,
    },
    { id: 'sec-edu', type: 'education', visible: true, eyebrow: 'Education', title: 'Where it all started', subtitle: '', showInNav: false },
    { id: 'sec-blog', type: 'feed', visible: true, eyebrow: 'Writing', title: 'Notes from the workbench', subtitle: 'What I learn while building — usually the hard way.', showInNav: false, pageId: 'page-blog', limit: 3 },
    {
      id: 'sec-beyond', type: 'cards', visible: true, eyebrow: 'Beyond code', title: 'When I’m offline', subtitle: '', showInNav: false,
      cards: [
        { id: 'c1', title: 'Mountains & trails', meta: 'Travel', body: 'A certified wanderlust case. Treks, camping trips, and anything that ends with a view worth the climb — count me in.', image: 'https://images.pexels.com/photos/732629/pexels-photo-732629.jpeg?auto=compress&cs=tinysrgb&w=1200', url: '' },
        { id: 'c2', title: 'Headphones on', meta: 'Music', body: 'Music is how I switch worlds. Imagine Dragons, Ed Sheeran and Lewis Capaldi are on permanent rotation.', image: 'https://cdn.pixabay.com/photo/2017/08/01/00/18/people-2562222_1280.jpg', url: '' },
        { id: 'c3', title: 'Player two has entered', meta: 'Gaming', body: 'PlayStation, Xbox, Oculus — I’ve tried them all. Gaming nights with friends are non-negotiable.', image: 'https://burst.shopifycdn.com/photos/video-game-controller-top.jpg?width=1200&format=pjpg', url: '' },
      ],
    },
    {
      id: 'sec-contact', type: 'contact', visible: true, eyebrow: 'Contact', title: 'Got a “what if…?” of your own?',
      subtitle: 'A role, a collaboration, a wild idea, or just a hello — my inbox is open, and I actually reply.', showInNav: true,
    },
  ],
  experiences: [
    {
      id: 'xp-wf',
      slug: 'wells-fargo',
      company: 'Wells Fargo',
      role: 'Software Engineer',
      type: 'Full-time',
      location: 'Hyderabad, India · On-site',
      start: '2025-09',
      end: '',
      logo: LOGO.wellsFargo,
      cover: U('photo-1609429019995-8c40f49535a5'),
      url: 'https://www.wellsfargo.com',
      summary:
        'Rebuilding how one of America’s largest banks moves money: engineering the in-house Wires & Instant Payments platform that is replacing legacy vendor systems — now at $300B+ a month.',
      body:
        "I'm in the **Payments** team, working on one of the bank's biggest modernisation efforts: moving *all* of Wells Fargo's wire traffic off legacy vendor platforms and onto an in-house, enterprise-grade payment system.\n\nIt's the kind of software where \"mostly works\" isn't a thing. Every wire has to be validated, acknowledged and routed exactly once — at volumes that now exceed **$300 billion a month**.\n\n## What I work on\n\n- **Core payment lifecycle** — order ingestion, validation, acknowledgements and execution routing.\n- **Microservices at scale** — building and maintaining the services behind the in-house wire processing system.\n- **Testing that breaks things on purpose** — end-to-end BDD pipelines for performance and chaos testing that cut manual QA effort by **~95%**.\n- **Seeing problems before customers do** — custom Grafana dashboards and alerting for faster incident response.\n- **Modernisation** — refactoring legacy modules and introducing Kafka, Spring Boot and MongoDB for resilient, event-driven communication.\n\nWe ship continuously in an Agile setup, steered by stakeholder feedback and production analytics.",
      highlights: [
        '$300B+ in monthly wire volume on the new platform',
        '~95% less manual QA with BDD performance & chaos automation',
        'Owns core lifecycle: ingestion → validation → acks → routing',
        'Event-driven modernisation with Kafka, Spring Boot & MongoDB',
      ],
      skills: ['Java', 'Spring Boot', 'Kafka', 'MongoDB', 'Grafana', 'Microservices', 'BDD', 'Chaos testing', 'Distributed Systems'],
      gallery: [],
      attachments: [],
      countsTowardTotal: true,
    },
    {
      id: 'xp-wf-pa',
      slug: 'wells-fargo-program-associate',
      company: 'Wells Fargo',
      role: 'Program Associate',
      type: 'Full-time',
      location: 'Hyderabad, India · On-site',
      start: '2024-08',
      end: '2025-09',
      logo: LOGO.wellsFargo,
      cover: U('photo-1563013544-824ae1b704d3'),
      url: 'https://www.wellsfargo.com',
      summary:
        'Joined the Payments ecosystem straight out of university, helping build the in-house Wires & Instant Payments systems from the ground up.',
      body:
        "My first full-time role, straight out of university — and straight into the deep end of the **Payments** ecosystem.\n\nThe team was engineering an in-house, enterprise-grade **Wires and Instant Payments** platform. This is where I learned how bank-scale payment systems are designed, tested and operated: idempotency, reconciliation, the art of the retry, and why every log line matters at 3 a.m.\n\nIt laid the groundwork for everything I work on today.",
      highlights: ['Onboarded into bank-scale payments engineering', 'Built services for the in-house Wires & Instant Payments platform'],
      skills: ['Java', 'Spring Boot', 'Microservices', 'Payments'],
      gallery: [],
      attachments: [],
      countsTowardTotal: true,
    },
    {
      id: 'xp-ju',
      slug: 'jadavpur-university-research',
      company: 'Jadavpur University',
      role: 'Undergraduate Researcher',
      type: 'Research',
      location: 'Kolkata, India',
      start: '2023-07',
      end: '2024-06',
      logo: LOGO.jadavpur,
      cover: U('photo-1758691462667-f2fb90a067ff'),
      url: 'https://jadavpuruniversity.in',
      summary: 'Teaching neural networks to read medical scans: attention-based 2D and 3D CNNs that beat MedMNIST v2 benchmarks — and three publications.',
      body:
        "A year in the lab with **Dr. Pawan Kumar Singh**, working on a deceptively simple question: *can a small, efficient network classify medical images as well as a big one?*\n\n## What I built\n\n- A preprocessing pipeline and a **3D convolutional neural network with attention mechanisms** for volumetric medical images.\n- Attention-based networks for **automatic organ classification from 2D CT scans**.\n- A **deep-feature ensemble** methodology for 2D biomedical image classification.\n\nOn the **MedMNIST v2** datasets the models delivered significant improvements over existing benchmarks.\n\n## What came out of it\n\nThree publications — a paper at CIPR-2024, a book chapter with CRC Press (Taylor & Francis), and a journal paper.",
      highlights: ['3 publications in one year', 'Attention-based 2D & 3D CNNs', 'Beat MedMNIST v2 benchmarks'],
      skills: ['Deep Learning', 'CNNs', 'TensorFlow', 'Computer Vision', 'Research'],
      gallery: [],
      attachments: [],
      countsTowardTotal: false,
    },
    {
      id: 'xp-wf-intern',
      slug: 'wells-fargo-internship',
      company: 'Wells Fargo',
      role: 'Software Developer Intern',
      type: 'Internship',
      location: 'Hyderabad, India · On-site',
      start: '2023-05',
      end: '2023-07',
      logo: LOGO.wellsFargo,
      cover: U('photo-1611974789855-9c2a0a7236a3'),
      url: 'https://www.wellsfargo.com',
      summary: 'Two months, two ML builds: a smart liquidity-forecasting app and a computer-vision proof of concept for cheque analysis.',
      body:
        "My summer of 2023 at Wells Fargo, Hyderabad — and my first taste of engineering inside a bank.\n\n- **Smart liquidity forecasting** — an application using recurrent neural networks to sharpen liquidity forecasts.\n- **Cheque analysis PoC** — computer-vision techniques to denoise and analyse scanned cheques.\n\nThe real win was the people: experienced leaders who mentored generously and a team of fellow interns who made two months feel like a hackathon. It was a pivotal stepping stone — I came back full-time a year later.",
      highlights: ['RNN-based liquidity forecasting app', 'Computer-vision cheque analysis PoC', 'Returned full-time a year later'],
      skills: ['Python', 'FastAPI', 'Machine Learning', 'Computer Vision', 'RNN'],
      gallery: [],
      attachments: [],
      countsTowardTotal: false,
    },
  ],
  education: [
    {
      id: 'ed-ju', school: 'Jadavpur University', degree: 'B.E. in Information Technology', start: '2020', end: '2024', grade: 'CGPA 8.84 · Silver Medalist',
      description: 'CodeClub JUSL. Coursework across DSA, DBMS, operating systems, AI, information security and web applications.', logo: LOGO.jadavpur,
    },
    { id: 'ed-bnv', school: 'Bholananda National Vidyalaya', degree: 'CBSE Class XII — PCM & Computer Science', start: '2017', end: '2019', grade: '89%', description: 'Cricket, badminton, Green Club and the Computer Society.', logo: '' },
    { id: 'ed-sads', school: "St. Augustine's Day School", degree: 'ICSE Class X', start: '2003', end: '2017', grade: '95.8%', description: 'Sports, quiz and debate. Finished 2nd in school.', logo: '' },
  ],
  projects: [
    {
      id: 'pr-gateway', slug: 'private-ai-gateway', title: 'Private AI Gateway',
      summary: 'What if a spare laptop could be your own private AI cloud? Local LLMs behind an authenticated HTTPS API, reachable from anywhere — no GPU, no port forwarding, no data leaving the machine.',
      body:
        "It started with burning through free-tier AI quotas and noticing a second laptop on my desk doing nothing.\n\nThe gateway puts local **Ollama** models behind an authenticated HTTPS API, reachable from anywhere through a **Cloudflare Tunnel** — no port forwarding, no GPU, and no data ever leaving the machine.\n\n## Under the hood\n\n- Auth and rate limiting in front of the model\n- **Async job queue** (SQLite on a volume) so long prompts survive Cloudflare's 100-second limit and container restarts\n- Token streaming, queue positions, and clean start/stop with zero lingering processes\n- One-click setup — your hardware, your rules\n\nI wrote up everything that broke along the way (including a 38× speed-up from a single number) on the blog.",
      cover: U('photo-1558494949-ef010cbdcc31'), tags: ['Python', 'Ollama', 'Docker', 'Cloudflare'], github: 'https://github.com/rajatrajoria/private-ai-gateway', live: '', date: '2026-08', featured: true, gallery: [],
    },
    {
      id: 'pr-storyos', slug: 'storyos', title: 'StoryOS',
      summary: 'What if a writers’ room were made of AI agents? A multi-agent system that writes production-quality scripts for creators, adapting to genre, voice and format.',
      body: 'StoryOS orchestrates a team of specialised agents — researcher, outliner, writer and editor — that pass work between each other the way a real writers’ room would. The result is scripts that adapt to a creator’s genre, voice and format instead of sounding like generic AI.',
      cover: U('photo-1505682634904-d7c8d95cdc50'), tags: ['Python', 'Multi-agent', 'LLMs'], github: 'https://github.com/rajatrajoria/StoryOS', live: '', date: '2026-07', featured: true, gallery: [],
    },
    {
      id: 'pr-rent', slug: 'rent-anything', title: 'RentAnything',
      summary: 'Why buy a drill you’ll use twice? A trust-first, peer-to-peer rental marketplace for everyday items — verified users, secure flows and payment escrow.',
      body:
        'A peer-to-peer short-term rental marketplace that lets people rent out and borrow everyday items — from a weekend tool rental to longer bookings — through a structured system designed for flexibility.\n\nUnlike most marketplaces it is built around **trust**: verified users, secure flows, **payment escrow**, and a strong focus on keeping scams and non-genuine listings out.\n\n**Stack:** Spring Boot, Spring Security, PostgreSQL and Flyway on the backend, with a TypeScript frontend.',
      cover: U('photo-1426927308491-6380b6a9936f'), tags: ['Spring Boot', 'PostgreSQL', 'Spring Security', 'TypeScript'], github: 'https://github.com/rajatrajoria/rent-anything', live: '', date: '2026-02', featured: true, gallery: [],
    },
    {
      id: 'pr-exactbuy', slug: 'exact-buy', title: 'ExactBuy',
      summary: 'What if search understood you the way a friend would? Describe a product in plain words and get real items you can buy.',
      body: 'Describe it like a person — *“a green shirt with white checks and yellow pockets”* — and ExactBuy returns real, relevant products available online. It bridges the gap between how people describe what they want and what e-commerce search actually understands.',
      cover: U('photo-1483985988355-763728e1935b'), tags: ['Python', 'LLMs', 'Image Search', 'APIs'], github: 'https://github.com/rajatrajoria/exact-buy', live: '', date: '2025-02', featured: true, gallery: [],
    },
    {
      id: 'pr-risk', slug: 'riskunlocked', title: 'RiskUnlocked',
      summary: 'A Wells Fargo hackathon build: AI that flags risky transactions by combining sanctions lists, geopolitical risk and live news sentiment.',
      body: 'A proof of concept built at a Wells Fargo hackathon. It scores financial transactions against sanctions lists, geopolitical risk and sentiment from news sources — helping analysts, auditors and compliance teams spot high-risk entities and suspicious transactions faster.',
      cover: U('photo-1562504208-03d85cc8c23e'), tags: ['Python', 'NLP', 'APIs', 'FinTech'], github: 'https://github.com/rajatrajoria/RiskUnlocked', live: '', date: '2025-03', featured: true, gallery: [],
    },
    {
      id: 'pr-codebase', slug: 'understand-codebases', title: 'Understand Codebases',
      summary: 'Drop in a repository, ask questions in plain English, get answers grounded in the actual code.',
      body: 'An LLM-powered app that indexes the code you upload and answers questions about it with grounded references — a faster way into an unfamiliar codebase.',
      cover: U('photo-1515879218367-8466d910aaa4'), tags: ['Python', 'RAG', 'LLMs'], github: 'https://github.com/rajatrajoria/Understand-Codebases', live: '', date: '2025-08', featured: true, gallery: [],
    },
    {
      id: 'pr-redis', slug: 'miniredis', title: 'MiniRedis',
      summary: 'What does it take to build Redis? A from-scratch, Redis-compatible in-memory key-value store in Java.',
      body: 'A learning project that re-implements the heart of Redis: the RESP protocol, an event loop and the most common commands — because the best way to understand a tool is to build it.',
      cover: U('photo-1518770660439-4636190af475'), tags: ['Java', 'Systems', 'Networking'], github: 'https://github.com/rajatrajoria/miniredis-heizen', live: '', date: '2026-06', featured: false, gallery: [],
    },
    {
      id: 'pr-blood', slug: 'blood-data-management', title: 'Blood Data Management System',
      summary: 'Tamper-proof blood-bank logistics on a private Hyperledger Fabric blockchain. Accepted at ICMC 2025 (IIT Bhilai).',
      body:
        'A blockchain-based solution to standardise blood-donation processes and stamp out malpractice across agencies. We designed and implemented a private blockchain on **Hyperledger Fabric**, with smart contracts for donor registration, testing and inventory — giving real-time tracking, privacy and tamper-proof records.\n\nOur research on decentralised-ledger innovation in healthcare was **accepted at ICMC 2025 (IIT Bhilai)**.',
      cover: U('photo-1615461066159-fea0960485d5'), tags: ['Hyperledger Fabric', 'Blockchain', 'React'], github: 'https://github.com/rajatrajoria/blood-data-management-system', live: '', date: '2024-04', featured: false, gallery: [],
    },
    {
      id: 'pr-tenzies', slug: 'tenzies-plus', title: 'Tenzies Plus',
      summary: 'The classic dice game, reimagined with a globally synced leaderboard.',
      body: 'Roll until all ten dice match — then fight for a spot on the global scoreboard. Fully responsive.',
      cover: 'https://imgur.com/phfya5W.jpeg', tags: ['React', 'Firebase'], github: 'https://github.com/rajatrajoria/tenzies-reimagined', live: '', date: '2023-05', featured: false, gallery: [],
    },
    {
      id: 'pr-sudoku', slug: 'sudoku-solver', title: 'Sudoku Solver',
      summary: 'Cracks practically any Sudoku in seconds, with real-time validation and colour hints.',
      body: 'A backtracking Sudoku solver with a friendly GUI, real-time input validation and colour hints. Watch it chew through the hardest puzzles.',
      cover: 'https://imgur.com/H8MrEjk.jpeg', tags: ['JavaScript', 'Algorithms'], github: 'https://github.com/rajatrajoria/sudoku-solver', live: '', date: '2023-05', featured: false, gallery: [],
    },
    {
      id: 'pr-meme', slug: 'custom-meme-generator', title: 'Custom Meme Generator',
      summary: 'A fully responsive meme maker with practically every tool you need to let the photos talk.',
      body: 'Upload, caption, style and share — everything you need for the finest memes.',
      cover: 'https://imgur.com/riXSX2g.jpeg', tags: ['React', 'JavaScript'], github: 'https://github.com/rajatrajoria/custom-meme-generator', live: '', date: '2023-05', featured: false, gallery: [],
    },
  ],
  publications: [
    {
      id: 'pub-1', title: 'A Deep Feature Ensemble Methodology for 2D Biomedical Image Classification',
      venue: '6th International Conference on Computational Intelligence in Pattern Recognition (CIPR-2024)', year: '2024', status: 'Accepted',
      summary: 'Pre-processed biomedical images, customised deep architectures for classification and combined them into an ensemble reaching ~80% accuracy.',
      url: 'https://github.com/rajatrajoria/A-Deep-Feature-Ensemble-Methodology-for-2D-Biomedical-Image-Classification', cover: 'https://i.imgur.com/AgULUgo.jpeg',
    },
    {
      id: 'pub-2', title: 'A Lightweight Attention-Based Convolutional Neural Network for Classification of 3D Biomedical Images',
      venue: 'Swarm Optimization for Biomedical Applications — CRC Press (Taylor & Francis)', year: '2024', status: 'Accepted',
      summary: 'A 3D medical-imaging pipeline with an attention-enhanced 3D-CNN for efficient spatial feature processing that surpassed benchmark metrics. Accepted as a book chapter.',
      url: '', cover: 'https://imgur.com/EcLS61C.jpeg',
    },
    {
      id: 'pub-3', title: 'Attention-Based Deep Neural Networks for Automatic Organ Classification from 2D CT Scan Images',
      venue: 'MDPI Journal', year: '2024', status: 'Under review',
      summary: 'An attention-based model for automatic organ classification from 2D CT scans within the MedMNIST v2 framework.',
      url: '', cover: 'https://imgur.com/kCnoVkn.jpeg',
    },
    {
      id: 'pub-4', title: 'Blockchain-based Blood Data Management System',
      venue: 'ICMC 2025 — IIT Bhilai', year: '2025', status: 'Accepted',
      summary: 'Decentralised-ledger innovation in healthcare: a private Hyperledger Fabric network with smart contracts for transparent, tamper-proof blood-bank logistics.',
      url: 'https://github.com/rajatrajoria/blood-data-management-system', cover: U('photo-1639772823849-6efbd173043c', 600),
    },
  ],
  skills: [
    { id: 'sk-lang', name: 'Languages', items: ['Java', 'Python', 'TypeScript', 'JavaScript', 'SQL', 'C++'] },
    { id: 'sk-backend', name: 'Backend & Systems', items: ['Spring Boot', 'Spring Security', 'Kafka', 'Microservices', 'Distributed Systems', 'System Design', 'FastAPI'] },
    { id: 'sk-data', name: 'Data & Infra', items: ['PostgreSQL', 'MongoDB', 'Flyway', 'Docker', 'Grafana', 'Cloudflare Tunnel', 'Git'] },
    { id: 'sk-ai', name: 'AI & ML', items: ['Claude', 'Ollama', 'LLMs & Agents', 'RAG', 'TensorFlow', 'Computer Vision'] },
    { id: 'sk-web', name: 'Frontend', items: ['React', 'Tailwind', 'HTML & CSS'] },
  ],
  pages: [
    { id: 'page-blog', slug: 'blog', title: 'Blog', description: 'Notes from the workbench — engineering, AI experiments and lessons learned the hard way.', template: 'blog', cover: '', body: '', showInNav: true, visible: true },
    { id: 'page-photos', slug: 'photography', title: 'Photography', description: 'Frames from trails, cities and everything in between.', template: 'gallery', cover: '', body: '', showInNav: true, visible: false },
    { id: 'page-travel', slug: 'travel', title: 'Travel Stories', description: 'Treks, trails, and the people met along the way.', template: 'stories', cover: '', body: '', showInNav: true, visible: false },
    { id: 'page-poetry', slug: 'poetry', title: 'Poetry', description: 'Words that wouldn’t stay quiet.', template: 'poetry', cover: '', body: '', showInNav: true, visible: false },
  ],
};

export const seedEntries: Entry[] = [
  {
    id: 'entry-ai-gateway',
    page_id: 'page-blog',
    slug: 'private-ai-gateway-on-a-spare-laptop',
    title: 'I turned a spare laptop into a private AI gateway',
    excerpt: 'Burning through free-tier AI quotas, I built my own: Ollama, an auth gateway and a Cloudflare Tunnel. Here’s everything that broke along the way — and why the fix ended up being architectural.',
    cover: U('photo-1531297484001-80022131f5a1'),
    date: '2026-09-21',
    tags: ['ai', 'ollama', 'infrastructure', 'side-project'],
    published: true,
    body:
      "Last week I was burning through free-tier AI quotas fast. Around the third dead end I noticed a second laptop on my desk, powered on, doing nothing.\n\nSo I asked: *can I not have a private AI gateway?*\n\nI built a tiny one: a model running locally on **Ollama**, a gateway for auth and rate limits, a private UI for testing, and a **Cloudflare Tunnel** to reach it without opening a router port. Four Docker containers, Qwen2.5 7B in 4-bit, picked for its claimed 32K context.\n\n## 0.13 tokens per second\n\nThe first request returned nothing. I assumed it had hung. It hadn't — it finished, at **0.13 tok/s**.\n\nThe cause: I'd capped the container at 5 cores, but llama.cpp ignores that. It auto-detects the host's full core count and builds its thread pool around it — 14 threads fighting over five cores. Matching them (`OLLAMA_NUM_THREAD=5`) gave **4.93 tok/s, 38× faster, from one number**.\n\nThe chip — 4 performance cores, 8 efficiency cores, no hyperthreading — taught me that inference is lock-step: every thread finishes its layer-slice before the next starts, so one slow-core thread stalls the rest. Going from 5 to 8 threads was a 60% jump in threads for only 6% more speed. Not worth it.\n\n## The context window that wasn't\n\nA buried log line showed context was quietly capped at around **4K by default** — throwing away the reason I'd picked a 32K model. I set it to 16,384, since context is paid for in RAM I hadn't budgeted.\n\n## A wall I don't own\n\nNext I sent a real payload of over 9K tokens. It died with an empty error, killed at exactly **300 seconds**, 78% of the way through reading the prompt, before generation even began. The timeout had been a guess. I raised it to 1,200 s and the payload finished cleanly in about 8 minutes.\n\nBut that request travels over the public tunnel, and Cloudflare's free tier hard-caps proxied requests at **100 seconds** — not configurable even on Enterprise. No timeout tuning fixes a wall I don't own.\n\n## So the fix went architectural\n\nThe endpoint now hands back a **job ID** immediately, works in the background, and the caller polls a status endpoint until it's done — polling wearing a webhook's clothes. The queue lives in **SQLite on a volume**, so a job survives a restart.\n\n**More than one request at once?** Two Ollama instances were ruled out: the bottleneck was never process count, it was four fast cores. Splitting that budget just makes both crawl. So jobs are serialised — job A gets 8 threads and finishes in 8 minutes; job B waits and gets the same. Sixteen minutes total, neither slows the other, and callers see a queue position instead of silence.\n\n**The container dying mid-job** — common on a laptop — is handled too. State lives in SQLite, so nothing disappears with the process; on restart, anything still \"processing\" is marked failed instead of polling forever.\n\n## The one problem no setting fixes\n\nThe last lesson came by accident. Logging speed continuously, I watched it fall for the whole run, from 41 to 31 tok/s, with nothing in my config changing. **Thermal throttling.**\n\nEvery other problem was a number I controlled in a config file. This one didn't care — a reminder that it's a laptop, not a server rack.\n\n---\n\nThe code is on GitHub: [rajatrajoria/private-ai-gateway](https://github.com/rajatrajoria/private-ai-gateway).",
    extra: {},
  },
  {
    id: 'entry-hello',
    page_id: 'page-blog',
    slug: 'hello-world-again',
    title: 'Hello, world — again (built with an AI pair)',
    excerpt: 'Why I rebuilt this site from scratch, what it runs on, and what it felt like to build it with Claude as my pair programmer.',
    cover: '',
    date: '2026-11-21',
    tags: ['meta', 'ai', 'claude'],
    published: true,
    body:
      "My old portfolio was written when I was a pre-final-year student. It still said *\"currently in my pre-final year\"*. It was time.\n\n## The \"what if\"\n\nThe brief I gave myself: *what if I never had to touch code again just to update my own website?* New job title, new project, a photo from a trek, a poem at 2 a.m. — all of it should be a form and a **Save** button away.\n\nSo this site is really two things:\n\n- **The site you're reading** — dark, fast, and made of sections I can reorder, hide or add at will.\n- **A small CMS behind it** — profile, experience (with photos and certificates), projects, and pages built from templates: blog, photography, travel stories, poetry. Even \"years of experience\" works itself out from today's date.\n\n## Building it with Claude\n\nI built it pair-programming with **Claude**. I'd describe what I wanted, we'd argue about the data model, it would scaffold, I'd poke holes, and we'd iterate. It even pulled my details together from my old site, GitHub and LinkedIn.\n\nWhat surprised me wasn't the speed (though an idea-to-deployed-site loop measured in hours is wild). It was how much more ambitious the scope could be. Features I'd normally cut — templates, image galleries, backups — stayed in, because the cost of *trying* dropped to almost nothing.\n\nThe engineering judgement is still the job. AI just makes the distance between \"what if…?\" and \"oh, it works\" a lot shorter.\n\n## What's next here\n\n- **Engineering notes** from building payment systems and side projects\n- **AI experiments** — what actually works when you run models yourself\n- **Life** — treks, photos, and the occasional poem\n\nThanks for stopping by. If you have a \"what if…?\" of your own, my inbox is open.",
    extra: {},
  },
];
