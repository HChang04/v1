
import { VIETNAM_PIT_BRACKETS, PERSONAL_DEDUCTION_VND, DEPENDENT_DEDUCTION_VND, SOCIAL_INSURANCE_RATE, HEALTH_INSURANCE_RATE, UNEMPLOYMENT_INSURANCE_RATE } from '../constants';
import { PITBracket } from '../types';

interface DeductionDetails {
    si: number;
    hi: number;
    ui: number;
    personal: number;
    dependent: number;
    pit: number;
}

interface SalaryCalculationResult {
    netSalary: number;
    deductions: DeductionDetails;
    taxableIncome: number;
}

/**
 * Calculates Personal Income Tax (PIT) based on Vietnamese progressive tax brackets.
 * @param taxableIncome The income amount subject to tax.
 * @returns The calculated PIT amount.
 */
export const calculatePIT = (taxableIncome: number): number => {
  if (taxableIncome <= 0) return 0;

  let pit = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of VIETNAM_PIT_BRACKETS) {
    if (remainingIncome <= 0) break;

    const bracketMin = bracket.from;
    const bracketMax = bracket.to;
    const rate = bracket.rate;

    // Determine income in this bracket
    let incomeInBracket: number;
    if (bracketMax === null) { // Highest bracket
      incomeInBracket = remainingIncome;
    } else {
      if (taxableIncome > bracketMax) {
        incomeInBracket = bracketMax - bracketMin;
      } else {
        incomeInBracket = taxableIncome - bracketMin;
      }
      // Ensure incomeInBracket is not negative if taxableIncome is less than bracketMin (already handled by previous brackets)
      incomeInBracket = Math.max(0, incomeInBracket); 
    }
    
    // For progressive tax, we only care about the portion of remainingIncome that falls into this bracket's range
    // A simpler way for progressive:
    // If taxable income > bracket.from:
    //   taxable_in_this_bracket = min(taxable_income, bracket.to ?? Infinity) - bracket.from
    //   pit += taxable_in_this_bracket * bracket.rate
    // This needs to be calculated tier by tier.
  }
  
  // Corrected progressive calculation:
  let accumulatedTax = 0;
  let incomeProcessed = 0;

  for (const bracket of VIETNAM_PIT_BRACKETS) {
    if (taxableIncome <= bracket.from) {
      break; // Taxable income is below this bracket's start
    }

    const incomeInThisBracket = Math.min(taxableIncome, bracket.to ?? Infinity) - bracket.from;
    
    if (incomeInThisBracket > 0) {
        accumulatedTax += incomeInThisBracket * bracket.rate;
    }
    
    if (bracket.to !== null && taxableIncome <= bracket.to) {
        break; // All taxable income has been processed
    }
  }
  pit = accumulatedTax;


  // A common way to implement progressive tax is as follows:
  // Reset PIT for a cleaner calculation based on standard progressive method
  pit = 0;
  let tempTaxableIncome = taxableIncome;

  if (tempTaxableIncome > 80_000_000) {
    pit += (tempTaxableIncome - 80_000_000) * 0.35;
    tempTaxableIncome = 80_000_000;
  }
  if (tempTaxableIncome > 52_000_000) {
    pit += (tempTaxableIncome - 52_000_000) * 0.30;
    tempTaxableIncome = 52_000_000;
  }
  if (tempTaxableIncome > 32_000_000) {
    pit += (tempTaxableIncome - 32_000_000) * 0.25;
    tempTaxableIncome = 32_000_000;
  }
  if (tempTaxableIncome > 18_000_000) {
    pit += (tempTaxableIncome - 18_000_000) * 0.20;
    tempTaxableIncome = 18_000_000;
  }
  if (tempTaxableIncome > 10_000_000) {
    pit += (tempTaxableIncome - 10_000_000) * 0.15;
    tempTaxableIncome = 10_000_000;
  }
  if (tempTaxableIncome > 5_000_000) {
    pit += (tempTaxableIncome - 5_000_000) * 0.10;
    tempTaxableIncome = 5_000_000;
  }
  if (tempTaxableIncome > 0) { // Tax for the first bracket (0 to 5M)
    pit += tempTaxableIncome * 0.05;
  }

  return Math.max(0, pit); // Ensure PIT is not negative
};


