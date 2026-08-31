# Plano — modal de origem VISA (teor do documento + dados da OS)

> **Status: aprovado, não implementado.** Documento de planejamento levantado em
> 31/08/2026. Nenhuma linha de código deste plano foi escrita ainda.

## Contexto

O RMPF importa `data/inspecoes.csv` (mais 9 CSVs de apoio) do repositório
privado `garrado/VISA` e grava lançamentos na coleção `manuais` do Firestore.
As telas mostram as colunas **OS** e **Documento** como texto puro — nenhuma
das duas abre nada (`meus-lancamentos.html:435-436`, `conferencia.html:638-639`).

Quando o fiscal ou o gestor precisa saber **o que foi lavrado** naquele
documento, ou **de onde veio a demanda** daquela OS, tem de sair do RMPF e
abrir o VISA (ou o WCVS). A informação existe e está a um clique de distância
— só não está exposta.

Objetivo: transformar os dois números em links que abrem um modal com

1. **Teor do documento lavrado** — o texto digitado no termo/auto;
2. **Dados da OS / origem da demanda** — requerente, motivo, assunto, status.

Fora do escopo (decisão de 31/08): ficha do regulado e histórico de inspeções
do estabelecimento, ambos disponíveis em `data/reg/<nn>/<codigo>.json` caso se
queira numa etapa seguinte. `dashboard.html` também fica de fora.

## Análise de custo Firebase (a pergunta que travava a decisão)

A dúvida era se "gravar na importação" sairia mais caro que "buscar no clique".
**Nenhuma das duas move o ponteiro.**

### Linha de base medida (console em 31/08/2026)

| Métrica | Valor | Cota grátis/dia | Situação |
|---|---|---|---|
| Leituras — 30 dias | 3.002.283 (~100 mil/dia) | 50.000 | ~2× acima |
| Leituras — hoje | 101.032 | 50.000 | 2× acima |
| **Gravações — hoje** | **694** | 20.000 | **3% usados** |
| Exclusões — hoje | 9 | 20.000 | 0% |

Faturas emitidas:

| Competência | Valor |
|---|---|
| Maio/2026 | R$ 1,32 |
| Junho/2026 | R$ 6,68 |
| **Julho/2026** | **R$ 214,67** ← pico da Geocoding API |
| Agosto/2026 (previsto) | R$ 5,50 |

O Firestore **nem aparece** entre os serviços principais dos últimos 12 meses
(Geocoding API ~R$ 200 ≫ App Engine ~R$ 30 > Cloud Storage ~R$ 10). A fatura de
julho confirma com número o que `relatorio-custos-google-cloud-2026-07.md`
previu: drenagem autolimitante do backlog de 26 mil regulados, já normalizada
em agosto. **O regime normal do ecossistema é R$ 1–7/mês.**

Três consequências:

1. **O problema do projeto é leitura, não escrita.** As gravações usam 3% da
   cota gratuita — sobram ~19.300/dia.
2. **O quadro melhorou desde julho**: 3,0 M leituras/30 dias contra 4,4 M
   (−32%), e os fins de semana vão a quase zero (16, 23 e 30/ago), contra os
   45–55 mil que o relatório apontava como pendência em aberto.
3. **A base de comparação é R$ 5,87/mês para o projeto inteiro.** Abaixo de
   ~R$ 0,50/mês é ruído contábil.

### Custo marginal da feature

Preço ancorado no próprio `relatorio-custos-google-cloud-2026-07.md` (2,9 M
leituras ≈ R$ 10–16 → **R$ 3,4–5,5 por milhão de leituras**; escrita custa 3× a
leitura) e nos preços de lista do GCP (Firestore storage ~R$ 1,00–1,40/GiB/mês;
Cloud Storage Class B ~R$ 2,20/milhão de GETs; egress ~R$ 0,65/GB).

Volumes: ~1.200 lançamentos/mês em `manuais`, ~30 fiscais, `his/<ndoc>.json`
pesa ~1–3 KB, estimadas 2.000 aberturas de modal/mês.

