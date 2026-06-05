import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Permission } from "../modules/permission/permission.model.js";
import { Role } from "../modules/role/role.model.js";
import { User } from "../modules/user/user.model.js";
import { Vendor } from "../modules/vendor/vendor.model.js";
import { Category } from "../modules/category/category.model.js";
import { Genre } from "../modules/genre/genre.model.js";
import { Author } from "../modules/author/author.model.js";
import { Book } from "../modules/book/book.model.js";
import { Inventory } from "../modules/inventory/inventory.model.js";
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

const categoriesData = [
    { name: "fiction", desc: "Fiction books, stories, novels, and creative writing.", isApproved: true },
    { name: "non-fiction", desc: "Fact-based books about real-life events, research, and analysis.", isApproved: true },
    { name: "science", desc: "Scientific literature, research, textbooks, and popular science.", isApproved: true },
    { name: "biography", desc: "Biographies, autobiographies, and memoirs of notable figures.", isApproved: true },
    { name: "technology", desc: "Books on computer science, engineering, programming, and innovation.", isApproved: true },
];

const genresData = [
    { name: "fantasy", desc: "Magical worlds, mythical creatures, and epic adventures.", isApproved: true },
    { name: "sci-fi", desc: "Speculative technology, space exploration, and futuristic concepts.", isApproved: true },
    { name: "mystery", desc: "Puzzles, detective stories, crimes, and suspenseful investigations.", isApproved: true },
    { name: "romance", desc: "Love stories, emotional journeys, and relationships.", isApproved: true },
    { name: "history", desc: "Historical research, timelines, and past civilizations.", isApproved: true },
    { name: "business", desc: "Finance, management, personal growth, and entrepreneurship.", isApproved: true },
];

const authorsData = [
    { name: "J. K. Rowling", bio: "British author best known for the Harry Potter fantasy series.", isVerified: true },
    { name: "George R. R. Martin", bio: "American novelist and short story writer best known for A Song of Ice and Fire.", isVerified: true },
    { name: "J. R. R. Tolkien", bio: "English academic, philologist, and author of The Hobbit and The Lord of the Rings.", isVerified: true },
    { name: "Stephen King", bio: "Prolific American author of horror, suspense, science fiction, and fantasy.", isVerified: true },
    { name: "James Clear", bio: "Author and habits researcher, best known for his bestseller Atomic Habits.", isVerified: true },
];

