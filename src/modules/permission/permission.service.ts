import { validateHeaderName } from "http";
import { AppError } from "../../shared/appError";
import { IPermission, Permission,  } from "./permission.model";

class PermissionPayload {
    public readonly name: string;
    public readonly group: string;

    constructor(data:Partial<IPermission>) {
        if(!data || !data.name || !data.group)
            throw new AppError("Please fill all the required fields", 400);

        this.name = data.name.toLowerCase().trim();
        this.group = data.group.toLowerCase().trim();
        } 
}

export class PermissionService{
    //CREATE
    static async createPerm(data: IPermission) {

        const validated = new PermissionPayload(data);

        const checkPerm = await Permission.findOne({name:validated.name});

        if(checkPerm)
            throw new AppError("Permission with same name already exists", 409);

        return await Permission.create({name:validated.name, group:validated.group});
    }

    //UPDATE
    static async updatePerm(id:string, data:IPermission) {

        const validated = new PermissionPayload(data);

        const permission = await Permission.findById(id);

        if(!permission)
            throw new AppError("Permission not found", 404);

        const duplicateCheck = await Permission.findOne({name:validateHeaderName.name, _id:{$ne: id}});

        if(duplicateCheck)
            throw new AppError("Another permission with this name already exists", 409);


        permission.name = validated.name;
        permission.group = validated.group;

        await permission.save();
        return permission;
    }


    //DELETE
    static async deletePerm(id:string) {
        const permission = await Permission.findByIdAndDelete(id);

        if(!permission)
            throw new AppError("Permission not found", 404);

        return {success:true};
    }


    //FETCH-ALL
    static async fetchAllPermisisons(){
        const permissions = await Permission.find();

        if(!permissions || permissions.length < 0)
            throw new AppError("No permission available", 404);

        return permissions;
    }
}