| Item | Volume/mês | Custo/mês |
|---|---|---|
| Leituras Firestore adicionais | 0 | **R$ 0,00** |
| Gravações adicionais (campos anexados a escritas que já ocorrem) | 0 | **R$ 0,00** |
| Storage Firestore dos campos novos (~350 B × 20 mil docs) | 7 MB | **R$ 0,01** |
| Backfill único nos lançamentos antigos | 20 mil, 1× | **R$ 0,26 uma vez** |
| GETs no bucket (`his/<ndoc>.json`) | 2.000 | **R$ 0,004** |
| Egress do bucket (2.000 × 2 KB) | 4 MB | **R$ 0,003** |

Para dimensionar: no painel "APIs e serviços" (último dia) o projeto fez
Identity Toolkit 358 req, Geocoding 269, Token Service 114, Cloud Firestore API
17, FCM 10. As ~60 req/dia que a feature acrescentaria ao Cloud Storage ficam
na ordem de grandeza do FCM.

Ler os JSON pela **API do GitHub** em vez do bucket também é R$ 0,00 de GCP —
sai pela Contents API, já usada hoje. A diferença é gastar cota do PAT (5.000
req/h, dividida com o auto-import).

**Conclusão: a decisão é de UX e robustez, não de custo.** Daí o caminho
híbrido adotado abaixo.

## Arquitetura

### Fontes no VISA (todas já existem)

| Dado | Origem | Chave |
|---|---|---|
| Teor do documento | `data/his/<ndoc % 100>/<ndoc>.json` → campo `decr` | `NDOC` do `inspecoes.csv` |
| Requerimento (requerente, motivo, prazo) | `data/requerimento.csv` | `OS` |
| Status/assunto da OS | `data/os_status.csv` | `OS` |
| Ofício (origem, emitente, motivo) | `data/oficio.csv` | `Oficio` |
| Denúncia (data, objeto, meio) | `data/denuncia.csv` | `Denuncia` |
| Protocolo (protocolante, assunto) | `data/protocolo.csv` | `Protocolo` |

`requerimento.csv`, `oficio.csv`, `denuncia.csv` e `tramitacao.csv` **já são
baixados e parseados a cada importação** (`js/visa-import.js:959-1050`) — hoje
só se aproveita `prioridade` e `Prazo`. Ampliar os `Map` existentes custa
**zero fetch e zero leitura**. `os_status.csv` e `protocolo.csv` entram novos.

### Leitura do `his/<ndoc>.json` — Storage com fallback

RMPF e VISA vivem no **mesmo projeto** `visam-3a30b`
(`js/firebase-config.js:9-21`), e o bucket já espelha `data/his/**` via
`sync-storage.yml` do VISA. Portar `VISA/js/data-remote.js` para
`RMPF/js/visa-data-remote.js`, adaptando:

- **SDK** — o VISA usa import modular v10; o RMPF usa **compat**. Trocar o
  `import()` dinâmico por `firebase.auth().currentUser.getIdToken()`, aguardando
  `window.authReady` (já exposto por `js/guard.js:37`).
- **Fallback** — no VISA o fallback é o caminho local do Pages; no RMPF esse
  caminho não existe. Usar **`window.fetchGitHubCSV(path)`**
  (`js/firestore.js:987`), que já lê qualquer arquivo do repo privado pela
  Contents API com o PAT e devolve o conteúdo bruto (basta `JSON.parse`).

Manter do original: circuit breaker de 3 falhas, timeout de 20 s, interruptor
`localStorage.visaDataRemoteOff`, e cache em memória por `ndoc` (documento
lavrado não muda). Helper de sharding, literal de `VISA/js/regulados1.js:7`:
`hisBucket = (ndoc) => String((Number(ndoc) || 0) % 100).padStart(2, '0')`.

> O fallback não é zelo excessivo: o bucket tem **dois `cors.json` conflitantes**
> versionados (ver Pré-requisitos). Com ele, a feature funciona no dia 1 mesmo
> que o CORS ainda não esteja certo.

## Mudanças por arquivo

### 1. `js/visa-import.js`

- Guardar **`NDOC`** da linha (`row['NDOC']`, junto de `CONTROLE`/`CODIGO` em
  `:1359-1400`) como `ndoc` no documento.
