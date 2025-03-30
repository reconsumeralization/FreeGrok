import { db } from "../lib/db"
import { users, businessProfiles, professionalProfiles } from "../db/schema"
import { hash } from "bcrypt"

async function main() {
  try {
    // Create admin user
    const adminPassword = await hash("admin123", 10)
    const [admin] = await db
      .insert(users)
      .values({
        name: "Admin User",
        email: "admin@example.com",
        password: adminPassword,
        role: "ADMIN",
      })
      .returning()

    console.log(`Created admin user: ${admin.email}`)

    // Create business user
    const businessPassword = await hash("business123", 10)
    const [businessUser] = await db
      .insert(users)
      .values({
        name: "Business User",
        email: "business@example.com",
        password: businessPassword,
        role: "BUSINESS",
      })
      .returning()

    // Create business profile
    await db.insert(businessProfiles).values({
      userId: businessUser.id,
      companyName: "Acme Corporation",
      industry: "Technology",
      description: "A leading technology company",
      website: "https://acme.example.com",
      location: "San Francisco, CA",
      size: "50-100",
      foundedYear: 2010,
      specialties: ["Software Development", "Cloud Computing", "AI"],
      contactEmail: "contact@acme.example.com",
      contactPhone: "+1 (555) 123-4567",
    })

    console.log(`Created business user: ${businessUser.email}`)

    // Create professional user
    const professionalPassword = await hash("professional123", 10)
    const [professionalUser] = await db
      .insert(users)
      .values({
        name: "Professional User",
        email: "professional@example.com",
        password: professionalPassword,
        role: "PROFESSIONAL",
      })
      .returning()

    // Create professional profile
    await db.insert(professionalProfiles).values({
      userId: professionalUser.id,
      fullName: "John Doe",
      title: "Senior Software Engineer",
      company: "Tech Innovations",
      industry: "Software Development",
      bio: "Experienced software engineer with a passion for building scalable applications",
      location: "New York, NY",
      skills: ["JavaScript", "TypeScript", "React", "Node.js"],
      certifications: ["AWS Certified Developer", "Google Cloud Professional"],
      languages: ["English", "Spanish"],
      contactEmail: "john.doe@example.com",
      contactPhone: "+1 (555) 987-6543",
    })

    console.log(`Created professional user: ${professionalUser.email}`)

    console.log("Seed completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

main()

