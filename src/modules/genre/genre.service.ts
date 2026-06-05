import { Types } from "mongoose";
import { AppError } from "../../shared/error/appError";
import { Genre, IGenre } from "./genre.model";
import { paginate } from "../../shared/helper/pagination";

class GenrePayload {
    public readonly name: string;
    public readonly desc?: string;

    constructor(data: Partial<IGenre>) {
        if (!data || !data.name) {
            throw new AppError("Please fill all the required fields", 400);
        }
        this.name = data.name.trim().toLowerCase();
        this.desc = data.desc?.trim();
    }
}

export class GenreService {
    // REQUEST GENRE
    static async requestGenre(data: IGenre) {
        const input = new GenrePayload(data);

        const existGenre = await Genre.findOne({ name: input.name });
        if (existGenre) {
            throw new AppError("Genre with same name already exists", 409);
        }

        const newGenre = await Genre.create({
            name: input.name,
            desc: input.desc,
            isApproved: false
        });

        return { success: true, message: "Genre request sent", newGenre };
    }

    // UPDATE GENRE
    static async updateGenre(id: string, data: Partial<IGenre>) {
        const input = new GenrePayload(data);

        const findGenre = await Genre.findById(id);
        if (!findGenre) {
            throw new AppError("Genre not found", 404);
        }

        const check = await Genre.findOne({ name: input.name, _id: { $ne: id } });
        if (check) {
            throw new AppError("Genre with same name already exists", 409);
        }

        const updateData: Partial<IGenre> = {
            name: input.name,
            desc: input.desc,
            isApproved: false // Reset approval status on modification
        };

        const update = await Genre.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return { success: true, message: "Genre updated successfully", update };
    }

    // DELETE GENRE
    static async deleteGenre(id: string) {
        const genre = await Genre.findByIdAndDelete(id);
        if (!genre) {
            throw new AppError("Genre not found", 404);
        }
        return { success: true, message: "Genre deleted successfully" };
    }

    // REFACTORED: FETCH REQUESTED GENRES (PAGINATED)
    static async fetchRequestGenre(page: number = 1, limit: number = 10) {
        const result = await paginate<IGenre>(Genre, { isApproved: false }, { page, limit });

        return {
            success: true,
            message: result.data.length ? "Genres fetched successfully" : "No genres found",
            meta: result.meta,
            genres: result.data
        };
    }

    // TOGGLE APPROVE
    static async toggleApprove(id: string) {
        const genre = await Genre.findById(id);
        if (!genre) {
            throw new AppError("Genre not found", 404);
        }

        genre.isApproved = !genre.isApproved;
        await genre.save();

        const message = genre.isApproved ? "Genre approved" : "Genre disapproval successful";
        return { success: true, message, genre };
    }

    // REFACTORED: FETCH APPROVED GENRES (PAGINATED)
    static async fetchAllGenre(page: number = 1, limit: number = 10) {
        const result = await paginate<IGenre>(Genre, { isApproved: true }, { page, limit });

        return {
            success: true,
            message: result.data.length ? "Genres fetched successfully" : "No genres found",
            meta: result.meta,
            genres: result.data
        };
    }

    // GET GENRE BY NAME
    static async getGenreName(name: string) {
        const genre = await Genre.findOne({ name: name.trim().toLowerCase() });
        if (!genre) {
            throw new AppError("Genre not found", 404);
        }
        return genre;
    }

    // VALIDATE GENRE
    static async validateGenre(ids: Types.ObjectId[]) {
        if (!ids || ids.length === 0) {
            throw new AppError("At least one genre is required", 400);
        }

        const existingGenre = await Genre.find({ _id: { $in: ids } });

        if (existingGenre.length !== ids.length) {
            throw new AppError("One or more provided genres are invalid", 400);
        }

        return existingGenre.map(genre => genre._id as Types.ObjectId);
    }
}