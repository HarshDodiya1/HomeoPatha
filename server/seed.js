const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("./src/models/User.js");
const Doctor = require("./src/models/Doctor.js");
const Product = require("./src/models/Product.js");
const Order = require("./src/models/Order.js");
const Appointment = require("./src/models/Appointment.js");
const ContactMessage = require("./src/models/ContactMessage.js");
const Specialization = require("./src/models/Specialization.js");
const AppointmentQuestion = require("./src/models/AppointmentQuestion.js");

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Dummy data definitions
const dummyAdmin = {
  fullName: "Harsh Dodiya",
  email: "admin@homeopatha.com",
  password: "Admin@123",
  phoneNumber: "9876543200",
  role: "superadmin",
  addresses: [
    {
      addressLine1: "100 Admin Street",
      addressLine2: "Administrative Building",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      isDefault: true,
    },
  ],
};

const dummyPatients = [
  {
    fullName: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    password: "Patient@123",
    phoneNumber: "9876543210",
    role: "patient",
    addresses: [
      {
        addressLine1: "123 Main Street",
        addressLine2: "Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        isDefault: true,
      },
      {
        addressLine1: "456 Secondary Road",
        addressLine2: "",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        isDefault: false,
      },
    ],
  },
  {
    fullName: "Priya Singh",
    email: "priya.singh@example.com",
    password: "Patient@123",
    phoneNumber: "9876543211",
    role: "patient",
    addresses: [
      {
        addressLine1: "789 Park Avenue",
        addressLine2: "Suite 200",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        isDefault: true,
      },
    ],
  },
  {
    fullName: "Amit Patel",
    email: "amit.patel@example.com",
    password: "Patient@123",
    phoneNumber: "9876543212",
    role: "patient",
    addresses: [
      {
        addressLine1: "321 Market Street",
        addressLine2: "",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        isDefault: true,
      },
    ],
  },
  {
    fullName: "Neha Gupta",
    email: "neha.gupta@example.com",
    password: "Patient@123",
    phoneNumber: "9876543213",
    role: "patient",
    addresses: [
      {
        addressLine1: "654 Hospital Lane",
        addressLine2: "Block A",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
        isDefault: true,
      },
    ],
  },
  {
    fullName: "Vikram Sharma",
    email: "vikram.sharma@example.com",
    password: "Patient@123",
    phoneNumber: "9876543214",
    role: "patient",
    addresses: [
      {
        addressLine1: "987 Wellness Road",
        addressLine2: "",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "380001",
        isDefault: true,
      },
    ],
  },
];

