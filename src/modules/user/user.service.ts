import { AppError } from "../../shared/error/appError";
import { generateAccessToken } from "../../shared/generateToken";
import { RoleService } from "../role/role.service";
import { IUser, User } from "./user.model";
import bcrypt from "bcrypt";

class UserPayload {
    public readonly name?: string;
    public readonly email: string;
    public readonly password: string;

    constructor(data: Partial<IUser>) {
        if (!data || !data.email || !data.password)
            throw new AppError("Please fill all the required fields", 400);

        this.name = data.name?.trim();
        this.email = data.email.toLowerCase().trim();
        this.password = data.password;
    }
}

export class UserService {

    //CREATE
    static async createUser(data: IUser) {
        const validated = new UserPayload(data);

        const checkUser = await User.findOne({ email: validated.email });
        if (checkUser)
            throw new AppError("Email already registered", 409);

        if (validated.password.length < 6)
            throw new AppError("Password must be at least six characters long", 400);

        const hashedPassword = await bcrypt.hash(validated.password, 12);

        const defaultRole = await RoleService.getRoleName("customer");

        const newUser = await User.create({ name: validated.name, email: validated.email, password: hashedPassword, roleId: defaultRole._id });

        const accessToken = await generateAccessToken({ id: newUser._id.toString(), email: newUser.email });

        const user = newUser.toObject();
        const { password, ...safeUser } = user;

        return { safeUser, accessToken };
    }


    //UPDATE
    static async updateSelf(id: string, data: IUser) {
        const input = new UserPayload(data);

        const checkUser = await User.findById(id);

        if (!checkUser)
            throw new AppError("User not found", 404);

        const updateData: Partial<IUser> = {};

        if (input.name) updateData.name = input.name.trim();

        if (input.email) {
            const duplicateCheck = await User.findOne({ email: input.email, _id: { $ne: id } });
            if (duplicateCheck)
                throw new AppError("Email is already registered", 409);

            updateData.email = input.email;
        }

        if (input.password && input.password.length >= 6) {
            const hash = await bcrypt.hash(input.password, 12);

            updateData.password = hash;
        }

        const userUpdate = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

        const user = userUpdate?.toObject();
        delete (user as any).password;

        return user;
    }

    //GET-EMAIL
    static async getEmail(email:string) {
        const user = await User.findOne({email:email.toLowerCase().trim()});
        if(!user)
            throw new AppError("Email not found", 404);

        return user;
    }


    //GET-BY-ID
    static async getUserId(id:string) {
        const user = await User.findById(id);

        if(!user)
            throw new AppError("User not found", 404);

        return user;
    }

}