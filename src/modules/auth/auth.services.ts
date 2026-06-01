import { AppError } from "../../shared/error/appError";
import { generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../shared/generateToken";
import { UserService } from "../user/user.service";
import bcrypt from "bcrypt";

export class AuthService {

    //CREDENTIALS
    static async loginUser(data: any) {

        const { email, password } = data;

        if (!email || !password)
            throw new AppError("Please fill all the required fields", 400);

        const checkUser = await UserService.getEmail(email);

        if (!checkUser)
            throw new AppError("Incorrect email or password", 400);

        const isMatch = await bcrypt.compare(password, checkUser.password);

        if (!isMatch)
            throw new AppError("Incorrect email or password", 400);

        return checkUser;
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