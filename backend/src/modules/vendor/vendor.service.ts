import { AppError } from "../../shared/error/appError";
import { IVendor, Vendor } from "./vendor.model";


// Payload validation structure for creating a new vendor profile
class CreateVendorPayload {
    public readonly vendorName: string;
    public readonly licenseNo: string;
    public readonly address: { state: string; city: string; tole: string };

    constructor(data: Partial<IVendor>) {
        if (!data || !data.vendorName || !data.licenseNo || !data.address || !data.address.state || !data.address.city || !data.address.tole) {
            throw new AppError("Please fill all the required fields", 400);
        }
        this.vendorName = data.vendorName.trim();
        this.licenseNo = data.licenseNo.trim();
        this.address = {
            state: data.address.state.trim(),
            city: data.address.city.trim(),
            tole: data.address.tole.trim(),
        };
    }
}

// Payload validation structure for updating an existing profile
class UpdateVendorPayload {
    public readonly vendorName?: string;
    public readonly licenseNo?: string;
    public readonly address?: { state?: string; city?: string; tole?: string };

    constructor(data: Partial<IVendor>) {
        if (data.vendorName) this.vendorName = data.vendorName.trim();
        if (data.licenseNo) this.licenseNo = data.licenseNo.trim();
        if (data.address) {
            this.address = {};
            if (data.address.state) this.address.state = data.address.state.trim();
            if (data.address.city) this.address.city = data.address.city.trim();
            if (data.address.tole) this.address.tole = data.address.tole.trim();
        }
    }
}

export class VendorService {

    //FIRST TIME CREATION 
    static async requestVendor(userId: string, data: Partial<IVendor>) {
        const input = new CreateVendorPayload(data);

        const existingUserVendor = await Vendor.findOne({ userId });
        if (existingUserVendor) {
            throw new AppError("You have already registered or requested a vendor profile", 400);
        }

        const checkLicense = await Vendor.findOne({ licenseNo: input.licenseNo });
        if (checkLicense) {
            throw new AppError("Vendor with same license number already registered", 409);
        }

        const newVendor = await Vendor.create({
            userId,
            vendorName: input.vendorName,
            licenseNo: input.licenseNo,
            address: input.address,
            isVerified: false,
            isPending: true
        });

        return { success: true, message: "Request sent successfully", newVendor };
    }


    //UPDATE SELF VENDOR DETAILS
    static async updateVendor(userId: string, data: Partial<IVendor>) {
        const input = new UpdateVendorPayload(data);

        const vendor = await Vendor.findOne({ userId });
        if (!vendor) throw new AppError("Invalid vendor setup", 404);

        if (!vendor.isVerified && vendor.isPending) {
            throw new AppError("Access denied. Your previous request is still pending approval.", 403);
        }

        const updateData: Record<string, any> = { isPending: true };

        if (input.vendorName) updateData.vendorName = input.vendorName;

        if (input.licenseNo) {
            const duplicate = await Vendor.findOne({ licenseNo: input.licenseNo, _id: { $ne: vendor._id } });
            if (duplicate) throw new AppError("License number already registered", 409);
            updateData.licenseNo = input.licenseNo;
        }

        if (input.address?.state) updateData["address.state"] = input.address.state;
        if (input.address?.city) updateData["address.city"] = input.address.city;
        if (input.address?.tole) updateData["address.tole"] = input.address.tole;

        const update = await Vendor.findByIdAndUpdate(vendor._id, { $set: updateData }, { new: true, runValidators: true });

        return { success: true, message: "Vendor updated successfully", update };
    }


    // FETCH VENDOR REQUESTS
    static async fetchVendorRequests(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const vendors = await Vendor.find({ isVerified: false, isPending: true })
            .populate("userId", "name email")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return { success: true, message: vendors.length ? "Vendors fetched successfully" : "No pending requests found", vendors };
    }


    //FETCH VENDOR BY ID
    static async fetchVendorByID(id: string) {
        const vendor = await Vendor.findById(id).populate("userId", "name email");
        if (!vendor) throw new AppError("Vendor not found", 404);

        return vendor;
    }


    //TOGGLE VENDOR VERIFICATION
    static async toggleVerification(id: string) {
        const vendor = await Vendor.findById(id);
        if (!vendor) throw new AppError("Vendor not found", 404);

        vendor.isVerified = !vendor.isVerified;
        vendor.isPending = false;

        await vendor.save();

        return { success: true, message: vendor.isVerified ? "Vendor verified successfully" : "Vendor verification revoked", vendor };
    }


    //FETCH VERIFIED VENDORS
    static async fetchVerifiedVendors() {
        const vendors = await Vendor.find({ isVerified: true }).select("-userId -licenseNo");
        return { success: true, message: vendors.length ? "Vendors fetched successfully" : "No verified vendors found", vendors };
    }


    //FETCH SELF PROFILE
    static async getMyVendorProfile(userId: string) {
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) throw new AppError("You do not have a vendor profile yet", 404);

        return { success: true, vendor };
    }


    //DELETE VENDOR
    static async deleteVendor(id: string) {
        const vendor = await Vendor.findByIdAndDelete(id);
        if (!vendor) throw new AppError("Vendor not found", 404);

        return { success: true, message: "Vendor profile deleted successfully" };
    }


    //VENDOR BY USER ID
    static async findByUserId(userId: string) {
        const vendor = await Vendor.findOne({ userId });
        if (!vendor) {
            throw new AppError("Access denied. No vendor profile found for this account.", 403);
        }
        return vendor;
    }

    //FETCH EVERY VENDORS
    static async fetchAllVendors() {
        const vendors = await Vendor.find();
        if (vendors.length === 0) {
            throw new AppError("Vendors not found", 404);
        }

        return vendors;
    }
}