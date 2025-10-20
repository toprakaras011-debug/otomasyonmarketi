declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export interface ServeInit {
    addr?: string;
    signal?: AbortSignal;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export type Handler = (request: Request) => Response | Promise<Response>;

  export function serve(handler: Handler, options?: ServeInit): Promise<void>;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}

declare module 'https://esm.sh/stripe@11.1.0' {
  import Stripe from 'stripe';
  export default Stripe;
  export * from 'stripe';
}

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve: (...args: any[]) => any;
};
