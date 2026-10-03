import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos o cliente padrão do Supabase para essa tarefa de servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Para garantir que o Next.js não faça cache dessa rota e sempre bata no banco
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Uma consulta microscópica apenas para gerar tráfego no banco (limit 1)
    const { error } = await supabase.from('loja_config').select('id').limit(1);

    if (error) throw error;

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Supabase despertado com sucesso! 🚀', 
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}