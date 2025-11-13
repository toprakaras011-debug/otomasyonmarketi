import { supabase } from '@/lib/supabase';

/**
 * Fetch user profile by ID
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Fetch user's purchases
 */
export async function getUserPurchases(userId: string) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        id,
        automation_id,
        price_paid,
        status,
        purchased_at,
        automation:automations(
          id,
          title,
          slug,
          image_url,
          is_published,
          admin_approved
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('purchased_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    return [];
  }
}

/**
 * Fetch user's favorites
 */
export async function getUserFavorites(userId: string) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        automation:automations(
          *,
          category:categories(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
}

/**
 * Check if user has favorited an automation
 */
export async function isFavorited(userId: string, automationId: string) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('automation_id', automationId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}