const dummyDoctors = [
  {
    fullName: "Dr. Suresh Verma",
    email: "dr.suresh.verma@example.com",
    password: "Doctor@123",
    phoneNumber: "9876543215",
    role: "doctor",
    addresses: [
      {
        addressLine1: "Medical Center, 100 Health Street",
        addressLine2: "Floor 3",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400002",
        isDefault: true,
      },
    ],
    doctorDetails: {
      specialization: "Cardiology",
      qualification: "MBBS, MD Cardiology",
      experience: 12,
      consultationFee: 500,
      about: "Experienced cardiologist with 12 years of practice in treating heart diseases.",
      images: ["https://yavuzceliker.github.io/sample-images/image-1.jpg"],
    },
  },
  {
    fullName: "Dr. Anjali Reddy",
    email: "dr.anjali.reddy@example.com",
    password: "Doctor@123",
    phoneNumber: "9876543216",
    role: "doctor",
    addresses: [
      {
        addressLine1: "Healing Center, 200 Care Avenue",
        addressLine2: "Floor 2",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560002",
        isDefault: true,
      },
    ],
    doctorDetails: {
      specialization: "Dermatology",
      qualification: "MBBS, MD Dermatology",
      experience: 8,
      consultationFee: 400,
      about: "Dermatologist specializing in skin care and cosmetic treatments.",
      images: ["https://yavuzceliker.github.io/sample-images/image-2.jpg"],
    },
  },
  {
    fullName: "Dr. Ramesh Joshi",
    email: "dr.ramesh.joshi@example.com",
    password: "Doctor@123",
    phoneNumber: "9876543217",
    role: "doctor",
    addresses: [
      {
        addressLine1: "Medical Plaza, 300 Health Park",
        addressLine2: "Suite 5",
        city: "Delhi",
        state: "Delhi",
        pincode: "110002",
        isDefault: true,
      },
    ],
    doctorDetails: {
      specialization: "Orthopedics",
      qualification: "MBBS, MS Orthopedics",
      experience: 15,
      consultationFee: 600,
      about: "Orthopedic surgeon with expertise in joint replacement and sports medicine.",
      images: ["https://yavuzceliker.github.io/sample-images/image-3.jpg"],
    },
  },
  {
    fullName: "Dr. Meera Chopra",
    email: "dr.meera.chopra@example.com",
    password: "Doctor@123",
    phoneNumber: "9876543218",
    role: "doctor",
    addresses: [
      {
        addressLine1: "Wellness Institute, 400 Cure Lane",
        addressLine2: "Floor 4",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500002",
        isDefault: true,
      },
    ],
    doctorDetails: {
      specialization: "Pediatrics",
      qualification: "MBBS, MD Pediatrics",
      experience: 10,
      consultationFee: 350,
      about: "Pediatrician dedicated to child health and developmental care.",
      images: ["https://yavuzceliker.github.io/sample-images/image-4.jpg"],
    },
  },
  {
    fullName: "Dr. Arjun Nair",
    email: "dr.arjun.nair@example.com",
    password: "Doctor@123",
    phoneNumber: "9876543219",
    role: "doctor",
    addresses: [
      {
        addressLine1: "Health Complex, 500 Medical Drive",
        addressLine2: "Block B",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411002",
        isDefault: true,
      },
    ],
    doctorDetails: {
      specialization: "Neurology",
      qualification: "MBBS, MD Neurology",
      experience: 11,
      consultationFee: 550,
      about: "Neurologist with expertise in treating neurological disorders.",
      images: ["https://yavuzceliker.github.io/sample-images/image-5.jpg"],
    },
  },
];

// Specializations for appointment booking
const dummySpecializations = [
  {
    name: "Cardiology",
    description: "Consultation for heart and cardiovascular system related issues including chest pain, palpitations, and blood pressure problems.",
    imageUrl: null,
    consultationFee: 500,
    isActive: true,
    tags: ["heart", "cardiovascular", "chest pain", "blood pressure", "palpitations"],
  },
  {
    name: "Dermatology",
    description: "Skin care consultation for acne, eczema, psoriasis, and other skin conditions.",
    imageUrl: null,
    consultationFee: 400,
    isActive: true,
    tags: ["skin", "acne", "eczema", "psoriasis", "hair loss"],
  },
  {
    name: "Orthopedics",
    description: "Bone and joint consultation for arthritis, back pain, sports injuries, and fractures.",
    imageUrl: null,
    consultationFee: 600,
    isActive: true,
    tags: ["bones", "joints", "arthritis", "back pain", "sports injury"],
  },
  {
    name: "Pediatrics",
    description: "Child health consultation for growth, development, and childhood illnesses.",
    imageUrl: null,
    consultationFee: 350,
    isActive: true,
    tags: ["child", "baby", "growth", "development", "vaccination"],
  },
  {
    name: "Neurology",
    description: "Consultation for neurological conditions including headaches, migraines, and nerve disorders.",
    imageUrl: null,
    consultationFee: 550,
    isActive: true,
    tags: ["brain", "nerves", "headache", "migraine", "seizures"],
  },
  {
    name: "Psychology",
    description: "Mental health consultation for anxiety, depression, stress, and behavioral issues.",
    imageUrl: null,
    consultationFee: 450,
    isActive: true,
    tags: ["mental health", "anxiety", "depression", "stress", "counseling"],
  },
  {
    name: "General Medicine",
    description: "General health consultation for fever, cold, cough, and other common ailments.",
    imageUrl: null,
    consultationFee: 300,
    isActive: true,
    tags: ["general", "fever", "cold", "cough", "wellness"],
  },
  {
    name: "Gastroenterology",
    description: "Digestive system consultation for stomach issues, acidity, and digestive disorders.",
    imageUrl: null,
    consultationFee: 500,
    isActive: true,
    tags: ["stomach", "digestion", "acidity", "liver", "intestine"],
  },
];

