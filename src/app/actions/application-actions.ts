
'use server';

/**
 * @fileOverview Application Actions
 * DEPRECATED: Database logic has moved to PHP for WordPress optimization.
 * This file is kept for server-side routing only.
 */

export async function submitApplication(data: any) {
  // Logic has moved to client-side fetch in page.tsx calling WordPress PHP API
  return { success: true };
}

export async function getApplications() {
  // Logic has moved to direct WordPress database queries in PHP
  return [];
}
