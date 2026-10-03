import { createBrowserClient } from '@supabase/ssr'

// Exportação no formato "novo" (Usado pelo ERP GestoBap)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Exportação no formato "antigo" (Para não quebrar a loja Sweet Home que já existia)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);