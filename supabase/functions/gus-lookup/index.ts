const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nip } = await req.json();

    if (!nip || !/^\d{10}$/.test(nip)) {
      return new Response(
        JSON.stringify({ success: false, error: 'NIP musi mieć 10 cyfr' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const url = `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${today}`;

    console.log('Fetching company data for NIP:', nip);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.result?.subject) {
      console.error('MF API error:', data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.result?.requestId 
            ? 'Nie znaleziono podmiotu o podanym NIP' 
            : 'Błąd API Ministerstwa Finansów' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subject = data.result.subject;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          company_name: subject.name || '',
          company_regon: subject.regon || '',
          nip: subject.nip || nip,
          address: subject.workingAddress || subject.residenceAddress || '',
          status: subject.statusVat || '',
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching company data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Nie udało się pobrać danych';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
