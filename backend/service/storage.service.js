import mongoose from "mongoose";

// In-memory persistent state initialized with realistic Indian agricultural storage infrastructure
const storageFacilities = [
  {
    id: "ST001",
    name: "Karnal Precision Cold Storage",
    location: "Karnal, Haryana",
    state: "Haryana",
    district: "Karnal",
    type: "Cold Storage",
    suitableCrops: ["Potato", "Onion", "Tomato", "Fruits", "Vegetables"],
    temperatureCelsius: "2°C - 4°C",
    capacityTonnes: 5000,
    availableTonnes: 1200,
    pricePerTonnePerMonth: 850,
    features: ["Humidity Control", "Solar Backup", "Pre-cooling Chamber", "Pledge Financing (e-NWR)"],
    contact: "+91-9876500001",
    address: "GT Road, Near Anaj Mandi, Karnal, Haryana",
  },
  {
    id: "ST002",
    name: "Haryana Agri Warehousing Corp (HAWC)",
    location: "Panipat, Haryana",
    state: "Haryana",
    district: "Panipat",
    type: "Dry Warehouse",
    suitableCrops: ["Wheat", "Paddy", "Maize", "Mustard", "Barley"],
    temperatureCelsius: "Ambient",
    capacityTonnes: 12000,
    availableTonnes: 4500,
    pricePerTonnePerMonth: 480,
    features: ["WDRA Accredited", "Fumigation Certified", "Fire Safety", "Direct APMC Link"],
    contact: "+91-9876500002",
    address: "Sector 25 Phase 2, Industrial Area, Panipat, Haryana",
  },
  {
    id: "ST003",
    name: "Punjab Agro Silos & Logistics",
    location: "Ludhiana, Punjab",
    state: "Punjab",
    district: "Ludhiana",
    type: "Steel Grain Silo",
    suitableCrops: ["Wheat", "Paddy", "Maize"],
    temperatureCelsius: "Aerated Ambient",
    capacityTonnes: 25000,
    availableTonnes: 8200,
    pricePerTonnePerMonth: 520,
    features: ["Automated Conveyors", "Grain Cleaning", "Moisture Testing", "Railway Siding"],
    contact: "+91-9876500003",
    address: "Ferozepur Road, Ludhiana, Punjab",
  },
  {
    id: "ST004",
    name: "Malwa Agri Cold Chain Facility",
    location: "Indore, Madhya Pradesh",
    state: "Madhya Pradesh",
    district: "Indore",
    type: "Multi-Commodity Cold Storage",
    suitableCrops: ["Potato", "Garlic", "Spices", "Chili", "Soybean Seed"],
    temperatureCelsius: "0°C - 10°C",
    capacityTonnes: 8000,
    availableTonnes: 2900,
    pricePerTonnePerMonth: 780,
    features: ["Controlled Atmosphere", "Digital Inventory App", "Sorting & Grading Unit"],
    contact: "+91-9876500004",
    address: "Nemawar Road, Near APMC Yard, Indore, MP",
  },
  {
    id: "ST005",
    name: "Delhi NCR Agri Buffer Logistics Hub",
    location: "Azadpur, Delhi",
    state: "Delhi",
    district: "North Delhi",
    type: "Cold Storage & Distribution",
    suitableCrops: ["Fruits", "Vegetables", "Flowers"],
    temperatureCelsius: "1°C - 5°C",
    capacityTonnes: 6000,
    availableTonnes: 1100,
    pricePerTonnePerMonth: 950,
    features: ["24/7 Loading", "Reefer Truck Fleet", "Direct Market Access"],
    contact: "+91-9876500005",
    address: "Adjacent Azadpur Sabzi Mandi, Delhi",
  },
];

// Bookings store
const bookings = [];

/**
 * Find storage facilities by location or crop
 * (Strictly preserves existing findStorage(location) contract)
 */
export async function findStorage(location = "", crop = "") {
  try {
    const locLower = (location || "").toLowerCase().trim();
    const cropLower = (crop || "").toLowerCase().trim();

    let results = storageFacilities.filter((facility) => {
      const matchLoc =
        !locLower ||
        facility.location.toLowerCase().includes(locLower) ||
        facility.state.toLowerCase().includes(locLower) ||
        facility.district.toLowerCase().includes(locLower) ||
        facility.name.toLowerCase().includes(locLower);

      const matchCrop =
        !cropLower ||
        facility.suitableCrops.some((c) => c.toLowerCase().includes(cropLower));

      return matchLoc && matchCrop;
    });

    if (results.length === 0 && (locLower || cropLower)) {
      // Fallback: broaden search to nearby or any available facilities
      results = storageFacilities.filter((f) => f.availableTonnes > 0);
    }

    return {
      success: true,
      count: results.length,
      facilities: results,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      facilities: storageFacilities,
    };
  }
}

/**
 * Book or reserve space in an agricultural storage facility
 */
export async function bookStorage({
  facilityId,
  farmerName,
  farmerContact,
  crop,
  tonnes,
  startDate,
  durationMonths = 3,
}) {
  const facility = storageFacilities.find((f) => f.id === facilityId);
  if (!facility) {
    return { success: false, message: `Storage facility with ID ${facilityId} not found.` };
  }

  if (facility.availableTonnes < tonnes) {
    return {
      success: false,
      message: `Insufficient capacity. Requested ${tonnes} tonnes, but only ${facility.availableTonnes} tonnes are currently available.`,
    };
  }

  const bookingId = `BK-${Date.now().toString().slice(-6)}`;
  const totalCost = facility.pricePerTonnePerMonth * tonnes * durationMonths;

  // Deduct available capacity
  facility.availableTonnes -= tonnes;

  const bookingRecord = {
    bookingId,
    facilityId: facility.id,
    facilityName: facility.name,
    facilityLocation: facility.location,
    farmerName,
    farmerContact,
    crop,
    tonnes,
    startDate: startDate || new Date().toISOString().split("T")[0],
    durationMonths,
    monthlyRatePerTonne: facility.pricePerTonnePerMonth,
    totalEstimatedCost: totalCost,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
  };

  bookings.push(bookingRecord);

  return {
    success: true,
    message: `Storage reservation confirmed at ${facility.name} for ${tonnes} tonnes of ${crop}.`,
    booking: bookingRecord,
  };
}

export async function getAllStorageFacilities() {
  return {
    success: true,
    count: storageFacilities.length,
    facilities: storageFacilities,
  };
}