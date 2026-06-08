import mongoose, { Types } from "mongoose";
import { Order } from "../order/order.model";
import { Book } from "../book/book.model";
import { User } from "../user/user.model";
import { Vendor } from "../vendor/vendor.model";
import { Inventory } from "../inventory/inventory.model";
import { AppError } from "../../shared/error/appError";

export class AnalyticsService {
    //Analytics for the Admin dashboard
    static async getAdminDashboard(startDate?: Date, endDate?: Date) {
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            revenueResult,
            bookSalesResult,
            totalOrders,
            totalBooks,
            totalUsers,
            totalVendors
        ] = await Promise.all([
            Order.aggregate([
                { $match: { paymentStatus: "paid", createdAt: { $gte: start, $lte: end } } },
                { $group: { _id: null, total: { $sum: "$grandTotal" } } }
            ]),
            Order.aggregate([
                { $match: { paymentStatus: "paid", createdAt: { $gte: start, $lte: end } } },
                { $unwind: "$books" },
                { $group: { _id: null, total: { $sum: "$books.subTotal" } } }
            ]),
            // Total Orders Count
            Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
            // Total Books (active/not deleted)
            Book.countDocuments({ deletedAt: null }),
            // Total Registered Users
            User.countDocuments(),
            // Total Verified Vendors
            Vendor.countDocuments({ isVerified: true })
        ]);

        const totalRevenue = revenueResult[0]?.total || 0;
        const totalBookSales = bookSalesResult[0]?.total || 0;

        const salesTrend = await Order.aggregate([
            { $match: { paymentStatus: "paid", createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$grandTotal" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { date: "$_id", revenue: 1, orderCount: 1, _id: 0 } }
        ]);

        //Top Selling Books
        const topBooks = await Order.aggregate([
            { $match: { paymentStatus: "paid", createdAt: { $gte: start, $lte: end } } },
            { $unwind: "$books" },
            {
                $group: {
                    _id: "$books.bookId",
                    quantitySold: { $sum: "$books.quantity" },
                    revenue: { $sum: "$books.subTotal" }
                }
            },
            { $sort: { quantitySold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "books",
                    localField: "_id",
                    foreignField: "_id",
                    as: "bookDetails"
                }
            },
            { $unwind: { path: "$bookDetails", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "authors",
                    localField: "bookDetails.author",
                    foreignField: "_id",
                    as: "authorDetails"
                }
            },
            { $unwind: { path: "$authorDetails", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    bookId: "$_id",
                    quantitySold: 1,
                    revenue: 1,
                    name: "$bookDetails.name",
                    coverImage: "$bookDetails.coverImage",
                    isbn: "$bookDetails.isbn",
                    authorName: "$authorDetails.name",
                    _id: 0
                }
            }
        ]);

        //Top Selling Categories
        const topCategories = await Order.aggregate([
            { $match: { paymentStatus: "paid", createdAt: { $gte: start, $lte: end } } },
            { $unwind: "$books" },
            {
                $lookup: {
                    from: "books",
                    localField: "books.bookId",
                    foreignField: "_id",
                    as: "bookDetails"
                }
            },
            { $unwind: { path: "$bookDetails", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$bookDetails.category",
                    quantitySold: { $sum: "$books.quantity" },
                    revenue: { $sum: "$books.subTotal" }
                }
            },
            { $sort: { quantitySold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    categoryId: "$_id",
                    quantitySold: 1,
                    revenue: 1,
                    name: "$categoryDetails.name",
                    _id: 0
                }
            }
        ]);

        //Top Vendors
        const topVendors = await Order.aggregate([
            { $match: { paymentStatus: "paid", createdAt: { $gte: start, $lte: end } } },
            { $unwind: "$books" },
            {
                $group: {
                    _id: "$books.vendorId",
                    quantitySold: { $sum: "$books.quantity" },
                    revenue: { $sum: "$books.subTotal" }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "vendors",
                    localField: "_id",
                    foreignField: "_id",
                    as: "vendorDetails"
                }
            },
            { $unwind: { path: "$vendorDetails", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    vendorId: "$_id",
                    quantitySold: 1,
                    revenue: 1,
                    vendorName: "$vendorDetails.vendorName",
                    _id: 0
                }
            }
        ]);

        //Order Status Distribution
        const orderStatusCounts = await Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        return {
            success: true,
            message: "Admin analytics overview loaded successfully.",
            data: {
                overview: {
                    totalRevenue: Number(totalRevenue.toFixed(2)),
                    totalBookSales: Number(totalBookSales.toFixed(2)),
                    totalOrders,
                    totalBooks,
                    totalUsers,
                    totalVendors
                },
                salesTrend,
                topBooks,
                topCategories,
                topVendors,
                orderStatuses: orderStatusCounts
            }
        };
    }

    //Analytics for the Vendor dashboard
    static async getVendorDashboard(userId: string, startDate?: Date, endDate?: Date) {
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new AppError("Access denied. No vendor profile found for this account.", 403);
        }
        const vendorId = vendor._id;

        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            vendorRevenueResult,
            totalOrders,
            totalBooksInInventory,
            lowStockCount
        ] = await Promise.all([
            // Revenue for vendor items in paid orders
            Order.aggregate([
                { $match: { paymentStatus: "paid", createdAt: { $gte: start, $lte: end }, "books.vendorId": vendorId } },
                { $unwind: "$books" },
                { $match: { "books.vendorId": vendorId } },
                { $group: { _id: null, total: { $sum: "$books.subTotal" } } }
            ]),
            // Total Orders containing vendor items
            Order.countDocuments({
                createdAt: { $gte: start, $lte: end },
                "books.vendorId": vendorId
            }),
            // Total books listed by vendor in inventory
            Inventory.countDocuments({ vendorId }),
            // Count of low stock active items
            Inventory.countDocuments({
                vendorId,
                isActive: true,
                $expr: { $lte: ["$stock", "$stockReminder"] }
            })
        ]);