const booksRaw = [
    { name: "Harry Potter and the Sorcerer's Stone", isbn: "978-0747532699", categoryName: "fiction", genreNames: ["fantasy"], authorName: "J. K. Rowling", publisher: "Bloomsbury", publishedDate: new Date("1997-06-26") },
    { name: "Harry Potter and the Chamber of Secrets", isbn: "978-0747538493", categoryName: "fiction", genreNames: ["fantasy"], authorName: "J. K. Rowling", publisher: "Bloomsbury", publishedDate: new Date("1998-07-02") },
    { name: "A Game of Thrones", isbn: "978-0553103540", categoryName: "fiction", genreNames: ["fantasy"], authorName: "George R. R. Martin", publisher: "Bantam Spectra", publishedDate: new Date("1996-08-01") },
    { name: "A Clash of Kings", isbn: "978-0553108033", categoryName: "fiction", genreNames: ["fantasy"], authorName: "George R. R. Martin", publisher: "Bantam Spectra", publishedDate: new Date("1999-02-01") },
    { name: "The Hobbit", isbn: "978-0261102217", categoryName: "fiction", genreNames: ["fantasy"], authorName: "J. R. R. Tolkien", publisher: "George Allen & Unwin", publishedDate: new Date("1937-09-21") },
    { name: "The Lord of the Rings", isbn: "978-0618640157", categoryName: "fiction", genreNames: ["fantasy"], authorName: "J. R. R. Tolkien", publisher: "George Allen & Unwin", publishedDate: new Date("1954-07-29") },
    { name: "The Shining", isbn: "978-0385121675", categoryName: "fiction", genreNames: ["mystery"], authorName: "Stephen King", publisher: "Doubleday", publishedDate: new Date("1977-01-28") },
    { name: "It", isbn: "978-0670813025", categoryName: "fiction", genreNames: ["mystery"], authorName: "Stephen King", publisher: "Viking", publishedDate: new Date("1986-09-15") },
    { name: "Atomic Habits", isbn: "978-0735211292", categoryName: "non-fiction", genreNames: ["business"], authorName: "James Clear", publisher: "Avery", publishedDate: new Date("2018-10-16") },
    { name: "A Brief History of Time", isbn: "978-0553380163", categoryName: "science", genreNames: ["history"], authorName: "Stephen King", publisher: "Bantam Books", publishedDate: new Date("1988-04-01") },
    { name: "The Silmarillion", isbn: "978-0261102736", categoryName: "fiction", genreNames: ["fantasy"], authorName: "J. R. R. Tolkien", publisher: "George Allen & Unwin", publishedDate: new Date("1977-09-15") },
    { name: "Misery", isbn: "978-0670813643", categoryName: "fiction", genreNames: ["mystery"], authorName: "Stephen King", publisher: "Viking", publishedDate: new Date("1987-06-08") },
    { name: "Pet Sematary", isbn: "978-0385182447", categoryName: "fiction", genreNames: ["mystery"], authorName: "Stephen King", publisher: "Doubleday", publishedDate: new Date("1983-11-14") },
    { name: "The Stand", isbn: "978-0385121682", categoryName: "fiction", genreNames: ["fantasy", "mystery"], authorName: "Stephen King", publisher: "Doubleday", publishedDate: new Date("1978-10-03") },
    { name: "A Storm of Swords", isbn: "978-0553106633", categoryName: "fiction", genreNames: ["fantasy"], authorName: "George R. R. Martin", publisher: "Bantam Spectra", publishedDate: new Date("2000-08-08") },
];

const vendorStoreNames = [
    "Alpha Book House", "Pioneer Reads", "Beacon Bookstore", "Apex Book Center",
    "Metropolitan Books", "Horizon Library", "Valley Bookstore", "Sagarmatha Books",
    "Summit Book Shop", "Pathfinder Books", "Lakeside Reads", "Town Square Books",
    "Himalayan Bookstore", "Hillside Books", "Crossroad Books", "Sterling Library",
    "Heritage Books", "Novel Destination", "Page-Turner Shop", "Zenith Books"
];