// Global questions (apply to all specializations)
const dummyGlobalQuestions = [
  {
    question: "What symptoms are you currently experiencing?",
    questionType: "textarea",
    options: [],
    isRequired: true,
    specializationId: null,
    order: 1,
    placeholder: "Please describe your symptoms in detail...",
    isActive: true,
  },
  {
    question: "How long have you been experiencing these symptoms?",
    questionType: "select",
    options: ["Less than a week", "1-2 weeks", "2-4 weeks", "1-3 months", "More than 3 months"],
    isRequired: true,
    specializationId: null,
    order: 2,
    placeholder: "",
    isActive: true,
  },
  {
    question: "Have you consulted a doctor for this issue before?",
    questionType: "radio",
    options: ["Yes", "No"],
    isRequired: true,
    specializationId: null,
    order: 3,
    placeholder: "",
    isActive: true,
  },
  {
    question: "Are you currently taking any medications?",
    questionType: "textarea",
    options: [],
    isRequired: false,
    specializationId: null,
    order: 4,
    placeholder: "List any medications you are currently taking...",
    isActive: true,
  },
  {
    question: "Do you have any known allergies?",
    questionType: "text",
    options: [],
    isRequired: false,
    specializationId: null,
    order: 5,
    placeholder: "e.g., Penicillin, Peanuts, etc.",
    isActive: true,
  },
];

const dummyProducts = [
  {
    title: "Arnica Montana 30CH",
    category: "Homeopathic Remedies",
    description: "Effective for bruises, injuries, and trauma. Relief from physical shock and soreness.",
    badge: "Best Seller",
    rating: 4.5,
    oldPrice: 250,
    currentPrice: 199,
    images: [
      "https://yavuzceliker.github.io/sample-images/image-6.jpg",
      "https://yavuzceliker.github.io/sample-images/image-7.jpg",
    ],
    tags: ["bruises", "injury", "pain", "relief"],
    isActive: true,
  },
  {
    title: "Nux Vomica 30CH",
    category: "Homeopathic Remedies",
    description: "Relieves indigestion, constipation, and digestive disturbances. Helpful for stress-related issues.",
    badge: "Popular",
    rating: 4.3,
    oldPrice: 220,
    currentPrice: 179,
    images: [
      "https://yavuzceliker.github.io/sample-images/image-8.jpg",
    ],
    tags: ["digestion", "stress", "constipation"],
    isActive: true,
  },
  {
    title: "Calcarea Carbonica 30CH",
    category: "Homeopathic Remedies",
    description: "Supports immune system and bone health. Beneficial for general weakness.",
    badge: "Recommended",
    rating: 4.2,
    oldPrice: 240,
    currentPrice: 189,
    images: [
      "https://yavuzceliker.github.io/sample-images/image-9.jpg",
      "https://yavuzceliker.github.io/sample-images/image-10.jpg",
    ],
    tags: ["immunity", "bones", "health"],
    isActive: true,
  },
  {
    title: "Sulphur 30CH",
    category: "Homeopathic Remedies",
    description: "Treats skin conditions, itching, and purification. Known as 'the king of remedies'.",
    badge: "Best Seller",
    rating: 4.6,
    oldPrice: 210,
    currentPrice: 169,
    images: [
      "https://yavuzceliker.github.io/sample-images/image-11.jpg",
    ],
    tags: ["skin", "itching", "detox"],
    isActive: true,
  },
  {
    title: "Pulsatilla 30CH",
    category: "Homeopathic Remedies",
    description: "Excellent for emotional balance and women's health issues.",
    badge: "Popular",
    rating: 4.4,
    oldPrice: 230,
    currentPrice: 179,
    images: [
      "https://yavuzceliker.github.io/sample-images/image-12.jpg",
      "https://yavuzceliker.github.io/sample-images/image-13.jpg",
    ],
    tags: ["emotions", "womens-health", "balance"],
    isActive: true,
  },
  {
    title: "Lycopodium 30CH",
    category: "Homeopathic Remedies",
    description: "Helps with digestive issues, anxiety, and confidence building.",
    badge: "Trending",
    rating: 4.1,
    oldPrice: 220,
    currentPrice: 174,
    images: [
      "https://yavuzceliker.github.io/sample-images/image-14.jpg",
    ],
    tags: ["digestion", "anxiety", "confidence"],
    isActive: true,
  },
  {
    title: "Hepar Sulph 30CH",
    category: "Homeopathic Remedies",
    description: "Supports respiratory health and skin issues. Promotes healing.",
    badge: "New",
    rating: 4.2,
    oldPrice: 215,
    currentPrice: 169,
    images: [
      "https://yavuzceliker.github.io/sample-images/image-15.jpg",
      "https://yavuzceliker.github.io/sample-images/image-16.jpg",
    ],
    tags: ["respiratory", "skin", "healing"],
    isActive: true,
  },
  {
    title: "Belladonna 30CH",
    category: "Homeopathic Remedies",
    description: "Effective for fever, inflammation, and acute conditions.",
    badge: "Recommended",
    rating: 4.3,
    oldPrice: 225,
    currentPrice: 179,
    images: [
      "https://yavuzceliker.github.io/sample-images/image-17.jpg",
    ],
    tags: ["fever", "inflammation", "acute"],
    isActive: true,
  },
];

