const buyers = [
  {
    id: "BUY001",
    name: "Haryana Mega Food Processors Ltd",
    type: "Food Processing Enterprise",
    location: "Karnal, Haryana",
    state: "Haryana",
    district: "Karnal",
    crops: ["wheat", "maize", "potato", "paddy"],
    minimumQuantityTonnes: 10,
    offeredPricePerQuintal: {
      wheat: 2420,
      maize: 2120,
      potato: 1450,
      paddy: 4150,
    },
    paymentTerms: "Immediate Direct Bank Transfer within 24 hours of delivery",
    verificationStatus: "Verified Buyer (APMC License #HR-KNL-884)",
    contact: "+91-9876510001",
    email: "procurement@haryanafoodprocessors.com",
  },
  {
    id: "BUY002",
    name: "North India Grain Export Consortium",
    type: "Bulk Institutional Exporter",
    location: "Delhi NCR",
    state: "Delhi",
    district: "New Delhi",
    crops: ["wheat", "rice", "paddy", "soybean"],
    minimumQuantityTonnes: 20,
    offeredPricePerQuintal: {
      wheat: 2480,
      rice: 4400,
      paddy: 4250,
      soybean: 4750,
    },
    paymentTerms: "Escrow account backed, 50% advance upon loading",
    verificationStatus: "Verified Exporter (APEDA Reg #194022)",
    contact: "+91-9876510002",
    email: "trades@northindiagrain.com",
  },
  {
    id: "BUY003",
    name: "Kisan Unnati Farmer Producer Company (FPO)",
    type: "FPO Aggregator",
    location: "Panipat, Haryana",
    state: "Haryana",
    district: "Panipat",
    crops: ["wheat", "mustard", "chickpea", "millet"],
    minimumQuantityTonnes: 2, // Accessible for smallholders
    offeredPricePerQuintal: {
      wheat: 2360,
      mustard: 5600,
      chickpea: 5200,
      millet: 2300,
    },
    paymentTerms: "Same-day cash or UPI settlement at local FPO collection hub",
    verificationStatus: "NABARD & SFAC Recognized FPO",
    contact: "+91-9876510003",
    email: "contact@kisanunnati-fpo.org",
  },
  {
    id: "BUY004",
    name: "Malwa Oil & Agro Refineries",
    type: "Edible Oil Miller",
    location: "Indore, Madhya Pradesh",
    state: "Madhya Pradesh",
    district: "Indore",
    crops: ["soybean", "mustard"],
    minimumQuantityTonnes: 15,
    offeredPricePerQuintal: {
      soybean: 4720,
      mustard: 5650,
    },
    paymentTerms: "NEFT / RTGS within 48 hours post moisture testing",
    verificationStatus: "Verified Miller",
    contact: "+91-9876510004",
    email: "supplychain@malwaoilmills.com",
  },
  {
    id: "BUY005",
    name: "Punjab Flour & Semolina Mills",
    type: "Flour Mill",
    location: "Ludhiana, Punjab",
    state: "Punjab",
    district: "Ludhiana",
    crops: ["wheat", "maize"],
    minimumQuantityTonnes: 12,
    offeredPricePerQuintal: {
      wheat: 2400,
      maize: 2100,
    },
    paymentTerms: "Direct payment upon weighing at mill gate",
    verificationStatus: "Verified Miller",
    contact: "+91-9876510005",
    email: "procurement@punjabflour.com",
  },
];

// Inquiries store
const inquiries = [];

/**
 * Find potential buyers by crop and location
 * (Strictly preserves existing findBuyers(cropName, location) contract)
 */
export async function findBuyers(cropName = "", location = "") {
  try {
    const cLower = (cropName || "").toLowerCase().trim();
    const lLower = (location || "").toLowerCase().trim();

    let results = buyers.filter((buyer) => {
      const cropMatch =
        !cLower ||
        buyer.crops.some((c) => c.toLowerCase().includes(cLower) || cLower.includes(c.toLowerCase()));

      const locationMatch =
        !lLower ||
        buyer.location.toLowerCase().includes(lLower) ||
        buyer.state.toLowerCase().includes(lLower) ||
        buyer.district.toLowerCase().includes(lLower);

      return cropMatch && locationMatch;
    });

    if (results.length === 0 && cLower) {
      // Return buyers matching crop regardless of location (inter-state transport available)
      results = buyers.filter((buyer) =>
        buyer.crops.some((c) => c.toLowerCase().includes(cLower) || cLower.includes(c.toLowerCase()))
      );
    }

    if (results.length === 0) {
      results = buyers;
    }

    return {
      success: true,
      count: results.length,
      buyers: results,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      buyers,
    };
  }
}

/**
 * Create a direct sale inquiry / offer to a buyer
 */
export async function createBuyerInquiry({
  buyerId,
  farmerName,
  farmerContact,
  crop,
  quantityTonnes,
  expectedPricePerQuintal,
  notes = "",
}) {
  const buyer = buyers.find((b) => b.id === buyerId);
  if (!buyer) {
    return { success: false, message: `Buyer with ID ${buyerId} not found.` };
  }

  const inquiryId = `INQ-${Date.now().toString().slice(-6)}`;
  const inquiryRecord = {
    inquiryId,
    buyerId: buyer.id,
    buyerName: buyer.name,
    buyerContact: buyer.contact,
    farmerName,
    farmerContact,
    crop,
    quantityTonnes,
    expectedPricePerQuintal: expectedPricePerQuintal || buyer.offeredPricePerQuintal?.[crop.toLowerCase()] || 0,
    notes,
    status: "Pending Buyer Review",
    createdAt: new Date().toISOString(),
  };

  inquiries.push(inquiryRecord);

  return {
    success: true,
    message: `Direct inquiry sent to ${buyer.name} for ${quantityTonnes} tonnes of ${crop}. Buyer will contact via ${farmerContact}.`,
    inquiry: inquiryRecord,
  };
}

export async function getAllBuyers() {
  return {
    success: true,
    count: buyers.length,
    buyers,
  };
}