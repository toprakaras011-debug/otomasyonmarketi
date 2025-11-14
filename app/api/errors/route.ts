import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { getErrorMessage, getErrorCategory } from '@/lib/error-messages';

interface ErrorReport {
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  category: 'auth' | 'database' | 'api' | 'ui' | 'performance' | 'security' | 'unknown';
  context?: {
    userId?: string;
    userEmail?: string;
    url?: string;
    userAgent?: string;
    timestamp?: string;
    sessionId?: string;
    buildVersion?: string;
    environment?: string;
    additionalData?: Record<string, any>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const errorReport: ErrorReport = await request.json();

    // Validate required fields
    if (!errorReport.message || !errorReport.level || !errorReport.category) {
      return NextResponse.json(
        { error: 'Missing required fields: message, level, category' },
        { status: 400 }
      );
    }

    // Rate limiting check (simple implementation)
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `error_rate_${clientIP}`;
    
    // In production, you'd use Redis or similar for rate limiting
    // For now, we'll just log and continue

    // Get user context if available
    let userId: string | null = null;
    let userEmail: string | null = null;

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.email || null;
      }
    } catch (authError) {
      // Ignore auth errors in error reporting
    }

    // Enhance error report with server-side context
    const enhancedReport: ErrorReport = {
      ...errorReport,
      context: {
        ...errorReport.context,
        userId: userId || errorReport.context?.userId,
        userEmail: userEmail || errorReport.context?.userEmail,
        timestamp: errorReport.context?.timestamp || new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
      }
    };

    // Log using logger
    logger.error('Server Error Report', new Error(enhancedReport.message), {
      level: enhancedReport.level,
      category: enhancedReport.category,
      stack: enhancedReport.stack,
      context: enhancedReport.context,
    });

    // Store in database for analysis (optional)
    if (process.env.NODE_ENV === 'production') {
      try {
        const supabase = await createClient();
        
        // Create error_logs table if it doesn't exist (you can run this migration separately)
        await supabase.from('error_logs').insert({
          message: enhancedReport.message.substring(0, 1000), // Limit message length
          stack: enhancedReport.stack?.substring(0, 5000), // Limit stack length
          level: enhancedReport.level,
          category: enhancedReport.category,
          user_id: userId,
          user_email: userEmail,
          url: enhancedReport.context?.url?.substring(0, 500),
          user_agent: enhancedReport.context?.userAgent?.substring(0, 500),
          session_id: enhancedReport.context?.sessionId,
          build_version: enhancedReport.context?.buildVersion,
          environment: enhancedReport.context?.environment,
          additional_data: enhancedReport.context?.additionalData,
          created_at: new Date().toISOString(),
        });
      } catch (dbError) {
        // Don't fail error reporting if database insert fails
        logger.warn('Failed to store error in database', { error: dbError });
      }
    }

    // Send to external monitoring service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      await sendToExternalMonitoring(enhancedReport);
    }

    return NextResponse.json({ success: true, message: 'Error reported successfully' });

  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Error in error reporting endpoint', errorObj);
    
    const category = getErrorCategory(errorObj);
    const errorMessage = getErrorMessage(errorObj, category, 'Error report işleme başarısız oldu');
    
    // Don't return detailed error info to client for security
    return NextResponse.json(
      { error: 'Failed to process error report', message: errorMessage },
      { status: 500 }
    );
  }
}

async function sendToExternalMonitoring(errorReport: ErrorReport): Promise<void> {
  try {
    // Example: Send to Sentry
    // if (process.env.SENTRY_DSN) {
    //   // Sentry integration code here
    // }

    // Example: Send to custom logging service
    // if (process.env.CUSTOM_LOGGING_ENDPOINT) {
    //   await fetch(process.env.CUSTOM_LOGGING_ENDPOINT, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${process.env.LOGGING_API_KEY}`,
    //     },
    //     body: JSON.stringify(errorReport),
    //   });
    // }

    // For now, just log that we would send to external service
    logger.info('Would send to external monitoring service', {
      level: errorReport.level,
      category: errorReport.category,
      message: errorReport.message.substring(0, 100),
    });

  } catch (error) {
    logger.warn('Failed to send to external monitoring', { error });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'error-monitoring'
  });
}