        const totalRevenue = vendorRevenueResult[0]?.total || 0;

        const salesTrend = await Order.aggregate([
            { $match: { paymentStatus: "paid", createdAt: { $gte: start, $lte: end }, "books.vendorId": vendorId } },
            { $unwind: "$books" },
            { $match: { "books.vendorId": vendorId } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$books.subTotal" },
                    quantitySold: { $sum: "$books.quantity" }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { date: "$_id", revenue: 1, quantitySold: 1, _id: 0 } }
        ]);

        const topBooks = await Order.aggregate([
            { $match: { paymentStatus: "paid", createdAt: { $gte: start, $lte: end }, "books.vendorId": vendorId } },
            { $unwind: "$books" },
            { $match: { "books.vendorId": vendorId } },
            {
                $group: {
                    _id: "$books.bookId",
                    quantitySold: { $sum: "$books.quantity" },
                    revenue: { $sum: "$books.subTotal" }
                }
            },
            { $sort: { quantitySold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "books",
                    localField: "_id",
                    foreignField: "_id",
                    as: "bookDetails"
                }
            },
            { $unwind: { path: "$bookDetails", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    bookId: "$_id",
                    quantitySold: 1,
                    revenue: 1,
                    name: "$bookDetails.name",
                    coverImage: "$bookDetails.coverImage",
                    isbn: "$bookDetails.isbn",
                    _id: 0
                }
            }
        ]);

        const [stockValueResult, activeCount, inactiveCount, lowStockItems] = await Promise.all([
            // Calculate total stock count and total financial value
            Inventory.aggregate([
                { $match: { vendorId, isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
                        totalStock: { $sum: "$stock" }
                    }
                }
            ]),
            // Total active items
            Inventory.countDocuments({ vendorId, isActive: true }),
            // Total inactive items
            Inventory.countDocuments({ vendorId, isActive: false }),
            // Get sample list of low-stock items
            Inventory.find({
                vendorId,
                isActive: true,
                $expr: { $lte: ["$stock", "$stockReminder"] }
            })
            .populate("bookId", "name isbn coverImage")
            .limit(5)
        ]);

        const totalStockValue = stockValueResult[0]?.totalValue || 0;
        const totalStockCount = stockValueResult[0]?.totalStock || 0;

        //Order Status Distribution (For vendor items)
        const orderStatusCounts = await Order.aggregate([
            { $match: { "books.vendorId": vendorId, createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        return {
            success: true,
            message: "Vendor analytics overview loaded successfully.",
            data: {
                overview: {
                    totalRevenue: Number(totalRevenue.toFixed(2)),
                    totalOrders,
                    totalBooksInInventory,
                    lowStockAlertCount: lowStockCount
                },
                salesTrend,
                topBooks,
                inventoryHealth: {
                    activeCount,
                    inactiveCount,
                    totalStockCount,
                    totalStockValue: Number(totalStockValue.toFixed(2)),
                    lowStockItems: lowStockItems.map((item: any) => ({
                        inventoryId: item._id,
                        bookId: item.bookId?._id,
                        name: item.bookId?.name,
                        isbn: item.bookId?.isbn,
                        coverImage: item.bookId?.coverImage,
                        price: item.price,
                        stock: item.stock,
                        stockReminder: item.stockReminder
                    }))
                },
                orderStatuses: orderStatusCounts
            }
        };
    }
}