- Ampliar os `Map` de `:959-1050`: `requerimentoMap` + requerente/motivo/dt_req;
  `oficioMap` + origem/emitente/motivo/data; `denunciaMap` + data/descrição/meio.
- Dois parses novos no formato dos existentes: `data/os_status.csv` (status,
  assunto, dt_atend) e `data/protocolo.csv` (protocolante, assunto). Com o mesmo
  `try/catch` + `onProgress` dos irmãos, contando para `fontesIncompletas`.
- Montar um objeto plano **`os_detalhe`** conforme `motivo_os` (a `Modalidade`
  já decide a chave em `:1386-1390`) e gravá-lo em `_novoDoc` (`:1921-1955`) e
  em `updateData` (`:1705-1735`).
- **Registrar `ndoc` e `os_detalhe` em `VISA_CAMPOS_INFORMATIVOS`** (`:295`) —
  e **não** em `VISA_CAMPOS_ORIGEM` (`:235-239`). Este é o ponto central:
  informativo sincroniza em lançamento já homologado **sem reabrir a
  homologação** (`visaPatchInformativo`, `:318-325`). Em `VISA_CAMPOS_ORIGEM`,
  a primeira rodada reabriria em massa homologações legítimas.
- `visaDiffInformativo` já trata chave ausente como diferença (`:297-315`),
  então lançamentos antigos se preenchem sozinhos na primeira rodada da
  competência aberta.

### 2. `js/visa-auto-import.js`

Acrescentar `data/os_status.csv` e `data/protocolo.csv` a
`VISA_AUTO_IMPORT_ARQUIVOS` (`:20-31`). Sem isso, mudança neles não dispara
reimportação e o `os_detalhe` envelhece silenciosamente — exatamente o bug que
o comentário daquele bloco descreve.

### 3. `js/visa-data-remote.js` — **novo**

Porte descrito acima. Expõe `window.RMPFVisaData = { fetchHistorico(ndoc) }`,
devolvendo `{ ndoc, decr }` ou `null`. **404 = documento sem texto digitado,
que é diferente de erro de rede** — o VISA aprendeu isso na marra
(`VISA/js/regulados1.js:762-765`): a mensagem de falha **não** pode dizer "sem
conteúdo digitado", porque o fiscal lê como fato sobre o documento.

### 4. `js/utils.js`

Seguindo o padrão já consolidado no arquivo (modal injetado uma vez + delegação
global por classe + `dataset`), igual a `abrirFiscais`/`abrirRecusaAlterada`:

- `osNumeroHtml(m)` — devolve `<span class="visa-origem-link" role="button"
  tabindex="0" data-...>` quando há `os_numero`; texto puro caso contrário.
- `documentoComNumeroHtml(m)` (`:904-910`) — vira link quando `m.ndoc` existe;
  mantém o texto atual quando não (lançamentos antigos, antes do backfill).
- `abrirVisaOrigem(ds)` + `_initVisaOrigemModal()` — **um único modal**
  `#modal-visa-origem`, com duas seções. Abre **instantâneo** com os dados da OS
  (já estão no documento carregado pela tela) e um placeholder "Carregando teor
  do documento…" que o fetch preenche. O título muda conforme o clique e a
  seção correspondente vem primeiro.
- Delegação `click` + `keydown` (Enter/Espaço) e exports em `:1466-1495`.

Todo texto passa por `escHtml` — `decr` é conteúdo digitado por fiscal no WCVS
e vai para `innerHTML`. As quebras `\r\n` viram `<br>` **depois** do escape.

### 5. `css/rmpf.css`

`.visa-origem-link` com a aparência de `.fiscais-link`
(`cursor:pointer; text-decoration:underline`), já usada para o mesmo gesto.

### 6. `meus-lancamentos.html` e `conferencia.html`

- Carregar `js/visa-data-remote.js` depois de `js/guard.js` (precisa de auth).
- Trocar a `<td>` de OS por
  `${window.osNumeroHtml ? window.osNumeroHtml(m) : escHtml(m.os_numero || '—')}`
  (`meus-lancamentos.html:435`, `conferencia.html:638`). A `<td>` de Documento
  já chama `documentoComNumeroHtml` — não muda.

