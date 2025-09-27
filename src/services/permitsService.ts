import { PermitsData, PermitsCalculation, PermitsStatus } from '../types/permits';

export class PermitsService {
  private static readonly PERMIT_CAPACITY_T = 100000; // tCO₂ per permit

  static calculatePermitsStatus(input: PermitsData): PermitsStatus {
    // Validation
    if (!input.active_permits && input.active_permits !== 0) {
      return {
        isValid: false,
        error: "Insufficient data to calculate permit validity. Please provide active_permits and avg_consumption_rate_t_per_month.",
        recommendations: []
      };
    }

    if (!input.avg_consumption_rate_t_per_month) {
      return {
        isValid: false,
        error: "Insufficient data to calculate permit validity. Please provide active_permits and avg_consumption_rate_t_per_month.",
        recommendations: []
      };
    }

    if (input.avg_consumption_rate_t_per_month <= 0) {
      return {
        isValid: false,
        error: "Average consumption must be > 0 tCO₂/month.",
        recommendations: []
      };
    }

    // Set defaults
    const target_buffer_months = input.target_buffer_months || 12;
    const warning_threshold_pct = input.warning_threshold_pct || 80;

    // Calculate derived values
    const total_capacity_t = input.active_permits * this.PERMIT_CAPACITY_T;
    const months_remaining = total_capacity_t / input.avg_consumption_rate_t_per_month;
    const years_remaining = months_remaining / 12;

    // Determine status light
    let status_light: 'green' | 'yellow' | 'red';
    if (input.active_permits === 0) {
      status_light = 'red';
    } else if (months_remaining > 24) {
      status_light = 'green';
    } else if (months_remaining > 12) {
      status_light = 'yellow';
    } else {
      status_light = 'red';
    }

    // Calculate consumed percentage if cumulative emissions provided
    let consumed_pct: number | undefined;
    if (input.cumulative_emissions_t !== undefined && total_capacity_t > 0) {
      consumed_pct = (input.cumulative_emissions_t / total_capacity_t) * 100;
    }

    // Calculate needed permits for buffer
    const total_needed_capacity = input.avg_consumption_rate_t_per_month * (months_remaining + target_buffer_months);
    const needed_permits_for_buffer = Math.max(0, Math.ceil((total_needed_capacity - total_capacity_t) / this.PERMIT_CAPACITY_T));
    const months_to_buffer = Math.max(0, target_buffer_months - (months_remaining - target_buffer_months));

    const calculation: PermitsCalculation = {
      total_capacity_t,
      months_remaining,
      years_remaining,
      status_light,
      consumed_pct,
      needed_permits_for_buffer,
      months_to_buffer
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      input,
      calculation,
      target_buffer_months,
      warning_threshold_pct
    );

    return {
      isValid: true,
      data: calculation,
      recommendations
    };
  }

  private static generateRecommendations(
    input: PermitsData,
    calc: PermitsCalculation,
    target_buffer_months: number,
    warning_threshold_pct: number
  ): string[] {
    const recommendations: string[] = [];

    if (input.active_permits === 0) {
      recommendations.push("Procure permits immediately - no active permits available.");
      recommendations.push("Contact compliance team to avoid regulatory penalties.");
      return recommendations;
    }

    switch (calc.status_light) {
      case 'red':
        if (calc.needed_permits_for_buffer > 0) {
          recommendations.push(
            `At the current usage rate, buy ${calc.needed_permits_for_buffer.toLocaleString()} permits within ${Math.ceil(calc.months_to_buffer)} months to maintain a ${target_buffer_months}-month buffer.`
          );
        }
        recommendations.push("Implement immediate emission reduction measures to extend permit validity.");
        if (recommendations.length < 3) {
          recommendations.push("Review monthly consumption patterns for optimization opportunities.");
        }
        break;

      case 'yellow':
        if (calc.needed_permits_for_buffer > 0) {
          recommendations.push(
            `Model a 10–20% reduction scenario; buying ${calc.needed_permits_for_buffer.toLocaleString()} permits extends coverage to >24 months.`
          );
        }
        recommendations.push("Evaluate emission reduction initiatives to improve permit efficiency.");
        if (recommendations.length < 3) {
          recommendations.push(`Set an alert at ${warning_threshold_pct}% capacity used.`);
        }
        break;

      case 'green':
        recommendations.push("Revisit average consumption quarterly; set auto-alert at 80% capacity used.");
        recommendations.push("Consider banking excess permits or trading opportunities.");
        if (calc.years_remaining > 5) {
          recommendations.push("Evaluate long-term emission reduction investments for cost optimization.");
        }
        break;
    }

    return recommendations.slice(0, 3); // Max 3 recommendations
  }

  static formatNumber(num: number): string {
    return num.toLocaleString();
  }

  static formatYears(years: number): string {
    if (years > 10) {
      return ">10.0";
    }
    return years.toFixed(1);
  }

  static getStatusLabel(status: 'green' | 'yellow' | 'red', years: number): string {
    switch (status) {
      case 'green':
        return `🟢 Green — validity >24 months (${this.formatYears(years)} years)`;
      case 'yellow':
        return `🟡 Yellow — validity between 12–24 months (${this.formatYears(years)} years)`;
      case 'red':
        return `🔴 Red — validity ≤12 months (${this.formatYears(years)} years)`;
    }
  }
}