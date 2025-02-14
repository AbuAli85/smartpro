import { SystemValidator } from "../utils/validation";

async function validateSystem() {
  console.log("Starting system validation...");
  const validator = new SystemValidator();

  // Run all validations
  await validator.validateAuth();
  await validator.validateRBAC();
  await validator.validatePayments();
  await validator.validateServices();

  // Generate and display report
  const report = validator.generateReport();
  console.log(report);
}

validateSystem().catch(console.error);
