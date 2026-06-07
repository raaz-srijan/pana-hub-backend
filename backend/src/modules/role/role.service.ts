import { AppError } from "../../shared/error/appError";
import { PermissionService } from "../permission/permission.service";
import { IRole, Role } from "./role.model";

class RolePayload {
    public readonly name: string;
    public readonly permissions: string[];

    constructor(data:Partial<IRole>) {
        if(!data || !data.name || !Array.isArray(data.permissions)) 
            throw new AppError("Please fill all the required fields", 400);
            
        this.name = data.name?.toLowerCase().trim();
        this.permissions = data.permissions.map(id => id.toString());

    }
}

export class RoleService{

    //CREATE
    static async createRole(data:IRole) {
        const validated = new RolePayload(data);

        const checkRole = await Role.findOne({name:validated.name});

        if(checkRole)
            throw new AppError("Role with same name already exists", 409);

        const permissions = await PermissionService.validatePermissionsIds(validated.permissions);

        const role = await Role.create({name:validated.name, permissions: permissions.map(p => p._id)});

        return role;
    }

    //UPDATE
    static async updateRole(id:string, data:IRole) {
        const validated = new RolePayload(data);

        const checkRole = await Role.findById(id);

        if(!checkRole)
            throw new AppError("Role not found", 404);

        const updateData : any = {};

        if(validated.name) {
            const duplicateCheck = await Role.findOne({name:validated.name, _id:{$ne: id}});
            if(duplicateCheck)
                throw new AppError("Role with same name already exists", 409);

            updateData.name = validated.name;
        }

        if(validated.permissions !== undefined) {
            const permissions = await PermissionService.validatePermissionsIds(validated.permissions);

            updateData.permissions = permissions.map(p=> p._id);
        }

        const update = await Role.findByIdAndUpdate(id, {$set:updateData}, {new:true, runValidators:true});
        return update;
    }


    //DELETE
    static async deleteRole(id:string) {
        const role = await Role.findByIdAndDelete(id);
        if(!role)
            throw new AppError("Role not found", 404);

        return role.name as string;
    }


    //FETCH-ALL-ROLES
    static async getAllRoles() {
        const roles = await Role.find();

        if(!roles || roles.length < 0)
            throw new AppError("No roles available", 404);

        return roles;
    }

    //FETCH-ROLE-ID
    static async getRoleById(id:string) {
        const role = await Role.findById(id)

        if(!role)
            throw new AppError("Role not found", 404);

        return role;
    }


    //GET-ROLE-NAME
    static async getRoleName(name:string) {
        const role = await Role.findOne({name:name});

        if(!role)
            throw new AppError("Role not found", 404);

        return role;
    }
}