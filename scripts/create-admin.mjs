import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);

  try {
    const contents = readFileSync(filePath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      if (!line || line.trim().startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^"(.*)"$/, "$1");

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing env files.
  }
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

loadEnvFile(".env.local");
loadEnvFile(".env");

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const { PrismaClient, UserRole } = await import("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@jdj3llc.com";
  const password = "Admin@1234";

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name: "JDJ3 Admin",
      role: UserRole.ADMIN,
      passwordHash: hashPassword(password),
      phoneNumber: null,
      referralCode: null,
      referredByUserId: null,
    },
    create: {
      name: "JDJ3 Admin",
      email,
      role: UserRole.ADMIN,
      passwordHash: hashPassword(password),
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log(`Admin account ready: ${admin.email} (${admin.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
