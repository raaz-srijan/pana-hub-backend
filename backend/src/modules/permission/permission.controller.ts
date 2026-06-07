import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { PermissionService } from "./permission.service";
import { AppError } from "../../shared/error/appError";

export class PermissionController{

    //ADD
    static addPerm = catchAsync(async(req:Request, res:Response)=> {

        const newPermission = await PermissionService.createPerm(req.body);

        res.status(201).json({success:"true", message:"Permission created successfully", data: {permission:newPermission}});
    });


    //UPDATE
    static updatePerm =catchAsync(async(req:Request, res:Response) => {
        const {id} = req.params;

        if(!id)
            throw new AppError("Invalid id", 404);

        const update = await PermissionService.updatePerm(id.toString(), req.body);

        return res.status(200).json({success:true, message:"Permission updated successfully", data:update});
    });


    //DELETE
    static deletePerm = catchAsync(async(req:Request, res:Response) => {
        const {id} = req.params;

        if(!id)
            throw new AppError("Invalid id", 404);

        const permission = await PermissionService.deletePerm(id.toString());

        return res.status(200).json({success:true, message:"Permission deleted successfully"});
    });

    
    //GET-ALL
    static getAllPermissions = catchAsync(async(req:Request, res:Response) => {

        const permissions = await PermissionService.fetchAllPerm();
        return res.status(200).json({success:true, message:"Permissions fetched successfully", data:permissions});
    });


    //GET-ID
    static getPermissionById = catchAsync(async(req:Request, res:Response) => {
        const {id} = req.params;

        if(!id)
            throw new AppError("Invalid id", 404);

        const permission = await PermissionService.fetchPermById(id.toString());

        return res.status(200).json({success:true, message:"Permission fetched successfully", data:permission});
    })

}