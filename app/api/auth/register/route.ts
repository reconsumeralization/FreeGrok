import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { users, businessProfiles, professionalProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// Define validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  accountType: z.enum(["business", "professional"]),
})

export async function POST(req) {
  try {
    const body = await req.json()

    // Validate request body
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ message: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { name, email, password, accountType } = validationResult.data

    // Check if user already exists
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with transaction to ensure both user and profile are created
    const result = await db.transaction(async (tx) => {
      // Create user
      const [newUser] = await tx
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
          role: accountType === "business" ? "BUSINESS" : "PROFESSIONAL",
        })
        .returning({ id: users.id })

      // Create profile based on account type
      if (accountType === "business") {
        await tx.insert(businessProfiles).values({
          userId: newUser.id,
          companyName: name,
        })
      } else {
        await tx.insert(professionalProfiles).values({
          userId: newUser.id,
          fullName: name,
        })
      }

      return newUser
    })

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

