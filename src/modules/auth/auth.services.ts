import { AppError } from "../../shared/error/appError";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../shared/generateToken";
import { UserService } from "../user/user.service";
import bcrypt from "bcrypt";

export class AuthService {

    //CREDENTIALS
    static async loginUser(data: any) {
        const { email, password } = data;

        if (!email || !password) {
            throw new AppError("Please fill all the required fields", 400);
        }

        const user = await UserService.getEmail(email);
        if (!user) {
            throw new AppError("Incorrect email or password", 400);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError("Incorrect email or password", 400);
        }

        const userObj = user as any;

        const roleName = userObj.roleId?.name || "customer";

        if (!userObj.roleId?.name) {
            console.warn(`Warning: User ${user.email} logged in without a populated roleId. Falling back to 'customer'.`);
        }

        const tokenPayload = {
            id: user._id.toString(),
            email: user.email,
            role: roleName
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            role: roleName,
            accessToken
        };

        return { payload, refreshToken };
    }

    
    //REFRESH
    static async refresh(token: string) {
        const decoded = verifyRefreshToken(token);

        const user = await UserService.getUserId(decoded.id);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        const roleName = (user.roleId as any)?.name;

        const newAccessToken = generateAccessToken({
            id: user._id.toString(),
            role: roleName,
            email: user.email
        });

        const newRefreshToken = generateRefreshToken({
            id: user._id.toString(),
            role: roleName
        });
    }


    //VERIFY-EMAIL-WITH-TOKEN
    static async verifyToken(accessToken: string) {

        const decoded = await verifyAccessToken(accessToken);

        const user = await UserService.getUserId(decoded.id);

        if (!user)
            throw new AppError("User not found", 404);

        if (user.isVerified)
            return { success: true, message: "Email is already verified" }

        user.isVerified = true;
        await user.save();

        return { success: true, message: "Email verified successfully" };

    }

}