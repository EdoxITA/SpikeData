# SpikeData · Modello dati (attuale)

Partita (`scout-volley-v1`): `events[]`, `score{set:{us,them}}`, `set`, `rally[]` (chi ha vinto ogni punto), `first{}` (chi batte per primo per set), `lineup{}`, `subs[]`, `roles{}`, `extra[]`/`edits{}` (rosa), `meta{name,opp,date,home}`, `mid` (id partita), `updated`, `savedAt`.

Azione (`events[]`): `t` ora del dispositivo · `set` · `p` numero di maglia (0 = squadra) · `f` fondamentale (`B` battuta, `R` ricezione, `A` attacco, `D` difesa, `Z` alzata, `P` appoggio, `M` muro; falli `F4`, `FF`, `DB`, `TR`; `OE` errore avversario; `OA` punto avversario su attacco, con `z.b` zona da cui attaccano e `z.a` zona del nostro campo dove cade la palla) · `o` esito (`+`, `.`, `-`) · `ace` (ricezione/difesa con punto subito) · `sp` attacco sporcato · `z{a,b}` zone · `er` tipo di errore (`n` rete, `f` fuori, `m` murato) · `tg` destinataria dell'alzata · `pt` punto assegnato (`us`/`them`) · `ri`, `si` posizioni nella sequenza · `ed` ora dell'ultima correzione.

Partita online (`matches`): `scout_id`, `scout_at` = chi sta facendo lo scout e quando ha scritto o dato segno di presenza l'ultima volta (blocco di 2 minuti).

Limiti noti: il numero di maglia fa da identificativo dell'atleta; non c'è un id per azione né il concetto di scambio; nessuna versione dello schema. Da risolvere in fase C/D senza inventare dati mancanti nelle partite vecchie.
