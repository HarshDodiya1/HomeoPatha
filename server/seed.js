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

// Dummy data

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
    },
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
    images: ["https://via.placeholder.com/300x300?text=Arnica+30CH"],
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
    images: ["https://via.placeholder.com/300x300?text=Nux+Vomica"],
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
    images: ["https://via.placeholder.com/300x300?text=Calcarea+Carb"],
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
    images: ["https://via.placeholder.com/300x300?text=Sulphur"],
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
    images: ["https://via.placeholder.com/300x300?text=Pulsatilla"],
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
    images: ["https://via.placeholder.com/300x300?text=Lycopodium"],
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
    images: ["https://via.placeholder.com/300x300?text=Hepar+Sulph"],
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
    images: ["https://via.placeholder.com/300x300?text=Belladonna"],
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

// Seeding function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Clear existing data (commented out for now)
    // console.log("🧹 Clearing existing data...");
    // await User.deleteMany({});
    // await Doctor.deleteMany({});
    // await Product.deleteMany({});
    // await Order.deleteMany({});
    // await Appointment.deleteMany({});
    // await ContactMessage.deleteMany({});
    // console.log("✅ Cleared existing data\n");

    // Seed admin
    console.log("👑 Seeding admin user...");
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
      console.log(`✅ Created admin user\n`);
    } else {
      console.log(`⏭️  Admin user already exists\n`);
      createdAdmin = adminExists;
    }

    // Seed patients
    console.log("👥 Seeding patients...");
    const hashedPatients = await Promise.all(
      dummyPatients.map(async (patient) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(patient.password, salt);
        return { ...patient, password: hashedPassword };
      }),
    );
    const createdPatients = await User.insertMany(hashedPatients, { ordered: false }).catch(() => []);
    console.log(`✅ Created ${createdPatients.length} patient users\n`);

    // Seed doctors
    console.log("👨‍⚕️ Seeding doctors...");
    const hashedDoctors = await Promise.all(
      dummyDoctors.map(async (doctor) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(doctor.password, salt);
        return { ...doctor, password: hashedPassword };
      }),
    );
    const createdDoctorUsers = await User.insertMany(
      hashedDoctors.map((doc) => ({
        fullName: doc.fullName,
        email: doc.email,
        password: doc.password,
        phoneNumber: doc.phoneNumber,
        role: doc.role,
        addresses: doc.addresses,
      })),
      { ordered: false },
    ).catch(() => []);

    const createdDoctors = await Promise.all(
      dummyDoctors.map(async (doctor, index) => {
        if (createdDoctorUsers[index]) {
          return Doctor.create({
            userId: createdDoctorUsers[index]._id,
            specialization: doctor.doctorDetails.specialization,
            qualification: doctor.doctorDetails.qualification,
            experience: doctor.doctorDetails.experience,
            consultationFee: doctor.doctorDetails.consultationFee,
            about: doctor.doctorDetails.about,
            rating: Math.floor(Math.random() * 2) + 4,
            totalRatings: Math.floor(Math.random() * 100) + 10,
          }).catch(() => null);
        }
      }),
    ).then(docs => docs.filter(doc => doc !== null));
    console.log(`✅ Created ${createdDoctors.length} doctors\n`);

    // Seed products
    console.log("💊 Seeding products...");
    const createdProducts = await Product.insertMany(dummyProducts, { ordered: false }).catch(() => []);
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // Seed orders
    console.log("📦 Seeding orders...");
    const orders = [];
    for (let i = 0; i < createdPatients.length; i++) {
      const patient = createdPatients[i];
      const numOrders = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < numOrders; j++) {
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedProducts = createdProducts
          .sort(() => Math.random() - 0.5)
          .slice(0, numItems);

        const orderItems = selectedProducts.map((product) => ({
          productId: product._id,
          title: product.title,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: product.currentPrice,
          image: product.images[0],
        }));

        const totalAmount = orderItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        orders.push({
          userId: patient._id,
          orderItems,
          shippingAddress: patient.addresses[0],
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
    const createdOrders = await Order.insertMany(orders, { ordered: false }).catch(() => []);
    console.log(`✅ Created ${createdOrders.length} orders\n`);

    // Seed appointments
    console.log("📅 Seeding appointments...");
    const appointments = [];
    for (let i = 0; i < createdPatients.length; i++) {
      const patient = createdPatients[i];
      const numAppointments = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < numAppointments; j++) {
        const doctor =
          createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
        const appointmentDate = new Date(
          Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
        );

        appointments.push({
          patientId: patient._id,
          doctorId: doctor._id,
          appointmentDate,
          appointmentTime: [
            "09:00",
            "10:00",
            "11:00",
            "14:00",
            "15:00",
            "16:00",
          ][Math.floor(Math.random() * 6)],
          duration: 30,
          reason: [
            "General Checkup",
            "Follow-up Consultation",
            "Specific Problem",
            "Annual Checkup",
          ][Math.floor(Math.random() * 4)],
          status: [
            "pending",
            "confirmed",
            "completed",
            "cancelled",
            "rescheduled",
          ][Math.floor(Math.random() * 5)],
          consultationFee: doctor.consultationFee,
          paymentStatus: ["pending", "completed"][
            Math.floor(Math.random() * 2)
          ],
          notes:
            Math.random() > 0.5
              ? "Patient responded well to treatment"
              : undefined,
          prescription:
            Math.random() > 0.5 ? "Take 3 times daily with water" : undefined,
        });
      }
    }
    const createdAppointments = await Appointment.insertMany(appointments, { ordered: false }).catch(() => []);
    console.log(`✅ Created ${createdAppointments.length} appointments\n`);

    // Seed contact messages
    console.log("💬 Seeding contact messages...");
    const createdContacts = await ContactMessage.insertMany(
      dummyContactMessages,
      { ordered: false }
    ).catch(() => []);
    console.log(`✅ Created ${createdContacts.length} contact messages\n`);

    console.log("✨ Database seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Admin: 1`);
    console.log(`   - Patients: ${createdPatients.length}`);
    console.log(`   - Doctors: ${createdDoctors.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Orders: ${createdOrders.length}`);
    console.log(`   - Appointments: ${createdAppointments.length}`);
    console.log(`   - Contact Messages: ${createdContacts.length}\n`);

    console.log("🔐 Test Credentials:");
    console.log("   Admin:");
    console.log(`     ${createdAdmin.email} / Admin@123`);
    console.log("   Patients:");
    createdPatients.slice(0, 2).forEach((patient, index) => {
      console.log(`     ${index + 1}. ${patient.email} / Patient@123`);
    });
    console.log("   Doctors:");
    createdDoctorUsers.slice(0, 2).forEach((doctor, index) => {
      console.log(`     ${index + 1}. ${doctor.email} / Doctor@123`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

// Run seeding
connectDB().then(seedDatabase);