const dummyContactMessages = [
  {
    fullName: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "9876543220",
    message: "Great service! Your homeopathic remedies really helped me with my health issues.",
  },
  {
    fullName: "Sarah Williams",
    email: "sarah.williams@example.com",
    phoneNumber: "9876543221",
    message: "I have a question about your consultation fees and appointment scheduling.",
  },
  {
    fullName: "Michael Brown",
    email: "michael.brown@example.com",
    phoneNumber: "9876543222",
    message: "Can you provide information about your product shipping and delivery times?",
  },
];

// Specialization-specific questions (will be linked after specializations are created)
const dummySpecializationQuestions = {
  "Cardiology": [
    {
      question: "Do you experience chest pain or discomfort?",
      questionType: "radio",
      options: ["Yes, frequently", "Sometimes", "Rarely", "Never"],
      isRequired: true,
      order: 10,
      placeholder: "",
      isActive: true,
    },
    {
      question: "Do you have a family history of heart disease?",
      questionType: "radio",
      options: ["Yes", "No", "Not sure"],
      isRequired: true,
      order: 11,
      placeholder: "",
      isActive: true,
    },
  ],
  "Dermatology": [
    {
      question: "Where is the affected skin area?",
      questionType: "checkbox",
      options: ["Face", "Arms", "Legs", "Back", "Chest", "Scalp", "Other"],
      isRequired: true,
      order: 10,
      placeholder: "",
      isActive: true,
    },
    {
      question: "Is the affected area itchy or painful?",
      questionType: "radio",
      options: ["Itchy", "Painful", "Both", "Neither"],
      isRequired: true,
      order: 11,
      placeholder: "",
      isActive: true,
    },
  ],
  "Orthopedics": [
    {
      question: "Which area is causing you pain?",
      questionType: "checkbox",
      options: ["Neck", "Back", "Shoulder", "Elbow", "Wrist", "Hip", "Knee", "Ankle", "Other"],
      isRequired: true,
      order: 10,
      placeholder: "",
      isActive: true,
    },
    {
      question: "Rate your pain level on a scale of 1-10",
      questionType: "select",
      options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      isRequired: true,
      order: 11,
      placeholder: "",
      isActive: true,
    },
  ],
  "Psychology": [
    {
      question: "How would you describe your current mood?",
      questionType: "select",
      options: ["Happy", "Neutral", "Sad", "Anxious", "Stressed", "Angry", "Confused"],
      isRequired: true,
      order: 10,
      placeholder: "",
      isActive: true,
    },
    {
      question: "How are your sleep patterns?",
      questionType: "radio",
      options: ["Good (7-8 hours)", "Too much (>9 hours)", "Too little (<6 hours)", "Irregular"],
      isRequired: true,
      order: 11,
      placeholder: "",
      isActive: true,
    },
  ],
  "Pediatrics": [
    {
      question: "What is the child's age?",
      questionType: "text",
      options: [],
      isRequired: true,
      order: 10,
      placeholder: "e.g., 5 years",
      isActive: true,
    },
    {
      question: "Is the child's vaccination up to date?",
      questionType: "radio",
      options: ["Yes", "No", "Partially"],
      isRequired: true,
      order: 11,
      placeholder: "",
      isActive: true,
    },
  ],
  "Gastroenterology": [
    {
      question: "What digestive symptoms are you experiencing?",
      questionType: "checkbox",
      options: ["Acidity", "Bloating", "Constipation", "Diarrhea", "Nausea", "Vomiting", "Abdominal pain"],
      isRequired: true,
      order: 10,
      placeholder: "",
      isActive: true,
    },
    {
      question: "How often do you experience these symptoms?",
      questionType: "select",
      options: ["Daily", "Several times a week", "Once a week", "Occasionally"],
      isRequired: true,
      order: 11,
      placeholder: "",
      isActive: true,
    },
  ],
};