const seedData = async () => {
    await connectDB();

    try {
        console.log("Clearing all existing database collections...");
        await Promise.all([
            User.deleteMany({}),
            Vendor.deleteMany({}),
            Category.deleteMany({}),
            Genre.deleteMany({}),
            Author.deleteMany({}),
            Book.deleteMany({}),
            Inventory.deleteMany({}),
            Role.deleteMany({}),
            Permission.deleteMany({})
        ]);
        console.log("All collections cleared successfully.");

        // 1. Seed Permissions
        console.log("Inserting permissions...");
        const insertedPermissions = await Permission.insertMany(permissionsData);
        console.log(`Inserted ${insertedPermissions.length} permissions.`);

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

        // 2. Seed Roles
        console.log("Inserting roles...");
        const roles = await Role.create([
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
        console.log("Roles inserted successfully.");

        const adminRole = roles.find(r => r.name === "admin")!;
        const vendorRole = roles.find(r => r.name === "vendor")!;
        const customerRole = roles.find(r => r.name === "customer")!;

        // 3. Hash Passwords
        console.log("Hashing password for users...");
        const hashedPassword = await bcrypt.hash("password123", 12);

        // 4. Seed Users
        console.log("Inserting users (Admin, 20 Vendors, 10 Customers)...");
        
        // Admin
        const adminUser = await User.create({
            name: "System Admin",
            email: "admin@panahub.com",
            password: hashedPassword,
            isVerified: true,
            roleId: adminRole._id,
            provider: "local"
        });

        // 20 Vendors
        const vendorUsers = [];
        for (let i = 1; i <= 20; i++) {
            const user = await User.create({
                name: `Vendor User ${i}`,
                email: `vendor${i}@panahub.com`,
                password: hashedPassword,
                isVerified: true,
                roleId: vendorRole._id,
                provider: "local"
            });
            vendorUsers.push(user);
        }

        // 10 Customers
        const customerUsers = [];
        for (let i = 1; i <= 10; i++) {
            const user = await User.create({
                name: `Customer User ${i}`,
                email: `customer${i}@panahub.com`,
                password: hashedPassword,
                isVerified: true,
                roleId: customerRole._id,
                provider: "local"
            });
            customerUsers.push(user);
        }
        console.log("Users inserted successfully.");

        // 5. Seed Vendor Profiles
        console.log("Inserting vendor profiles...");
        const vendors = [];
        for (let i = 0; i < 20; i++) {
            const vendor = await Vendor.create({
                userId: vendorUsers[i]._id,
                vendorName: vendorStoreNames[i],
                licenseNo: `LIC-9000${i + 10}`,
                address: {
                    state: "Bagmati",
                    city: i % 2 === 0 ? "Kathmandu" : "Lalitpur",
                    tole: `Tole-${i + 1}`
                },
                isVerified: true,
                isPending: false
            });
            vendors.push(vendor);
        }
        console.log(`Inserted ${vendors.length} vendor profiles.`);

        // 6. Seed Categories
        console.log("Inserting categories...");
        const insertedCategories = await Category.insertMany(categoriesData);
        console.log(`Inserted ${insertedCategories.length} categories.`);

        // 7. Seed Genres
        console.log("Inserting genres...");
        const insertedGenres = await Genre.insertMany(genresData);
        console.log(`Inserted ${insertedGenres.length} genres.`);

        // 8. Seed Authors
        console.log("Inserting authors...");
        const insertedAuthors = await Author.insertMany(authorsData);
        console.log(`Inserted ${insertedAuthors.length} authors.`);

        // 9. Seed Books (Max 15)
        console.log("Inserting books (15)...");
        const books = [];
        for (const raw of booksRaw) {
            const categoryObj = insertedCategories.find(c => c.name === raw.categoryName.toLowerCase())!;
            const authorObj = insertedAuthors.find(a => a.name.toLowerCase() === raw.authorName.toLowerCase())!;
            const genreIds = raw.genreNames.map(gName => {
                return insertedGenres.find(g => g.name === gName.toLowerCase())!._id;
            });

            const book = await Book.create({
                name: raw.name,
                isbn: raw.isbn,
                category: categoryObj._id,
                genre: genreIds,
                author: authorObj._id,
                coverImage: {
                    imageUrl: `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400`,
                    publicId: `placeholder_book_${raw.isbn}`
                },
                publisher: raw.publisher,
                publishedDate: raw.publishedDate,
                isVerified: true,
                deletedAt: null
            });
            books.push(book);
        }
        console.log(`Inserted ${books.length} books.`);

        // 10. Seed Inventories
        console.log("Inserting inventories for vendors...");
        let inventoryCount = 0;
        
        // Let's seed inventories: each of the 20 vendors will have a random subset of the 15 books (between 5 and 10 books each)
        for (const vendor of vendors) {
            // Shuffle books array to select a random subset
            const shuffledBooks = [...books].sort(() => 0.5 - Math.random());
            const numBooksToAssign = Math.floor(Math.random() * 6) + 5; // 5 to 10 books
            const selectedBooks = shuffledBooks.slice(0, numBooksToAssign);

            for (const book of selectedBooks) {
                // Generate random price and stock
                const prices = [299, 399, 499, 599, 699, 799, 999, 1200];
                const price = prices[Math.floor(Math.random() * prices.length)];
                const stock = Math.floor(Math.random() * 81) + 10; // 10 to 90

                await Inventory.create({
                    vendorId: vendor._id,
                    bookId: book._id,
                    price: price,
                    stock: stock,
                    isActive: true,
                    stockReminder: 5
                });
                inventoryCount++;
            }
        }
        console.log(`Successfully created ${inventoryCount} inventory records across all 20 vendors.`);
        console.log("Database seeded successfully with all sample data!");
        process.exit(0);

    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
};

seedData();