### 7. `.github/scripts/backfill_visa_fields.py`

O script já baixa `inspecoes.csv` pela Contents API e grava campos via REST do
Firestore. Estender para preencher `ndoc` e `os_detalhe` nos lançamentos
anteriores à competência aberta, que a importação não visita. Rodar 1× pelo
`backfill-visa-fields.yml` (`workflow_dispatch`).

### 8. `docs/integracao-visa-rmpf.md`

Nova seção documentando o modal, as fontes e o esquema de `os_detalhe`.
Aproveitar para corrigir a **linha 17**, que documenta a fonte como
`raw.githubusercontent.com/garrado/VISA/main/data/inspecoes.csv` — URL que **não
funciona** (o repo é privado). O código usa `api.github.com/repos/.../contents/`
com PAT desde sempre.

### 9. Changelog e versão — **não nesta etapa**

Conforme a convenção do projeto, bump de `js/version.js` +
`service-worker.js` e entrada no `changelog.html` só **depois** do teste e da
confirmação do usuário.

## Pré-requisitos operacionais (verificar antes de testar)

Dois arquivos versionados descrevem o **mesmo** bucket de formas incompatíveis,
e `gcloud storage buckets update --cors-file` **substitui** a configuração
inteira — quem rodou por último venceu:

| Arquivo | Origem permitida |
|---|---|
| `VISA/docs/cors-storage.json` | `https://garrado.github.io` (GET, HEAD) |
| `RMPF/cors.json` | `https://visaanapolis.github.io` (todos os métodos) |

O RMPF é servido de `https://visaanapolis.github.io/RMPF/`
(`js/firebase-config.js:403`). Conferir antes de testar:

```bash
gcloud storage buckets describe gs://visam-3a30b.firebasestorage.app \
  --format="json(cors_config)"
```

Se `visaanapolis.github.io` não estiver lá, o fetch do Storage falha por CORS e
cai no fallback do GitHub (funciona, mas gasta cota do PAT). A correção é somar
**as duas origens** em `cors.json` e reaplicar — nunca substituir uma pela
outra, sob pena de quebrar a leitura de `his`/`reg` no VISA.

Mesmo problema em `storage.rules`: o do VISA libera `data/**` para autenticado;
o do RMPF nega tudo fora de `anexos/**`. O aplicado é necessariamente o do VISA
(senão o `cvs.html` estaria quebrado). Alinhar `RMPF/storage.rules` ao conteúdo
real do bucket, para que ninguém o aplique e derrube os dois apps.

## Verificação

1. **Sem regressão de pontuação** — importação em modo simulação
   (`parametrizacao.html`) numa competência aberta: `criados/atualizados/
   ignorados` têm de bater com a rodada anterior. Campo informativo não pode
   mudar nenhum contador.
2. **Homologado não reabre** — num lançamento `aceito`, a rodada grava
   `ndoc`/`os_detalhe` e o status continua `aceito`, sem `reaberto_*`. É o
   risco número um da mudança.
3. **Recusado não é tocado** — `recusa_alterado_diff` não pode passar a apontar
   os campos novos (ficam fora de `VISA_CAMPOS_ORIGEM`).
4. **Modal, caminho feliz** — clicar no nº do Documento de uma vistoria recente
   em `meus-lancamentos.html` e comparar com o mesmo documento em `cvs.html` do
   VISA (que lê o mesmo `his/<ndoc>.json`).
5. **Modal, dados da OS** — um lançamento de cada modalidade (Requerimento, De
   Ofício, Denúncia, Protocolo), conferido contra o CSV correspondente.
6. **Degradação** — bloquear `firebasestorage.googleapis.com` no DevTools e
   confirmar o fallback pelo GitHub; depois bloquear os dois e confirmar a
   mensagem de falha, **distinta** de "documento sem conteúdo digitado".
7. **Lançamento antigo** — competência fechada antes do backfill: coluna
   Documento continua texto puro, sem link quebrado.
8. **Custo** — após 2–3 dias, a curva diária de leituras do Firestore não pode
   mudar de patamar (previsão: delta zero).
