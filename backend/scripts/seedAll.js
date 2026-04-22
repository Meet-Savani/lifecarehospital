import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scripts = [
  'seedAdmin.js',
  'seedDoctor.js',
  'seedBlog.js',
  'seedFAQ.js',
  'seedService.js'
];

console.log('Starting full database seeding...');

scripts.forEach(script => {
  const scriptPath = path.join(__dirname, script);
  console.log(`\nUsing script: ${script}`);
  try {
    execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    console.log(`Successfully completed: ${script}`);
  } catch (error) {
    console.error(`Error running ${script}:`, error.message);
    process.exit(1);
  }
});

console.log('\nAll seeding operations completed successfully!');
process.exit(0);
