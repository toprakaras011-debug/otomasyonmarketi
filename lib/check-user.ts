/**
 * Check if a user exists in the database by email
 * This function uses the API endpoint to check user status
 */
export async function checkUserExists(email: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    console.log('[DEBUG] check-user.ts - Checking user existence', {
      email: normalizedEmail,
    });

    // Use API endpoint to check user
    const response = await fetch(`/api/check-user?email=${encodeURIComponent(normalizedEmail)}`);
    const apiResult = await response.json();
    
    if (!response.ok) {
      throw new Error(apiResult.error || 'Failed to check user');
    }
    
    return apiResult;
  } catch (error: any) {
    console.error('[DEBUG] check-user.ts - Error', {
      message: error?.message,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });

    throw new Error(`Failed to check user: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Get user status for debugging
 */
export async function getUserStatus(email: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    // Use API endpoint to check user
    const response = await fetch(`/api/check-user?email=${encodeURIComponent(normalizedEmail)}`);
    const apiResult = await response.json();
    
    if (!response.ok) {
      throw new Error(apiResult.error || 'Failed to check user');
    }

    const status = {
      email: normalizedEmail,
      profile_exists: !!apiResult.profile,
      profile_data: apiResult.profile,
      profile_error: apiResult.profile_error,
      message: apiResult.message,
      instructions: apiResult.instructions || [],
      recommendations: [] as string[],
    };

    if (!apiResult.profile) {
      status.recommendations.push(
        'User profile not found. This might mean:',
        '1. User was never created',
        '2. User exists in auth.users but profile creation failed',
        '3. Email address is incorrect',
        '',
        'To fix:',
        '- Try signing up again',
        '- Check Supabase dashboard for auth.users entry',
        '- Verify email address is correct'
      );
    } else {
      status.recommendations.push(
        'User profile found!',
        `Username: ${apiResult.profile.username}`,
        `Role: ${apiResult.profile.role || 'user'}`,
        `Admin: ${apiResult.profile.is_admin ? 'Yes' : 'No'}`,
        '',
        'If login still fails:',
        '- Check if password is correct',
        '- Verify email is confirmed in auth.users (now optional)',
        '- Check RLS policies'
      );
    }

    // Add instructions from API
    if (apiResult.instructions && apiResult.instructions.length > 0) {
      status.recommendations.push('', 'Manual check instructions:');
      status.recommendations.push(...apiResult.instructions);
    }

    return status;
  } catch (error: any) {
    console.error('[DEBUG] getUserStatus error:', error);
    throw error;
  }
}
