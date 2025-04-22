import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({ path: '.env.local' });

async function main() {
  console.log('Running migrations...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }
  
  // For migrations, use a separate connection with higher timeout
  const migrationClient = postgres(connectionString, { max: 1, ssl: 'prefer' });
  
  try {
    await migrate(drizzle(migrationClient), {
      migrationsFolder: 'db/migrations'
    });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

main(); 