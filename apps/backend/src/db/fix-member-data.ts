import { db } from "./index"
import { sql } from "drizzle-orm"

async function fixMemberData() {
  console.log("Starting fix: member data...")

  try {
    // For seeded members: populate organization columns from user data
    // Personal info stays in name/email/phone, organization info goes to organization_* columns
    await db.execute(sql`
      UPDATE "users" SET
        organization_name = name,
        organization_email = email,
        organization_phone = phone,
        role_in_organization = 'Perwakilan Organisasi',
        organization_mbg_role = 'Mitra Program MBG',
        applied_at = created_at,
        verified_at = CASE WHEN is_verified = true THEN created_at ELSE NULL END
      WHERE role = 'member' AND (organization_name IS NULL OR organization_name = '')
    `)
    console.log("Populated organization columns for seeded members")

    // Set verifiedAt for already verified members that don't have it
    await db.execute(sql`
      UPDATE "users" SET
        verified_at = updated_at
      WHERE role = 'member' AND is_verified = true AND verified_at IS NULL
    `)
    console.log("Set verified_at for verified members")

    // Verify the data
    const members = await db.execute(sql`
      SELECT id, name, organization_name, organization_email, organization_phone,
             role_in_organization, organization_mbg_role, applied_at, verified_at
      FROM "users" WHERE role = 'member' LIMIT 5
    `)
    console.log("Sample member data after fix:")
    console.log(JSON.stringify(members, null, 2))

    console.log("Fix completed successfully!")
  } catch (error) {
    console.error("Fix failed:", error)
    process.exit(1)
  }

  process.exit(0)
}

fixMemberData()
