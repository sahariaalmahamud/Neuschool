import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.js";

const SALT_ROUNDS = 10;

async function main() {
    // =========================
    // Categories
    // =========================

    const programmingCategory = await prisma.category.upsert({
        where: {
            slug: "programming",
        },
        update: {
            name: "Programming",
            description: "Programming and software development courses",
        },
        create: {
            name: "Programming",
            slug: "programming",
            description: "Programming and software development courses",
        },
    });

    const designCategory = await prisma.category.upsert({
        where: {
            slug: "design",
        },
        update: {
            name: "Design",
            description: "Design and creative courses",
        },
        create: {
            name: "Design",
            slug: "design",
            description: "Design and creative courses",
        },
    });

    console.log("Categories created:");
    console.log({
        programming: programmingCategory.id,
        design: designCategory.id,
    });

    // =========================
    // Users
    // =========================

    const passwordHash = await bcrypt.hash("password123", SALT_ROUNDS);

    const instructorA = await prisma.user.upsert({
        where: {
            email: "instructora@test.com",
        },
        update: {
            name: "Instructor A",
            passwordHash,
            role: "INSTRUCTOR",
        },
        create: {
            name: "Instructor A",
            email: "instructora@test.com",
            passwordHash,
            role: "INSTRUCTOR",
        },
    });

    const instructorB = await prisma.user.upsert({
        where: {
            email: "instructorb@test.com",
        },
        update: {
            name: "Instructor B",
            passwordHash,
            role: "INSTRUCTOR",
        },
        create: {
            name: "Instructor B",
            email: "instructorb@test.com",
            passwordHash,
            role: "INSTRUCTOR",
        },
    });

    const admin = await prisma.user.upsert({
        where: {
            email: "admin@test.com",
        },
        update: {
            name: "Admin",
            passwordHash,
            role: "ADMIN",
        },
        create: {
            name: "Admin",
            email: "admin@test.com",
            passwordHash,
            role: "ADMIN",
        },
    });

    console.log("Test users created:");
    console.log({
        instructorA: instructorA.email,
        instructorB: instructorB.email,
        admin: admin.email,
    });
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });