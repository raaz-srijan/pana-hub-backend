import mongoose from "mongoose";
import { Permission } from "../modules/permission/permission.model.js";
import { Role } from "../modules/role/role.model.js";
import { ENV } from "../infrastructure/env.js";

// Connect to DB directly for the seeder
const connectDB = async () => {
    try {
        await mongoose.connect(ENV.MONGO_URI);
        console.log("MongoDB Connected for Seeding...");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

const permissionsData = [
    // Users
    { name: "read_users", group: "users" },
    { name: "write_users", group: "users" },
    { name: "delete_users", group: "users" },
    
    // Roles
    { name: "read_roles", group: "roles" },
    { name: "write_roles", group: "roles" },
    { name: "delete_roles", group: "roles" },
    
    // Permissions
    { name: "read_permissions", group: "permissions" },
    { name: "write_permissions", group: "permissions" },
    { name: "delete_permissions", group: "permissions" },
    
    // Books
    { name: "read_books", group: "books" },
    { name: "write_books", group: "books" },
    { name: "delete_books", group: "books" },
    { name: "verify_books", group: "books" },
    
    // Authors
    { name: "read_authors", group: "authors" },
    { name: "write_authors", group: "authors" },
    { name: "delete_authors", group: "authors" },
    
    // Categories
    { name: "read_categories", group: "categories" },
    { name: "write_categories", group: "categories" },
    { name: "delete_categories", group: "categories" },
    
    // Genres
    { name: "read_genres", group: "genres" },
    { name: "write_genres", group: "genres" },
    { name: "delete_genres", group: "genres" },

    // Inventory
    { name: "read_inventory", group: "inventory" },
    { name: "write_inventory", group: "inventory" },
    { name: "delete_inventory", group: "inventory" },

    // Vendors
    { name: "read_vendors", group: "vendors" },
    { name: "write_vendors", group: "vendors" },
    { name: "approve_vendors", group: "vendors" },
];

const seedData = async () => {
    await connectDB();

    try {
        console.log("Clearing existing roles and permissions...");
        await Role.deleteMany({});
        await Permission.deleteMany({});

        console.log("Inserting permissions...");
        const insertedPermissions = await Permission.insertMany(permissionsData);

        const getPermissionIds = (names: string[]) => {
            return insertedPermissions
                .filter(p => names.includes(p.name))
                .map(p => p._id);
        };

        const allPermissionIds = insertedPermissions.map(p => p._id);

        const vendorPermissionNames = [
            "read_books", "write_books", "delete_books",
            "read_authors", "write_authors", 
            "read_categories", "read_genres",
            "read_inventory", "write_inventory", "delete_inventory"
        ];

        const customerPermissionNames = [
            "read_books", "read_authors", "read_categories", "read_genres"
        ];

        console.log("Inserting roles...");
        await Role.create([
            {
                name: "admin",
                permissions: allPermissionIds
            },
            {
                name: "vendor",
                permissions: getPermissionIds(vendorPermissionNames)
            },
            {
                name: "customer",
                permissions: getPermissionIds(customerPermissionNames)
            }
        ]);

        console.log("Seeding base roles and permissions completed.");
        
        console.log("Database seeded successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
};

seedData();