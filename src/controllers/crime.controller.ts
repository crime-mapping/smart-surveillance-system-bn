import Crime from "../models/Crime";
import { Request, Response } from "express";

export const getAllCrimes = async (req: Request, res: Response) => {
  try {
    const crimes = await Crime.find();
    res.status(200).json(crimes);
  } catch (error) {
    console.error("❌ Failed to fetch crimes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSingleCrime = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const crime = await Crime.findById(id);
    res.status(200).json(crime);
  } catch (error) {
    console.error("❌ Failed to fetch single crime:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createCrime = async (req: Request, res: Response) => {
  try {
    const crime = await Crime.create(req.body);
    res.status(201).json(crime);
  } catch (error) {
    console.error("❌ Failed to create crime:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const updateCrime = async (req: Request, res: Response) => {
  try {
    const crime = await Crime.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(crime);
  } catch (error) {
    console.error("❌ Failed to update crime:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const deleteCrime = async (req: Request, res: Response) => {
  try {
    await Crime.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("❌ Failed to delete crime:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /api/crimes/dashboard
export const getCrimeDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalCrimes = await Crime.countDocuments();
    const crimeRate = ((totalCrimes / 10000) * 100).toFixed(2); // Example rate

    const mostPopularCrime = await Crime.aggregate([
      {
        $group: {
          _id: "$crimeType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const crimeDistribution = await Crime.aggregate([
      {
        $group: {
          _id: "$crimeType",
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyCrimes = await Crime.aggregate([
      {
        $group: {
          _id: { $month: "$dateOfOccurrence" },
          total: { $sum: 1 },
        },
      },
    ]);

    const currentMonthTotal = monthlyCrimes[0]?.total || 0;
    const previousMonthTotal = monthlyCrimes[1]?.total || 0;
    const totalCrimesChange =
      previousMonthTotal === 0
        ? "+100%"
        : `${(
            ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) *
            100
          ).toFixed(1)}%`;

    const currentMonthRate = (currentMonthTotal / 10000) * 100;
    const previousMonthRate = (previousMonthTotal / 10000) * 100;

    const crimeRateChange =
      previousMonthRate === 0
        ? "+100%"
        : `${(
            ((currentMonthRate - previousMonthRate) / previousMonthRate) *
            100
          ).toFixed(1)}%`;

    const mostCommonCrimeTypeAgg = await Crime.aggregate([
      { $group: { _id: "$crimeType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const mostAffectedLocationAgg = await Crime.aggregate([
      { $group: { _id: "$crimeLocation", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const emergencyDistribution = await Crime.aggregate([
      { $group: { _id: "$emergencyLevel", count: { $sum: 1 } } },
    ]);

    const recentCrime = await Crime.findOne().sort({ createdAt: -1 });

    if (totalCrimes === 0) {
      res.status(200).json({
        totalCrimes: 0,
        crimeRate: 0,
        crimeRateChange: "+0%",
        totalCrimesChange: "+0%",
        mostPopularCrime: "None",
        crimeDistribution: [],
        recentCrime: null,
        monthlyCrimes: [],
        mostCommonCrimeType: "None",
        mostAffectedLocation: "None",
        emergencyDistribution: [],
      });
      return;
    }

    res.json({
      totalCrimes,
      crimeRate: Number(crimeRate),
      mostPopularCrime: mostPopularCrime[0]?._id || null,
      crimeDistribution,
      totalCrimesChange,
      crimeRateChange,
      recentCrime,
      monthlyCrimes,
      mostCommonCrimeType: mostCommonCrimeTypeAgg[0]?._id || null,
      mostAffectedLocation: mostAffectedLocationAgg[0]?._id || null,
      emergencyDistribution,
    });
  } catch (error) {
    console.error("❌ Failed to compute dashboard stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
