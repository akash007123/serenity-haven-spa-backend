require("dotenv").config();
const mongoose = require("mongoose");
const Service = require("./models/Service");

const SERVICE_IMAGES = {
  Swedish: "https://www.luxuryspa.net.in/wp-content/uploads/2018/12/female-to-male-body-massage-andheri-1024x683.jpeg",
  "Deep Tissue": "https://bluestonefirecupping.com/wp-content/uploads/2020/06/Man-getting-a-deep-tissue-massage-Blue-Stone-Firecupping-and-Massage.jpeg",
  Aromatherapy: "https://www.coolaromaspa.com/wp-content/uploads/2025/01/ayurvedic-oil-526x390-1.jpg",
  "Hot Stone": "https://media.istockphoto.com/id/514117556/photo/young-man-enjoying-during-hot-stone-therapy-at-the-spa.jpg?s=612x612&w=0&k=20&c=A4keFWattXQ-Y33qV1jaogcahZ37N76r-urw7qaTBTA=",
  Thai: "https://media.istockphoto.com/id/514117556/photo/young-man-enjoying-during-hot-stone-therapy-at-the-spa.jpg?s=612x612&w=0&k=20&c=A4keFWattXQ-Y33qV1jaogcahZ37N76r-urw7qaTBTA=",
  Reflexology: "https://static.vecteezy.com/system/resources/previews/004/827/472/non_2x/therapist-s-hands-massaging-male-foot-photo.jpg",
  Sports: "https://images.squarespace-cdn.com/content/v1/573ad1f637013b75a014d16d/1622361526968-B5N2IJALI3LHLBYKVS4U/shutterstock_1235492908.jpg?format=1000w",
  "Prenatal Massage": "https://www.luxuryspa.net.in/wp-content/uploads/2018/12/female-to-male-body-massage-andheri-1024x683.jpeg",
};

