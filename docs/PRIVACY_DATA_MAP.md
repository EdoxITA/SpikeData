# SpikeData · Mappa dei dati (stato attuale, da completare)

| Dato | Dove | Finalità | Chi lo vede | Cancellazione |
|---|---|---|---|---|
| Email e password (hash) | Supabase Auth | Accesso all'account | Solo il titolare dell'account e l'amministratore del progetto | Eliminazione account dall'app |
| Membri squadra (email, ruolo) | Supabase `team_members` | Condivisione squadra | Membri della squadra | Uscita dalla squadra, eliminazione account o squadra |
| Inviti (codice, ruolo, scadenza) | Supabase `invites` | Ingresso in squadra | Proprietario | Scadenza 14 giorni; eliminazione squadra |
| Rosa (numero, nome, cognome, ruolo) | Dispositivo; Supabase `teams.roster` se in squadra | Scout | Membri della squadra | Modifica/eliminazione atleta; eliminazione squadra |
| Partite e azioni | Dispositivo; Supabase `matches` se in squadra | Statistiche | Membri della squadra | Eliminazione partita (resta segnata come eliminata), eliminazione squadra |
| Sessione | Dispositivo (`localStorage`) | Restare connessi | Il dispositivo | Uscita |
| Captcha | Cloudflare Turnstile | Bloccare registrazioni automatiche | Cloudflare | Secondo Cloudflare — **non citato nell'informativa** |
| Email di servizio | Google (Gmail SMTP) | Conferme e recupero password | Google | Secondo Google — **non citato nell'informativa** |
| Log tecnici | GitHub Pages, Supabase | Funzionamento | Fornitori | Secondo i fornitori |

Copie offline: chi è uscito o è stato tolto da una squadra conserva sul proprio dispositivo i dati già scaricati. Backup ed export Excel/PDF restano dove l'utente li salva.