// Seeding function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding (Add Mode)...\n");

    // --- Admin ---
    console.log("👑 Checking/Seeding admin user...");
    const adminExists = await User.findOne({ email: dummyAdmin.email });
    let createdAdmin;
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedAdminPassword = await bcrypt.hash(dummyAdmin.password, salt);
      createdAdmin = await User.create({
        fullName: dummyAdmin.fullName,
        email: dummyAdmin.email,
        password: hashedAdminPassword,
        phoneNumber: dummyAdmin.phoneNumber,
        role: dummyAdmin.role,
        addresses: dummyAdmin.addresses,
      });
      console.log(`✅ Created admin user`);
    } else {
      console.log(`⏭️  Admin user already exists`);
      createdAdmin = adminExists;
    }
    console.log("");

    // --- Patients ---
    console.log("👥 Checking/Seeding patients...");
    let newPatientsCount = 0;
    for (const patient of dummyPatients) {
      const exists = await User.findOne({ email: patient.email });
      if (!exists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(patient.password, salt);
        await User.create({ ...patient, password: hashedPassword });
        newPatientsCount++;
      }
    }
    // Fetch ALL patients (new and existing) to allow order creation
    const allPatients = await User.find({ role: "patient" });
    console.log(
      `✅ Added ${newPatientsCount} new patients. Total available: ${allPatients.length}\n`
    );

    // --- Doctors ---
    console.log("👨‍⚕️ Checking/Seeding doctors...");
    let newDoctorsCount = 0;
    for (const doctor of dummyDoctors) {
      const userExists = await User.findOne({ email: doctor.email });
      let doctorUserId;

      if (!userExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(doctor.password, salt);
        const newUser = await User.create({
          fullName: doctor.fullName,
          email: doctor.email,
          password: hashedPassword,
          phoneNumber: doctor.phoneNumber,
          role: doctor.role,
          addresses: doctor.addresses,
        });
        doctorUserId = newUser._id;
      } else {
        doctorUserId = userExists._id;
      }

      // Check if Doctor profile exists for this User
      const doctorProfileExists = await Doctor.findOne({ userId: doctorUserId });
      if (!doctorProfileExists) {
        await Doctor.create({
          userId: doctorUserId,
          specialization: doctor.doctorDetails.specialization,
          qualification: doctor.doctorDetails.qualification,
          experience: doctor.doctorDetails.experience,
          consultationFee: doctor.doctorDetails.consultationFee,
          about: doctor.doctorDetails.about,
          images: doctor.doctorDetails.images || [],
          rating: Math.floor(Math.random() * 2) + 4,
          totalRatings: Math.floor(Math.random() * 100) + 10,
        });
        newDoctorsCount++;
      }
    }
    // Fetch ALL doctor profiles
    const allDoctors = await Doctor.find({});
    console.log(
      `✅ Added ${newDoctorsCount} new doctor profiles. Total available: ${allDoctors.length}\n`
    );

    // --- Specializations ---
    console.log("🏥 Checking/Seeding specializations...");
    let newSpecializationsCount = 0;
    const createdSpecializations = [];
    for (const spec of dummySpecializations) {
      const exists = await Specialization.findOne({ name: spec.name });
      if (!exists) {
        const created = await Specialization.create(spec);
        createdSpecializations.push(created);
        newSpecializationsCount++;
      } else {
        createdSpecializations.push(exists);
      }
    }
    const allSpecializations = await Specialization.find({});
    console.log(
      `✅ Added ${newSpecializationsCount} new specializations. Total available: ${allSpecializations.length}\n`
    );

    // --- Appointment Questions (Global) ---
    console.log("❓ Checking/Seeding global appointment questions...");
    let newGlobalQuestionsCount = 0;
    for (const question of dummyGlobalQuestions) {
      const exists = await AppointmentQuestion.findOne({
        question: question.question,
        specializationId: null,
      });
      if (!exists) {
        await AppointmentQuestion.create(question);
        newGlobalQuestionsCount++;
      }
    }
    console.log(`✅ Added ${newGlobalQuestionsCount} new global questions\n`);

    // --- Appointment Questions (Specialization-specific) ---
    console.log("❓ Checking/Seeding specialization-specific questions...");
    let newSpecQuestionsCount = 0;
    for (const [specName, questions] of Object.entries(dummySpecializationQuestions)) {
      const specialization = allSpecializations.find(s => s.name === specName);
      if (specialization) {
        for (const question of questions) {
          const exists = await AppointmentQuestion.findOne({
            question: question.question,
            specializationId: specialization._id,
          });
          if (!exists) {
            await AppointmentQuestion.create({
              ...question,
              specializationId: specialization._id,
            });
            newSpecQuestionsCount++;
          }
        }
      }
    }
    const allQuestions = await AppointmentQuestion.find({});
    console.log(
      `✅ Added ${newSpecQuestionsCount} new specialization-specific questions. Total questions: ${allQuestions.length}\n`
    );

    // --- Products ---
    console.log("💊 Seeding products (Appending)...");
    const createdProducts = await Product.insertMany(dummyProducts, {
      ordered: false,
    }).catch(() => []);
    console.log(`✅ Added ${createdProducts.length} products\n`);

    // Re-fetch all products to use for orders
    const allProducts = await Product.find({});

    if (allPatients.length > 0 && allProducts.length > 0) {
      // --- Orders ---
      console.log("📦 Seeding orders (For all patients)...");
      const orders = [];
      for (const patient of allPatients) {
        // Create random orders for every patient found
        const numOrders = Math.floor(Math.random() * 2) + 1; // 1 to 2 orders per run

        for (let j = 0; j < numOrders; j++) {
          const numItems = Math.floor(Math.random() * 3) + 1;
          const selectedProducts = allProducts
            .sort(() => Math.random() - 0.5)
            .slice(0, numItems);

          const orderItems = selectedProducts.map((product) => ({
            productId: product._id,
            title: product.title,
            quantity: Math.floor(Math.random() * 3) + 1,
            price: product.currentPrice,
            image:
              product.images && product.images.length > 0
                ? product.images[0]
                : "",
          }));

          const totalAmount = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          orders.push({
            userId: patient._id,
            orderItems,
            shippingAddress:
              patient.addresses && patient.addresses.length > 0
                ? patient.addresses[0]
                : {
                    addressLine1: "Dummy Address",
                    city: "City",
                    state: "State",
                    pincode: "000000",
                  },
            paymentMethod: Math.random() > 0.5 ? "razorpay" : "cod",
            paymentStatus: ["pending", "completed", "failed"][
              Math.floor(Math.random() * 3)
            ],
            totalAmount,
            orderStatus: ["pending", "confirmed", "processing", "shipped"][
              Math.floor(Math.random() * 4)
            ],
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
        }
      }
      const createdOrders = await Order.insertMany(orders, {
        ordered: false,
      }).catch((err) => {
        console.error("Order seed error:", err.message);
        return [];
      });
      console.log(`✅ Added ${createdOrders.length} orders\n`);
    }

    if (allPatients.length > 0 && allSpecializations.length > 0) {
      // --- Appointments (Now based on Specializations) ---
      console.log("📅 Seeding appointments (For all patients with specializations)...");
      const appointments = [];

      for (const patient of allPatients) {
        const numAppointments = Math.floor(Math.random() * 2) + 1;

        for (let j = 0; j < numAppointments; j++) {
          // Pick a random specialization
          const specialization = allSpecializations[Math.floor(Math.random() * allSpecializations.length)];

          // Get questions for this specialization (global + specialization-specific)
          const questionsForSpec = allQuestions.filter(
            q => q.specializationId === null || 
                 (q.specializationId && q.specializationId.toString() === specialization._id.toString())
          );

          // Generate dummy responses for all required questions
          const questionResponses = questionsForSpec
            .filter(q => q.isRequired)
            .map(q => {
              let answer = "";
              switch (q.questionType) {
                case "text":
                case "textarea":
                  answer = "Sample response for " + q.question.substring(0, 20);
                  break;
                case "select":
                case "radio":
                  answer = q.options.length > 0 ? q.options[0] : "Yes";
                  break;
                case "checkbox":
                  answer = q.options.length > 0 ? q.options.slice(0, 2).join(", ") : "Option 1, Option 2";
                  break;
                case "number":
                  answer = "5";
                  break;
                case "date":
                  answer = new Date().toISOString().split('T')[0];
                  break;
                default:
                  answer = "Sample answer";
              }
              return {
                questionId: q._id,
                question: q.question,
                answer: answer,
              };
            });

          appointments.push({
            patientId: patient._id,
            specializationId: specialization._id,
            questionResponses: questionResponses,
            status: ["pending", "confirmed", "completed", "cancelled"][
              Math.floor(Math.random() * 4)
            ],
            consultationFee: specialization.consultationFee,
            paymentStatus: ["pending", "completed"][
              Math.floor(Math.random() * 2)
            ],
            razorpayOrderId: "order_" + Math.random().toString(36).substring(7),
            razorpayPaymentId: Math.random() > 0.5 ? "pay_" + Math.random().toString(36).substring(7) : undefined,
            prescription:
              Math.random() > 0.5
                ? "Take 3 times daily with water"
                : undefined,
          });
        }
      }

      const createdAppointments = await Appointment.insertMany(appointments, {
        ordered: false,
      }).catch((err) => {
        console.error("Appointment seed error:", err.message);
        return [];
      });
      console.log(`✅ Added ${createdAppointments.length} appointments\n`);
    }

    // --- Contact Messages ---
    console.log("💬 Seeding contact messages (Appending)...");
    const createdContacts = await ContactMessage.insertMany(
      dummyContactMessages,
      { ordered: false }
    ).catch(() => []);
    console.log(`✅ Added ${createdContacts.length} contact messages\n`);

    console.log("✨ Database population completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

// Run seeding
connectDB().then(seedDatabase);