const services = [
  {
    slug: "swedish-massage",
    name: "Swedish Massage",
    shortDescription: "A classic full-body massage using long, flowing strokes to ease tension.",
    description: "A classic full-body massage using long, flowing strokes to ease tension, improve circulation, and promote deep relaxation. This traditional technique is perfect for those new to massage therapy.",
    durations: [
      { minutes: 60, price: "7900" },
      { minutes: 90, price: "10400" },
    ],
    price: "From ₹7,900",
    priceRange: { min: 7900, max: 10400 },
    image: SERVICE_IMAGES["Swedish"],
    category: "Classic",
    featured: true,
    popular: true,
    benefits: ["Stress relief", "Improved circulation", "Muscle relaxation", "Better sleep"],
    benefitDetails: [
      { label: "Reduces stress hormones" },
      { label: "Increases oxygen flow" },
      { label: "Eases muscle tension" },
      { label: "Promotes relaxation" },
    ],
    whatToExpect: [
      "Arrive 15 minutes early for consultation",
      "Your therapist will discuss your needs",
      "You'll be draped comfortably throughout",
      "Relaxing music and aromatherapy included",
    ],
    preparationTips: [
      "Avoid heavy meals 2 hours before",
      "Stay hydrated after your session",
      "Wear comfortable clothing",
    ],
    rating: 4.9,
    reviewCount: 1250,
    color: "#7c9885",
    gradient: "from-green-100 to-emerald-50",
    isActive: true,
  },
  {
    slug: "deep-tissue-massage",
    name: "Deep Tissue Massage",
    shortDescription: "Targeted pressure on deep muscle layers to release chronic tension.",
    description: "Targeted pressure on deep muscle layers to release chronic tension, knots, and adhesions for lasting pain relief. Ideal for athletes and those with persistent muscle issues.",
    durations: [
      { minutes: 60, price: "9550" },
      { minutes: 90, price: "12050" },
    ],
    price: "From ₹9,550",
    priceRange: { min: 9550, max: 12050 },
    image: SERVICE_IMAGES["Deep Tissue"],
    category: "Therapeutic",
    featured: true,
    popular: true,
    benefits: ["Pain relief", "Injury recovery", "Posture improvement", "Chronic tension release"],
    benefitDetails: [
      { label: "Releases muscle knots" },
      { label: "Improves posture" },
      { label: "Speeds recovery" },
      { label: "Reduces inflammation" },
    ],
    whatToExpect: [
      "More intense pressure than Swedish",
      "You may feel some discomfort",
      "Communicate with your therapist",
      "Deep breathing helps release tension",
    ],
    preparationTips: [
      "Communicate pressure preferences",
      "Stay hydrated before and after",
      "Avoid strenuous activity post-session",
    ],
    contraindications: ["Recent injuries", "Blood clots", "Osteoporosis"],
    rating: 4.8,
    reviewCount: 980,
    color: "#8b7355",
    gradient: "from-amber-100 to-orange-50",
    isActive: true,
  },
  {
    slug: "aromatherapy-massage",
    name: "Aromatherapy",
    shortDescription: "A soothing massage enhanced with premium essential oils.",
    description: "A soothing massage enhanced with premium essential oils, carefully blended to restore balance to body and mind. Choose from our signature oil blends for your specific needs.",
    durations: [
      { minutes: 75, price: "10000" },
    ],
    price: "₹10,000",
    priceRange: { min: 10000, max: 10000 },
    image: SERVICE_IMAGES["Aromatherapy"],
    category: "Wellness",
    featured: true,
    popular: false,
    benefits: ["Emotional balance", "Enhanced mood", "Skin nourishment", "Deep relaxation"],
    benefitDetails: [
      { label: "Calms the nervous system" },
      { label: "Uplifts mood naturally" },
      { label: "Nourishes skin" },
      { label: "Reduces anxiety" },
    ],
    whatToExpect: [
      "Consultation on oil preferences",
      "Custom oil blend prepared",
      "Gentle, flowing massage strokes",
      "Extended relaxation time",
    ],
    preparationTips: [
      "Share any allergies",
      "Specify preferred scents",
      "Arrive relaxed",
    ],
    rating: 4.9,
    reviewCount: 756,
    color: "#b8860b",
    gradient: "from-amber-100 to-yellow-50",
    isActive: true,
  },
  {
    slug: "hot-stone-therapy",
    name: "Hot Stone Therapy",
    shortDescription: "Heated basalt stones placed on key energy points.",
    description: "Heated basalt stones placed on key energy points while warm oil massage melts away deep-seated tension. The combination of heat and massage creates profound relaxation.",
    durations: [
      { minutes: 90, price: "11200" },
    ],
    price: "₹11,200",
    priceRange: { min: 11200, max: 11200 },
    image: SERVICE_IMAGES["Hot Stone"],
    category: "Therapeutic",
    featured: true,
    popular: true,
    benefits: ["Deep muscle relaxation", "Improved blood flow", "Stress reduction", "Energy balancing"],
    benefitDetails: [
      { label: "Muscles warm quickly" },
      { label: "Circulation improves" },
      { label: "Stress melts away" },
      { label: "Energy flows freely" },
    ],
    whatToExpect: [
      "Stones heated to comfortable temperature",
      "Stones placed on key points",
      "Warm oil massage between placements",
      "Deep warmth throughout body",
    ],
    preparationTips: [
      "Stay hydrated",
      "Avoid heavy meals",
      "Notify of any medical conditions",
    ],
    contraindications: ["Heart conditions", "Diabetes", "Skin sensitivities"],
    rating: 4.9,
    reviewCount: 890,
    color: "#cd853f",
    gradient: "from-orange-100 to-red-50",
    isActive: true,
  },
  {
    slug: "thai-massage",
    name: "Thai Massage",
    shortDescription: "Ancient healing art combining acupressure and stretching.",
    description: "An ancient healing art combining acupressure, stretching, and yoga-like movements to restore flexibility and energy flow. Performed on a mat with loose clothing.",
    durations: [
      { minutes: 90, price: "10400" },
      { minutes: 120, price: "12900" },
    ],
    price: "From ₹10,400",
    priceRange: { min: 10400, max: 12900 },
    image: SERVICE_IMAGES["Thai"],
    category: "Traditional",
    featured: false,
    popular: false,
    benefits: ["Increased flexibility", "Energy restoration", "Joint mobility", "Holistic healing"],
    benefitDetails: [
      { label: "Increases flexibility" },
      { label: "Energizes body" },
      { label: "Improves range of motion" },
      { label: "Balances energy" },
    ],
    whatToExpect: [
      "Performed on a floor mat",
      "Wearing comfortable clothing",
      "Combination of stretching and pressure",
      "No oil used",
    ],
    preparationTips: [
      "Wear loose, comfortable clothes",
      "Eat lightly beforehand",
      "Be prepared for movement",
    ],
    rating: 4.8,
    reviewCount: 654,
    color: "#daa520",
    gradient: "from-yellow-100 to-amber-50",
    isActive: true,
  },
  {
    slug: "reflexology",
    name: "Reflexology",
    shortDescription: "Pressure therapy focusing on feet, hands, and ears.",
    description: "A targeted pressure therapy that focuses on specific points in your feet, hands, and ears corresponding to different body organs and systems.",
    durations: [
      { minutes: 45, price: "5400" },
      { minutes: 60, price: "7100" },
    ],
    price: "From ₹5,400",
    priceRange: { min: 5400, max: 7100 },
    image: SERVICE_IMAGES["Reflexology"],
    category: "Targeted",
    featured: false,
    popular: false,
    benefits: ["Whole-body relaxation", "Improved circulation", "Stress relief", "Pain reduction"],
    benefitDetails: [
      { label: "Balances body systems" },
      { label: "Reduces foot pain" },
      { label: "Promotes overall wellness" },
      { label: "Enhances sleep" },
    ],
    whatToExpect: [
      "Sit comfortably in a recliner",
      "Focus on feet (or hands)",
      "Gentle to firm pressure",
      "Extremely relaxing experience",
    ],
    preparationTips: [
      "Remove nail polish if foot focus",
      "Communicate pressure preference",
      "Relax and breathe deeply",
    ],
    rating: 4.7,
    reviewCount: 432,
    color: "#20b2aa",
    gradient: "from-teal-100 to-cyan-50",
    isActive: true,
  },
  {
    slug: "sports-massage",
    name: "Sports Massage",
    shortDescription: "Specialized massage for athletes and active individuals.",
    description: "Specialized massage techniques designed for athletes and active individuals to enhance performance, prevent injuries, and speed recovery between training sessions.",
    durations: [
      { minutes: 30, price: "4600" },
      { minutes: 60, price: "8750" },
      { minutes: 90, price: "12050" },
    ],
    price: "From ₹4,600",
    priceRange: { min: 4600, max: 12050 },
    image: SERVICE_IMAGES["Sports"],
    category: "Therapeutic",
    featured: true,
    popular: true,
    benefits: ["Performance enhancement", "Injury prevention", "Faster recovery", "Flexibility"],
    benefitDetails: [
      { label: "Prevents injuries" },
      { label: "Speeds recovery" },
      { label: "Improves flexibility" },
      { label: "Enhances performance" },
    ],
    whatToExpect: [
      "Focus on problem areas",
      "May include stretching",
      "Adjustable intensity",
      "Pre or post-event options",
    ],
    preparationTips: [
      "Share your training schedule",
      "Communicate any injuries",
      "Hydrate well before and after",
    ],
    contraindications: ["Acute injuries", "Inflamed joints"],
    rating: 4.8,
    reviewCount: 567,
    color: "#4682b4",
    gradient: "from-blue-100 to-sky-50",
    isActive: true,
  },
  {
    slug: "prenatal-massage",
    name: "Prenatal Massage",
    shortDescription: "Gentle massage designed for expecting mothers.",
    description: "A gentle, nurturing massage specifically designed for the unique needs of pregnancy. Helps relieve common discomforts while promoting wellness for both mother and baby.",
    durations: [
      { minutes: 60, price: "7900" },
      { minutes: 90, price: "10400" },
    ],
    price: "From ₹7,900",
    priceRange: { min: 7900, max: 10400 },
    image: SERVICE_IMAGES["Prenatal Massage"],
    category: "Specialty",
    featured: false,
    popular: false,
    benefits: ["Reduced back pain", "Better sleep", "Swelling relief", "Relaxation"],
    benefitDetails: [
      { label: "Eases back pain" },
      { label: "Reduces swelling" },
      { label: "Improves sleep" },
      { label: "Calms anxiety" },
    ],
    whatToExpect: [
      "Side-lying position for comfort",
      "Pregnancy-safe techniques",
      "Adjustable positioning",
      "Relaxing atmosphere",
    ],
    preparationTips: [
      "Consult your doctor first",
      "Stay hydrated",
      "Arrive with comfortable clothes",
    ],
    contraindications: ["High-risk pregnancy", "Certain conditions (consult doctor)"],
    rating: 4.9,
    reviewCount: 345,
    color: "#db7093",
    gradient: "from-pink-100 to-rose-50",
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/spa-massage");
    console.log("Connected to MongoDB");

    // Clear existing services
    await Service.deleteMany({});
    console.log("Cleared existing services");

    // Insert new services
    await Service.insertMany(services);
    console.log(`Inserted ${services.length} services`);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
