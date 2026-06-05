import { Model, PopulateOptions } from "mongoose";

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: any;
    populate?: PopulateOptions | PopulateOptions[] | string | string[];
    select?: string; // Added to handle field projections safely
}

export interface PaginationResult<T> {
    success: boolean;
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
    model: Model<any>,
    filter: Record<string, any> = {},
    options: PaginationOptions = {}
): Promise<PaginationResult<T>> {
    const currentPage = Math.max(1, Number(options.page) || 1);
    const safeLimit = Math.max(1, Number(options.limit) || 10);
    const skip = (currentPage - 1) * safeLimit;
    const sortOrder = options.sort || { createdAt: -1 };

    let query = model.find(filter).sort(sortOrder).skip(skip).limit(safeLimit);

    if (options.select) {
        query = query.select(options.select);
    }

    if (options.populate) {
        query = query.populate(options.populate as any);
    }

    const [totalItems, data] = await Promise.all([
        model.countDocuments(filter),
        query.lean().exec()
    ]);

    const totalPages = Math.ceil(totalItems / safeLimit) || 1;

    return {
        success: true,
        meta: {
            totalItems,
            currentPage,
            totalPages,
            limit: safeLimit,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1
        },
        data: data as T[]
    };
}

export async function paginateAggregation<T>(
    model: Model<any>,
    pipelineOrFilter: any[] | Record<string, any>,
    options: PaginationOptions = {}
): Promise<PaginationResult<T>> {
    const currentPage = Math.max(1, Number(options.page) || 1);
    const safeLimit = Math.max(1, Number(options.limit) || 10);
    const skip = (currentPage - 1) * safeLimit;

    let basePipeline: any[] = [];

    if (Array.isArray(pipelineOrFilter)) {
        basePipeline = [...pipelineOrFilter];
    } else {
        basePipeline = [{ $match: pipelineOrFilter }];
        
        if (options.populate) {
            const populates = Array.isArray(options.populate) ? options.populate : [options.populate];
            populates.forEach((pop: any) => {
                const targetPath = typeof pop === "string" ? pop : pop.path;
                const selectFields = typeof pop === "object" && pop.select ? pop.select : "";
                
                const fromCollection = `${targetPath}s`; 

                basePipeline.push({
                    $lookup: {
                        from: fromCollection,
                        localField: targetPath,
                        foreignField: "_id",
                        as: targetPath
                    }
                });

                if (selectFields) {
                    const projectFields: Record<string, any> = {};
                    selectFields.split(" ").forEach((f: string) => {
                        if (f.trim()) projectFields[f.trim()] = 1;
                    });
                }
                basePipeline.push({ $unwind: { path: `$${targetPath}`, preserveNullAndEmptyArrays: true } });
            });
        }

        if (options.sort) {
            basePipeline.push({ $sort: options.sort });
        }
    }

    const countPipeline = [...basePipeline, { $count: "total" }];
    const countResult = await model.aggregate(countPipeline);
    const totalItems = countResult[0]?.total || 0;

    const dataPipeline = [
        ...basePipeline,
        { $skip: skip },
        { $limit: safeLimit }
    ];
    const data = await model.aggregate(dataPipeline);
    const totalPages = Math.ceil(totalItems / safeLimit) || 1;

    return {
        success: true,
        meta: {
            totalItems,
            currentPage,
            totalPages,
            limit: safeLimit,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1
        },
        data: data as T[]
    };
}