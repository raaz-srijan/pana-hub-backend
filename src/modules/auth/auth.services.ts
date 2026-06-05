import { AppError } from "../../shared/error/appError";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../shared/generateToken";
import { UserService } from "../user/user.service";
import bcrypt from "bcrypt";

export class AuthService {

    //CREDENTIALS
    static async loginUser(data: any) {

        const { email, password } = data;

        if (!email || !password)
            throw new AppError("Please fill all the required fields", 400);

        const user = await UserService.getEmail(email);

        if (!user)
            throw new AppError("Incorrect email or password", 400);

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch)
            throw new AppError("Incorrect email or password", 400);

        const accessToken = generateAccessToken({id:user._id.toString(), email:user.email});
        const refreshToken = generateRefreshToken({id:user._id.toString(), email:user.email});

        const userRole = user as any;
        
        const payload = {id:user._id, name:user.name, email:user.email, isVerified:user.isVerified, role:userRole.roleId.name, accessToken}
        return {payload, refreshToken};
    }


    //REFRESH
    static async refresh(token: string) {

        const decoded = await verifyRefreshToken(token);

        const user = await UserService.getUserId(decoded.id);

        if (!user)
            throw new AppError("User not found", 404);

        const newRefreshToken = generateRefreshToken({ id: user._id.toString(), role: user.roleId?.toString() });

        return newRefreshToken;
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