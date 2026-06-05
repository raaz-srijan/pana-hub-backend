import { Model, QueryFilter, } from "mongoose";

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: string | Record<string, any>;
    populate?: any;
}

export interface PaginationResult<T> {
    success: boolean;
    message: string;
    meta: {
        totalItems: number;
        currentPage: number;
        totalPages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    data: T[];
}

export async function paginate<T>(
    model: Model<T>,
    filter: QueryFilter<T> = {},
    options: PaginationOptions = {}
): Promise<PaginationResult<T>> {
    const currentPage = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Number(options.limit) || 10);
    const skip = (currentPage - 1) * limit;

    const sort = options.sort || { createdAt: -1 };

    let query = model.find(filter).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
        query = query.populate(options.populate);
    }

    const [totalItems, data] = await Promise.all([
        model.countDocuments(filter),
        query.exec()
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
        success: true,
        message: data.length ? "Data fetched successfully" : "No documents available matching criteria",
        meta: {
            totalItems,
            currentPage,
            totalPages,
            limit,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
        },
        data
    };
}