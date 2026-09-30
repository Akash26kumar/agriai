/**
 * Produce Aggregation & Farmer Producer Group Service
 * Supports smallholder farmer produce pooling to meet institutional buyer minimums (10-25+ tonnes)
 * and optimize transport logistics.
 */

// In-memory persistent active aggregation pools
const aggregationPools = [
  {
    id: "POOL-KNL-WHT-01",
    title: "Karnal Sharbati Wheat Bulk Pool",
    crop: "Wheat",
    hubLocation: "Karnal Anaj Mandi Hub, Haryana",
    targetBuyerId: "BUY002",
    targetBuyerName: "North India Grain Export Consortium",
    targetTonnes: 25,
    collectedTonnes: 18.5,
    minimumContributionTonnes: 1.0,
    targetPricePerQuintal: 2480,
    deadlineDate: "2026-10-15",
    status: "Active - Pooling in Progress",
    organizerFPO: "Kisan Unnati FPO",
    organizerContact: "+91-9876520001",
    participants: [
      { farmerName: "Gurpreet Singh", contact: "+91-9811100001", tonnes: 6.0, joinedAt: "2026-09-01" },
      { farmerName: "Rajesh Kumar", contact: "+91-9811100002", tonnes: 4.5, joinedAt: "2026-09-03" },
      { farmerName: "Virender Tyagi", contact: "+91-9811100003", tonnes: 8.0, joinedAt: "2026-09-10" },
    ],
  },
  {
    id: "POOL-PNP-MZE-02",
    title: "Panipat Hybrid Maize Industrial Pool",
    crop: "Maize",
    hubLocation: "Panipat APMC Collection Center, Haryana",
    targetBuyerId: "BUY001",
    targetBuyerName: "Haryana Mega Food Processors Ltd",
    targetTonnes: 20,
    collectedTonnes: 12.0,
    minimumContributionTonnes: 1.5,
    targetPricePerQuintal: 2120,
    deadlineDate: "2026-10-25",
    status: "Active - Pooling in Progress",
    organizerFPO: "Panipat Agro Producer Org",
    organizerContact: "+91-9876520002",
    participants: [
      { farmerName: "Amit Sharma", contact: "+91-9811100004", tonnes: 5.0, joinedAt: "2026-09-05" },
      { farmerName: "Sukhdev Yadav", contact: "+91-9811100005", tonnes: 7.0, joinedAt: "2026-09-08" },
    ],
  },
  {
    id: "POOL-IND-SOY-03",
    title: "Malwa Non-GMO Soybean Processing Pool",
    crop: "Soybean",
    hubLocation: "Indore Malwa Agro Terminal, Madhya Pradesh",
    targetBuyerId: "BUY004",
    targetBuyerName: "Malwa Oil & Agro Refineries",
    targetTonnes: 30,
    collectedTonnes: 24.0,
    minimumContributionTonnes: 2.0,
    targetPricePerQuintal: 4750,
    deadlineDate: "2026-10-30",
    status: "Active - Pooling in Progress",
    organizerFPO: "Malwa Kisan Samiti",
    organizerContact: "+91-9876520003",
    participants: [
      { farmerName: "Dharmendra Patel", contact: "+91-9811100006", tonnes: 10.0, joinedAt: "2026-09-02" },
      { farmerName: "Manoj Rathore", contact: "+91-9811100007", tonnes: 14.0, joinedAt: "2026-09-06" },
    ],
  },
];

/**
 * List active aggregation pools with optional filters
 */
export async function getAggregationPools({ crop = "", location = "" } = {}) {
  try {
    const cLower = (crop || "").toLowerCase().trim();
    const lLower = (location || "").toLowerCase().trim();

    let results = aggregationPools.filter((p) => {
      const matchCrop = !cLower || p.crop.toLowerCase().includes(cLower);
      const matchLoc = !lLower || p.hubLocation.toLowerCase().includes(lLower);
      return matchCrop && matchLoc;
    });

    if (results.length === 0 && (cLower || lLower)) {
      results = aggregationPools.filter((p) => !cLower || p.crop.toLowerCase().includes(cLower));
    }

    if (results.length === 0) {
      results = aggregationPools;
    }

    return {
      success: true,
      count: results.length,
      pools: results.map((p) => ({
        ...p,
        remainingTonnes: Number((p.targetTonnes - p.collectedTonnes).toFixed(1)),
        completionPercentage: Math.round((p.collectedTonnes / p.targetTonnes) * 100),
      })),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      pools: aggregationPools,
    };
  }
}

/**
 * Join an existing produce aggregation pool
 */
export async function joinAggregationPool({
  poolId,
  farmerName,
  farmerContact,
  contributedTonnes,
}) {
  const pool = aggregationPools.find((p) => p.id === poolId);
  if (!pool) {
    return { success: false, message: `Aggregation pool ${poolId} not found.` };
  }

  if (contributedTonnes < pool.minimumContributionTonnes) {
    return {
      success: false,
      message: `Minimum contribution for this pool is ${pool.minimumContributionTonnes} tonnes. You submitted ${contributedTonnes} tonnes.`,
    };
  }

  const remaining = pool.targetTonnes - pool.collectedTonnes;
  if (contributedTonnes > remaining) {
    return {
      success: false,
      message: `Only ${remaining.toFixed(1)} tonnes required to complete this pool. You proposed ${contributedTonnes} tonnes.`,
    };
  }

  pool.collectedTonnes = Number((pool.collectedTonnes + contributedTonnes).toFixed(1));
  pool.participants.push({
    farmerName,
    contact: farmerContact,
    tonnes: contributedTonnes,
    joinedAt: new Date().toISOString().split("T")[0],
  });

  if (pool.collectedTonnes >= pool.targetTonnes) {
    pool.status = "Full - Ready for Dispatch to Buyer";
  }

  return {
    success: true,
    message: `Successfully joined ${pool.title}! Contributed ${contributedTonnes} tonnes. Total collected: ${pool.collectedTonnes}/${pool.targetTonnes} tonnes (${Math.round((pool.collectedTonnes / pool.targetTonnes) * 100)}%).`,
    pool,
  };
}

/**
 * Create a new farmer aggregation pool
 */
export async function createAggregationPool({
  title,
  crop,
  hubLocation,
  targetTonnes,
  targetPricePerQuintal,
  organizerFPO,
  organizerContact,
  deadlineDate,
}) {
  const poolId = `POOL-${crop.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;
  const newPool = {
    id: poolId,
    title: title || `${hubLocation} ${crop} Aggregation Pool`,
    crop,
    hubLocation,
    targetBuyerId: null,
    targetBuyerName: "Open for Bidding / Direct Buyer",
    targetTonnes: targetTonnes || 20,
    collectedTonnes: 0,
    minimumContributionTonnes: 1.0,
    targetPricePerQuintal: targetPricePerQuintal || 2400,
    deadlineDate: deadlineDate || "2026-11-01",
    status: "Active - Pooling in Progress",
    organizerFPO: organizerFPO || "Local Farmer Group / FPO",
    organizerContact,
    participants: [],
  };

  aggregationPools.unshift(newPool);

  return {
    success: true,
    message: `New produce aggregation pool '${newPool.title}' created successfully.`,
    pool: newPool,
  };
}
