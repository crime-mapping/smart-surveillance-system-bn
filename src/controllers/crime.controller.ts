import Crime, { CrimeType } from "../models/Crime";
import { Request, Response } from "express";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { io } from "../server";
import Notification from "../models/Notification";
import SupervisedLocation from "../models/SupervisedLocation";

export const getAllCrimes = async (req: Request, res: Response) => {
  try {
    const crimes = await Crime.find()
      .populate("crimeLocation")
      .sort({ createdAt: -1 });
    res.status(200).json(crimes);
  } catch (error) {
    console.error("❌ Failed to fetch crimes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSingleCrime = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const crime = await Crime.findById(id).populate("crimeLocation");
    res.status(200).json(crime);
  } catch (error) {
    console.error("❌ Failed to fetch single crime:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createCrime = async (req: Request, res: Response) => {
  try {
    const crime = await Crime.create(req.body);
    const location = await SupervisedLocation.findById(crime.crimeLocation);
    const newNotification = {
      title: `A new crime of ${crime.crimeType} was detected`,
      description: `${crime.crimeType} was suspected at ${location?.location} with ${crime.emergencyLevel} severity`,
    };
    const notification = await Notification.create(newNotification);
    io.emit("crime-notification", notification);
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

    const mostCommonCrimeTypeAgg = await Crime.aggregate([
      { $group: { _id: "$crimeType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const mostAffectedLocationAgg = await Crime.aggregate([
      {
        $group: { _id: "$crimeLocation", count: { $sum: 1 } },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: "supervisedlocations",
          localField: "_id",
          foreignField: "_id",
          as: "locationDetails",
        },
      },
      {
        $unwind: "$locationDetails",
      },
      {
        $project: {
          count: 1,
          location: "$locationDetails",
        },
      },
    ]);

    const emergencyDistribution = await Crime.aggregate([
      { $group: { _id: "$emergencyLevel", count: { $sum: 1 } } },
    ]);

    const recentCrime = await Crime.findOne()
      .sort({ createdAt: -1 })
      .populate("crimeLocation");

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfPreviousMonth = startOfMonth(subMonths(now, 1));

    const currentMonthTotal = await Crime.countDocuments({
      dateOfOccurrence: { $gte: startOfCurrentMonth, $lt: now },
    });

    const previousMonthTotal = await Crime.countDocuments({
      dateOfOccurrence: {
        $gte: startOfPreviousMonth,
        $lt: startOfCurrentMonth,
      },
    });

    const totalCrimes = await Crime.countDocuments();
    const crimeRate = ((currentMonthTotal / 10000) * 100).toFixed(2);

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

    // route: GET /api/crimes/hotspots

    const crimeHotspots = await Crime.aggregate([
      {
        $lookup: {
          from: "supervisedlocations",
          localField: "crimeLocation",
          foreignField: "_id",
          as: "locationDetails",
        },
      },
      { $unwind: "$locationDetails" },
      {
        $group: {
          _id: "$crimeLocation",
          crimeTypes: { $addToSet: "$crimeType" },
          crimeCount: { $sum: 1 },
          lastUpdated: { $max: "$updatedAt" },
          location: { $first: "$locationDetails.location" },
          coordinates: { $first: "$locationDetails.coordinates" }, // add coordinates in schema
          description: { $first: "$locationDetails.description" },
        },
      },
      {
        $addFields: {
          severity: {
            $switch: {
              branches: [
                { case: { $gte: ["$crimeCount", 20] }, then: "high" },
                { case: { $gte: ["$crimeCount", 10] }, then: "medium" },
              ],
              default: "low",
            },
          },
        },
      },
    ]);

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
      mostAffectedLocation:
        mostAffectedLocationAgg[0]?.location.location || null,
      emergencyDistribution,
      crimeHotspots,
    });
  } catch (error) {
    console.error("❌ Failed to compute dashboard stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//predictive analytics
export const getCrimeAnalytics = async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i);

    // Dynamic types
    const crimeTypes = Object.values(CrimeType);

    const analytics = await Promise.all(
      months.map(async (month) => {
        const start = startOfMonth(new Date(currentYear, month));
        const end = endOfMonth(new Date(currentYear, month));
        const crimes = await Crime.find({
          dateOfOccurrence: { $gte: start, $lte: end },
        });

        const counts: Record<string, number> = {};
        crimeTypes.forEach((type) => {
          counts[type] = crimes.filter((c) => c.crimeType === type).length;
        });

        return {
          month: start.toLocaleString("default", { month: "short" }),
          ...counts,
        };
      })
    );

    res.json({ analytics, crimeTypes });
  } catch (error) {
    console.error("Error in getCrimeAnalytics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Crime Hotpost Frequency
export const getCrimeHospotFrequency = async (req: Request, res: Response) => {
  try {
    const results = await Crime.aggregate([
      {
        $group: {
          _id: "$crimeLocation",
          totalCrimes: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "supervisedlocations",
          localField: "_id",
          foreignField: "_id",
          as: "location",
        },
      },
      {
        $unwind: "$location",
      },
      {
        $project: {
          _id: 0,
          location: "$location.location",
          totalCrimes: 1,
        },
      },
      { $sort: { totalCrimes: -1 } },
    ]);

    res.json(results);
  } catch (err) {
    console.error("Hotspot error:", err);
    res.status(500).json({ error: "Failed to fetch hotspot data" });
  }
};

//crimes per location
export const getCrimesPerLocation = async (req: Request, res: Response) => {
  try {
    const result = await Crime.aggregate([
      {
        $group: {
          _id: "$crimeLocation",
          totalCrimes: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "supervisedlocations",
          localField: "_id",
          foreignField: "_id",
          as: "location",
        },
      },
      {
        $unwind: "$location",
      },
      {
        $project: {
          _id: 0,
          location: "$location.location",
          totalCrimes: 1,
        },
      },
      {
        $sort: { totalCrimes: -1 },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error("❌ Error fetching crimes per location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