/**
 * Calculates Net Salary from Gross Salary.
 * @param grossSalary The total gross salary.
 * @param numberOfDependents The number of dependents for deduction.
 * @returns An object containing net salary, deduction details, and taxable income.
 */
export const calculateNetSalary = (grossSalary: number, numberOfDependents: number): SalaryCalculationResult => {
  if (grossSalary < 0) grossSalary = 0;

  const siDeduction = grossSalary * SOCIAL_INSURANCE_RATE;
  const hiDeduction = grossSalary * HEALTH_INSURANCE_RATE;
  const uiDeduction = grossSalary * UNEMPLOYMENT_INSURANCE_RATE;

  const totalInsuranceDeductions = siDeduction + hiDeduction + uiDeduction;

  const personalRelief = PERSONAL_DEDUCTION_VND;
  const dependentRelief = numberOfDependents * DEPENDENT_DEDUCTION_VND;
  const totalRelief = personalRelief + dependentRelief;

  const taxableIncomeForPIT = Math.max(0, grossSalary - totalInsuranceDeductions - totalRelief);
  
  const pitAmount = calculatePIT(taxableIncomeForPIT);

  const totalDeductions = totalInsuranceDeductions + pitAmount;
  const netSalary = grossSalary - totalDeductions;

  return {
    netSalary: Math.max(0, netSalary),
    deductions: {
      si: siDeduction,
      hi: hiDeduction,
      ui: uiDeduction,
      personal: personalRelief,
      dependent: dependentRelief,
      pit: pitAmount,
    },
    taxableIncome: taxableIncomeForPIT,
  };
};


/**
 * Estimates Gross Salary from Net Salary (Iterative approach).
 * This is more complex due to the progressive nature of PIT.
 * @param netSalary The desired net salary.
 * @param numberOfDependents The number of dependents.
 * @returns Estimated gross salary.
 */
export const estimateGrossSalary = (netSalary: number, numberOfDependents: number): number => {
  if (netSalary <= 0) return 0;

  let estimatedGross = netSalary; // Initial guess
  let calculatedNet = 0;
  const maxIterations = 100; // Prevent infinite loops
  const tolerance = 1000; // VND, acceptable difference

  for (let i = 0; i < maxIterations; i++) {
    const result = calculateNetSalary(estimatedGross, numberOfDependents);
    calculatedNet = result.netSalary;

    const difference = netSalary - calculatedNet;

    if (Math.abs(difference) < tolerance) {
      break; // Close enough
    }
    
    // Adjust gross salary guess
    // This is a simple adjustment; more sophisticated methods (like Newton-Raphson) could be used.
    // If calculatedNet is too low, increase gross. If too high, decrease.
    // The adjustment factor needs to be chosen carefully.
    // A common approach is to add the difference, but since deductions are a percentage,
    // this might overshoot. Let's try a more conservative adjustment.
    // If net is 10M, calculated is 8M, diff is 2M. Gross needs to be higher.
    // How much higher? If PIT is ~20%, then gross needs to be ~2M / (1 - 0.08 - 0.015 - 0.01 - 0.20) higher.
    // Or simpler, just add the difference to gross as a starting point.
    estimatedGross += difference;

    if (estimatedGross < 0) estimatedGross = 0; // Sanity check
  }
  
  // One final calculation with the best estimate
  const finalCalculation = calculateNetSalary(estimatedGross, numberOfDependents);
  // If still not close, this indicates the simple iteration might not be perfect.
  // For many cases, it should be reasonably close.
  // console.log(`Final Iteration: Estimated Gross: ${estimatedGross}, Calculated Net: ${finalCalculation.netSalary}, Target Net: ${netSalary}`);

  return Math.max(0, estimatedGross);
};
