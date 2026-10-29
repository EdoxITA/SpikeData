# Configurazione Supabase di SpikeData

Qui c'è tutto quello che serve per ricreare il servizio online (account, squadre, partite) su un progetto Supabase nuovo.
Nessuna password o chiave segreta è salvata in questa cartella.

1. **SQL Editor → New query**: lancia `1-schema.sql`, poi `2-sicurezza.sql` e `3-keepalive.sql` (si possono rilanciare senza problemi).
2. **Authentication → URL Configuration**: Site URL e Redirect URLs = indirizzo dell'app (`https://edoxita.github.io/SpikeData/`).
3. **Authentication → Sign In / Providers → Email**: password minimo 8 caratteri con lettere e numeri; *Confirm email* attivo solo con SMTP configurato.
4. **Authentication → Emails → SMTP Settings**: Gmail di SpikeData (`smtp.gmail.com`, porta 587, password per le app di Google).
5. **Authentication → Emails → Templates**: per ogni mail incolla tutto il file `.html` di `email/` nel *Body* (scheda Source) e l’oggetto da `email/OGGETTI.txt` nel *Subject*.
6. **Authentication → Attack Protection**: Captcha Cloudflare Turnstile con la Secret Key (la Site Key pubblica è già nell'app).
7. **Niente pause per inattività** (piano gratuito): su cron-job.org un cronjob ogni 6 ore chiama `https://<progetto>.supabase.co/rest/v1/rpc/keepalive?apikey=<chiave pubblicabile>` (funzione di `3-keepalive.sql`, non tocca i dati). Se fallisce, cron-job.org avvisa via email.

Nell'app servono solo l'indirizzo del progetto e la chiave pubblica (*publishable*), che sono pensati per stare nel codice.
