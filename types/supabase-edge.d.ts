declare module 'npm:stripe@14.11.0' {
  import Stripe from 'stripe';
  export default Stripe;
}

declare module 'npm:@supabase/supabase-js@2.39.3' {
  export * from '@supabase/supabase-js';
}

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve: (...args: any[]) => any;
};
