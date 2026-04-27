import { useState, useMemo, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// TABELA OFICIAL DE PONTUAÇÃO — Decreto LC 548/2023
// ═══════════════════════════════════════════════════════
const TABELA_PONTUACAO = [
  { item: 1,  descricao: "Vistoria ou atendimento a denúncia por estabelecimento",                                                                                         complexidade: "Alta",  pontos: 48 },
  { item: 2,  descricao: "Vistoria ou atendimento a denúncia por estabelecimento",                                                                                         complexidade: "Média", pontos: 12 },
  { item: 3,  descricao: "Vistoria ou atendimento a denúncia por estabelecimento",                                                                                         complexidade: "Baixa", pontos: 6  },
  { item: 4,  descricao: "Análise de projeto arquitetônico por estabelecimento",                                                                                            complexidade: "Alta",  pontos: 24 },
  { item: 5,  descricao: "Análise de projeto arquitetônico por estabelecimento",                                                                                            complexidade: "Média", pontos: 12 },
  { item: 6,  descricao: "Plantão fiscal (não cumulativo com pontuação de vistorias realizadas)",                                                                           complexidade: "—",     pontos: 48 },
  { item: 7,  descricao: "Coleta de amostra para análise em laboratório oficial por coleta",                                                                                complexidade: "—",     pontos: 12 },
  { item: 8,  descricao: "Manifestação do servidor atuante por peça",                                                                                                      complexidade: "—",     pontos: 12 },
  { item: 9,  descricao: "Participação, preparação e/ou apresentação de cursos, palestras, encontros e eventos similares de interesse da VISA e autorizados pela chefia",  complexidade: "—",     pontos: 24 },
  { item: 10, descricao: "Elaboração de relatório técnico de inspeção por estabelecimento (não cumulativo com pontuação de vistoria)",                                      complexidade: "Alta",  pontos: 48 },
  { item: 11, descricao: "Elaboração de relatório técnico de inspeção por estabelecimento",                                                                                 complexidade: "Média", pontos: 12 },
  { item: 12, descricao: "Elaboração de relatório técnico de inspeção por estabelecimento",                                                                                 complexidade: "Baixa", pontos: 6  },
  { item: 13, descricao: "Elaboração de relatório técnico harmonizado conforme diretrizes internas e/ou pactuações do SNVS por estabelecimento",                           complexidade: "Alta",  pontos: 48 },
  { item: 14, descricao: "Serviços técnicos no âmbito da VISA, requisitados pela chefia por dia de serviço",                                                               complexidade: "—",     pontos: 48 },
  { item: 15, descricao: "Operações fiscais não previstas e/ou situações extraordinárias (após comprovação técnica e autorização da chefia, não cumulativo com vistoria)", complexidade: "—",     pontos: 48 },
];

// Tipos de atividade para o dropdown de lançamento manual
const TIPOS_ATIVIDADE = [
  { id: 1,  codigo: "VIS", nome: "Vistoria ou atendimento a denúncia",          itensPontuacao: [1, 2, 3]    },
  { id: 2,  codigo: "ARQ", nome: "Análise de projeto arquitetônico",             itensPontuacao: [4, 5]       },
  { id: 3,  codigo: "PLT", nome: "Plantão fiscal",                               itensPontuacao: [6]          },
  { id: 4,  codigo: "COL", nome: "Coleta de amostra para laboratório",           itensPontuacao: [7]          },
  { id: 5,  codigo: "MAN", nome: "Manifestação do servidor atuante",             itensPontuacao: [8]          },
  { id: 6,  codigo: "CUR", nome: "Curso, palestra, evento ou encontro VISA",    itensPontuacao: [9]          },
  { id: 7,  codigo: "REL", nome: "Elaboração de relatório técnico de inspeção", itensPontuacao: [10, 11, 12] },
  { id: 8,  codigo: "RLH", nome: "Relatório técnico harmonizado (SNVS)",        itensPontuacao: [13]         },
  { id: 9,  codigo: "SRV", nome: "Serviços técnicos requisitados pela chefia",  itensPontuacao: [14]         },
  { id: 10, codigo: "OPF", nome: "Operações fiscais não previstas / extraordinárias", itensPontuacao: [15]  },
];

// ═══════════════════════════════════════════════════════
// PERFIS DO SISTEMA
//   "fiscal"        → Fiscal Sanitário
//   "administrativo"→ Administrativo (antes: supervisor)
//   "supervisor"    → Supervisor / Gerência (antes: gerencia)
// ═══════════════════════════════════════════════════════
const USUARIOS = [
  // ── USUÁRIO DE TESTE ────────────────────────────────
  { id: 0,  nome: "USUÁRIO TESTE",                            email: "teste@visa.go.gov.br",              perfil: "fiscal",          ativo: true, teste: true },

  // ── FISCAIS ─────────────────────────────────────────
  { id: 1,  nome: "ACADIA DE SOUZA VIEIRA SILVA",            email: "acadiaasocial@gmail.com",           perfil: "fiscal",          ativo: true  },
  { id: 2,  nome: "ADRIANA CRHISTINA DE REZENDE CARNEIRO",   email: "adrianarezendevisa@gmail.com",      perfil: "fiscal",          ativo: true  },
  { id: 3,  nome: "ADRIANE PEREIRA GUIMARÃES",               email: "adrianepereira@anapolis.go.gov.br", perfil: "fiscal",          ativo: true  },
  { id: 4,  nome: "ALINE CASTRO DAMASIO",                    email: "lindaenila@gmail.com",              perfil: "fiscal",          ativo: true  },
  { id: 5,  nome: "ANA PAULA RODRIGUES CORRÊA GUIMARÃES",    email: "anapaula.rcg@gmail.com",            perfil: "fiscal",          ativo: true  },
  { id: 6,  nome: "ANGELA RIBEIRO NEVES",                    email: "angelavet2@gmail.com",              perfil: "fiscal",          ativo: true  },
  { id: 7,  nome: "ARIANNE FERREIRA VIEIRA",                 email: "ariannefvieira@hotmail.com",        perfil: "fiscal",          ativo: true  },
  { id: 8,  nome: "CLÓVIS RAFAEL BORGES FERREIRA",           email: "crbferreira81@gmail.com",           perfil: "fiscal",          ativo: true  },
  { id: 9,  nome: "DANIELA DE ALMEIDA CASTRO",               email: "dani.visaanapolis@gmail.com",       perfil: "fiscal",          ativo: true  },
  { id: 10, nome: "EDSON ARANTES FARIA FILHO",               email: "edsonarantes@anapolis.go.gov.br",   perfil: "fiscal",          ativo: true  },
  { id: 11, nome: "EDUARDO LUCAS MAGALHÃES CASTRO",          email: "farm.castro78@gmail.com",           perfil: "fiscal",          ativo: true  },
  { id: 12, nome: "FABÍOLA PEDROSA PEIXOTO MARQUES",         email: "fabiolappmarques@gmail.com",        perfil: "fiscal",          ativo: true  },
  { id: 13, nome: "GERALDO EDSON ROSA",                      email: "geraldoedsonrosa@gmail.com",        perfil: "fiscal",          ativo: true  },
  { id: 14, nome: "GLEICIANE MARIA JOSÉ DA SILVA",           email: "gleicimaryjs@gmail.com",            perfil: "fiscal",          ativo: true  },
  { id: 15, nome: "GÚBIO DIAS PEREIRA",                      email: "gubio@anapolis.go.gov.br",          perfil: "fiscal",          ativo: true  },
  { id: 16, nome: "JOSE LUIZ RIBEIRO",                       email: "joseluizribeiro22@gmail.com",       perfil: "fiscal",          ativo: true  },
  { id: 17, nome: "JOÃO BATISTA LUCAS DA SILVA REIS",        email: "jotadaguas@gmail.com",              perfil: "fiscal",          ativo: true  },
  { id: 18, nome: "JULIANA FERREIRA VITURINO",               email: "julianafviturino@gmail.com",        perfil: "fiscal",          ativo: true  },
  { id: 19, nome: "JULIANA KÊNIA MARTINS DA SILVA",          email: "profajulianakenia@gmail.com",       perfil: "fiscal",          ativo: true  },
  { id: 20, nome: "JULIO CÉSAR TELES SPINDOLA",              email: "juliocteles@anapolis.go.gov.br",    perfil: "fiscal",          ativo: true  },
  { id: 21, nome: "KAMILLA CHRYSTINE ROLIM D. SANTOS GARCÊS",email: "kamillarolim@gmail.com",            perfil: "fiscal",          ativo: true  },
  { id: 22, nome: "LIDIANE SIMÕES",                          email: "lidianesimoes@anapolis.go.gov.br",  perfil: "fiscal",          ativo: true  },
  { id: 23, nome: "LIVIA BRITO",                             email: "liviabr.visa@gmail.com",            perfil: "fiscal",          ativo: true  },
  { id: 24, nome: "LUCIANA CONSOLAÇÃO DOS SANTOS",           email: "lucianacsantos.lc@gmail.com",       perfil: "fiscal",          ativo: true  },
  { id: 25, nome: "LUCIANA SANTANA DA ROCHA",                email: "santanaluciana097@gmail.com",       perfil: "fiscal",          ativo: true  },
  { id: 26, nome: "LUCIENE DE SOUZA BARBOSA GOMES SILVA",    email: "lulucieneepais@gmail.com",          perfil: "fiscal",          ativo: true  },
  { id: 27, nome: "MARCIO HENRIQUE GOMES RODOVALHO",         email: "marciorodovalho@anapolis.go.gov.br",perfil: "fiscal",          ativo: true  },
  { id: 28, nome: "MARIA EDWIGES PINHEIRO DE SOUZA CHAVES",  email: "mariaedwiges@anapolis.go.gov.br",   perfil: "fiscal",          ativo: true  },
  { id: 29, nome: "MARINA PERILLO NAVARRETE LAVERS",         email: "marinaperillo@hotmail.com",         perfil: "fiscal",          ativo: true  },
  { id: 30, nome: "PATRÍCIA CORDEIRO DE MORAES E SOUZA",     email: "patycdmes@gmail.com",               perfil: "fiscal",          ativo: true  },
  { id: 31, nome: "PEDRO HENRIQUE AIRES RIBEIRO",            email: "981217644pedro@gmail.com",          perfil: "fiscal",          ativo: true  },
  { id: 32, nome: "RODRIGO ALESSANDRO TÔGO SANTOS",          email: "santosrat@gmail.com",               perfil: "fiscal",          ativo: true  },
  { id: 33, nome: "RÚBIA MARA DE FREITAS",                   email: "rubiamarabel@gmail.com",            perfil: "fiscal",          ativo: true  },
  { id: 34, nome: "SILVIA MARQUES NAVES DA MOTA SOUZA",      email: "silviamarques@anapolis.go.gov.br",  perfil: "fiscal",          ativo: true  },
  { id: 35, nome: "SIMONE DUARTE GROSSI",                    email: "simonegrossi@anapolis.go.gov.br",   perfil: "fiscal",          ativo: true  },
  { id: 36, nome: "TATHIANE PESSOA DE SOUZA",                email: "tathnut@hotmail.com",               perfil: "fiscal",          ativo: true  },
  { id: 37, nome: "VANESSA SANTANA",                         email: "wanessa05@gmail.com",               perfil: "fiscal",          ativo: true  },
  { id: 38, nome: "VIVIANE MANOEL DA SILVA BORGES",          email: "vmsbgyn@gmail.com",                 perfil: "fiscal",          ativo: true  },
  { id: 39, nome: "VIVIANE MIYADA",                          email: "vivianemiyada@gmail.com",           perfil: "fiscal",          ativo: true  },
  { id: 40, nome: "WANESSA DE BRITO JORGE",                  email: "wanessab412@gmail.com",             perfil: "fiscal",          ativo: true  },

  // ── ADMINISTRATIVO (antes: supervisor) ──────────────
  // Removidos: Flaviane, Roberto, Thaysa, Vinicius
  { id: 41, nome: "CLÁUDIO RODRIGO AGUIAR DE SOUZA",         email: "prof.claudioaguiar01@gmail.com",    perfil: "administrativo",  ativo: true  },
  { id: 43, nome: "LAURA ELEUZA MENDES DA MAIA",             email: "lauraeleuza@gmail.com",             perfil: "administrativo",  ativo: true  },
  { id: 44, nome: "MAELKA BELASC RODRIGUES PIMENTA",         email: "maelkaanapolis04081415@gmail.com",  perfil: "administrativo",  ativo: true  },

  // ── SUPERVISOR (antes: gerencia) ────────────────────
  // Removido: Thiago Gomes Gobo
  { id: 48, nome: "CLÁUDIO NASCIMENTO SILVA",                email: "mens.agitat.molem.cns@gmail.com",   perfil: "supervisor",      ativo: true  },
  { id: 49, nome: "DANIEL SOARES BARBOSA",                   email: "danielbarbosa@anapolis.go.gov.br",  perfil: "supervisor",      ativo: true  },
  { id: 51, nome: "CÉSIO MALAQUIAS",                         email: "visa@anapolis.go.gov.br",           perfil: "supervisor",      ativo: true  },
];

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const PARAMS = { teto_pv: 1000, base_formula: 250, fator_formula: 0.2666, teto_final: 200 };

function calcular(ativCVS, ativManuais, pnsExtras = 0, params = PARAMS) {
  const pp = [
    ...ativCVS.map(a => Number(a.pontos) || 0),
    ...ativManuais.filter(a => a.status === "aceito").map(a => Number(a.pontos_homologado ?? a.pontos) || 0),
  ].reduce((s, v) => s + v, 0);
  const pn = pnsExtras;
  const pv = Math.max(0, pp - pn);
  const pvLim = Math.min(pv, params.teto_pv);
  const bruto = (pvLim - params.base_formula) * params.fator_formula;
  const apuracao = Math.max(0, Math.ceil(Math.min(bruto, params.teto_final)));
  return { pp, pn, pv, pvLim, apuracao,
    atingiuTetoPV: pv > params.teto_pv,
    atingiuTetoFinal: bruto > params.teto_final };
}

function fmtData(d) { return d ? new Date(d + "T12:00").toLocaleDateString("pt-BR") : "—"; }
function nomeCurto(nome) { const p = nome.split(" "); return p.length > 1 ? `${p[0]} ${p[p.length-1]}` : p[0]; }

// ═══════════════════════════════════════════
// DADOS MOCK INICIAIS
// ═══════════════════════════════════════════
const CVS_MOCK = [
  { id:"cvs1", numero_os:"OS-2026-001234", contribuinte:"Farmácia Saúde Vida Ltda",    tipo:"Vistoria ou atendimento a denúncia", complexidade:"Alta",  pontos:48, data:"2026-04-03", fiscal_id:1 },
  { id:"cvs2", numero_os:"OS-2026-001235", contribuinte:"Restaurante Bom Sabor ME",     tipo:"Vistoria ou atendimento a denúncia", complexidade:"Média", pontos:12, data:"2026-04-05", fiscal_id:1 },
  { id:"cvs3", numero_os:"OS-2026-001240", contribuinte:"Clínica Santa Maria SS",       tipo:"Vistoria ou atendimento a denúncia", complexidade:"Alta",  pontos:48, data:"2026-04-08", fiscal_id:2 },
];

const MANUAIS_INICIAIS = [
  { id:"m1", numero_controle:"CUR-2026-04-000001", fiscal_id:1, tipo_nome:"Curso, palestra, evento ou encontro VISA",  descricao:"Curso Boas Práticas ANVISA — EAD 8h", data:"2026-04-07", pontos:24, pontos_homologado:24, complexidade:"—", status:"aceito",   mes:4, ano:2026 },
  { id:"m2", numero_controle:"MAN-2026-04-000002", fiscal_id:1, tipo_nome:"Manifestação do servidor atuante",           descricao:"Parecer técnico processo 1234/2026",   data:"2026-04-10", pontos:12, pontos_homologado:null, complexidade:"—", status:"enviado",  mes:4, ano:2026 },
  { id:"m3", numero_controle:"PLT-2026-04-000003", fiscal_id:2, tipo_nome:"Plantão fiscal",                             descricao:"Plantão sobreaviso — feriadão",         data:"2026-04-21", pontos:48, pontos_homologado:null, complexidade:"—", status:"enviado",  mes:4, ano:2026 },
];

const OCORRENCIAS_INICIAIS = [
  { id:"oc1", fiscal_id:1, mes:4, ano:2026, tipo:"ferias",      descricao:"Férias regulamentares",             status:"pendente", mes_ref:4, ano_ref:2026 },
];

// ═══════════════════════════════════════════
// CORES / ESTILOS
// ═══════════════════════════════════════════
const C = {
  verde:"#1a6b3c", verdeC:"#2d9e5f", verdeP:"#edfaf3",
  azul:"#1b4e8b",  azulP:"#e6eef8",
  amar:"#b45309",  amarP:"#fffbeb",
  verm:"#b91c1c",  vermP:"#fff1f2",
  cinzaB:"#f4f5f7",cinzaL:"#e2e5e9",cinzaT:"#5a6070",
  preto:"#12151a", branco:"#fff",
};

const s = {
  app:{ fontFamily:"'IBM Plex Sans',system-ui,sans-serif", background:C.cinzaB, minHeight:"100vh", color:C.preto },
  hdr:{ background:C.verde, color:C.branco, padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56, boxShadow:"0 1px 6px rgba(0,0,0,.2)" },
  nav:{ background:C.branco, borderBottom:`1px solid ${C.cinzaL}`, padding:"0 24px", display:"flex", gap:2 },
  navB:(a)=>({ background:"none", border:"none", padding:"11px 14px", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:a?700:400, color:a?C.verde:C.cinzaT, borderBottom:a?`2px solid ${C.verde}`:"2px solid transparent" }),
  main:{ padding:"24px 24px 60px", maxWidth:1080, margin:"0 auto" },
  card:{ background:C.branco, border:`1px solid ${C.cinzaL}`, borderRadius:10, marginBottom:18 },
  cHdr:{ borderBottom:`1px solid ${C.cinzaL}`, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  cTit:{ fontWeight:700, fontSize:15 },
  cSub:{ fontSize:12, color:C.cinzaT, marginTop:2 },
  cBdy:{ padding:"18px 20px" },
  metG:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 },
  metC:(c)=>({ background:C.branco, border:`1px solid ${C.cinzaL}`, borderTop:`3px solid ${c}`, borderRadius:10, padding:"14px 16px" }),
  metL:{ fontSize:10, fontWeight:700, color:C.cinzaT, textTransform:"uppercase", letterSpacing:".06em", marginBottom:5 },
  metV:(c)=>({ fontSize:26, fontWeight:700, color:c }),
  metN:{ fontSize:11, color:C.cinzaT, marginTop:3 },
  btn:(v="primary")=>({
    background:v==="primary"?C.verde:v==="danger"?C.verm:v==="warn"?C.amar:v==="outline"?"transparent":C.cinzaB,
    color:v==="primary"||v==="danger"||v==="warn"?C.branco:v==="outline"?C.verde:C.cinzaT,
    border:v==="outline"?`1px solid ${C.verde}`:"none",
    padding:"7px 14px", borderRadius:7, cursor:"pointer", fontSize:13, fontWeight:600,
    fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:5,
  }),
  inp:{ border:`1px solid ${C.cinzaL}`, borderRadius:7, padding:"8px 11px", fontSize:13, fontFamily:"inherit", width:"100%", outline:"none", color:C.preto, background:C.branco, boxSizing:"border-box" },
  sel:{ border:`1px solid ${C.cinzaL}`, borderRadius:7, padding:"8px 11px", fontSize:13, fontFamily:"inherit", width:"100%", outline:"none", color:C.preto, background:C.branco },
  lbl:{ fontSize:12, fontWeight:600, color:C.cinzaT, display:"block", marginBottom:4 },
  fg:{ marginBottom:14 },
  ta:{ border:`1px solid ${C.cinzaL}`, borderRadius:7, padding:"8px 11px", fontSize:13, fontFamily:"inherit", width:"100%", outline:"none", color:C.preto, background:C.branco, resize:"vertical", boxSizing:"border-box" },
  th:{ textAlign:"left", padding:"8px 12px", borderBottom:`2px solid ${C.cinzaL}`, fontSize:11, fontWeight:700, color:C.cinzaT, background:C.cinzaB, whiteSpace:"nowrap" },
  td:{ padding:"8px 12px", borderBottom:`1px solid ${C.cinzaL}`, verticalAlign:"middle", fontSize:13 },
  badge:(t)=>{
    const m={aceito:{bg:C.verdeP,c:C.verde},enviado:{bg:C.amarP,c:C.amar},rascunho:{bg:"#f1f5f9",c:"#475569"},
      recusado:{bg:C.vermP,c:C.verm},fechado:{bg:"#e2e8f0",c:"#334155"},pendente:{bg:C.amarP,c:C.amar},cvs:{bg:C.azulP,c:C.azul},manual:{bg:C.verdeP,c:C.verde}};
    const x=m[t]||m.rascunho;
    return{display:"inline-block",background:x.bg,color:x.c,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,letterSpacing:".04em"};
  },
  alerta:(t)=>{
    const m={warn:{bg:C.amarP,b:"#fbbf24",c:"#7a4500"},info:{bg:C.azulP,b:"#60a5fa",c:"#1e3a5f"},danger:{bg:C.vermP,b:"#fca5a5",c:"#7f1d1d"},ok:{bg:C.verdeP,b:"#4ade80",c:"#14532d"}};
    const x=m[t]||m.info;
    return{background:x.bg,border:`1px solid ${x.b}`,color:x.c,borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:12};
  },
  loginW:{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(135deg,${C.verdeP} 0%,${C.azulP} 100%)` },
  loginC:{ background:C.branco, borderRadius:14, boxShadow:"0 4px 24px rgba(0,0,0,.1)", padding:"36px 32px", width:360, maxWidth:"95vw" },
  grid2:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 },
};

// ═══════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════
function Badge({t,lb}){ return <span style={s.badge(t)}>{lb||t.toUpperCase()}</span>; }
function Alerta({t,children}){ return <div style={s.alerta(t)}>{children}</div>; }

function MetCard({label,val,cor,nota}){
  return <div style={s.metC(cor)}><div style={s.metL}>{label}</div><div style={s.metV(cor)}>{val}</div>{nota&&<div style={s.metN}>{nota}</div>}</div>;
}

function Pgheader({titulo,sub,voltar,onVoltar,acoes}){
  return <div style={{marginBottom:20}}>
    {voltar&&<button style={{...s.btn("ghost"),color:C.cinzaT,padding:"4px 0",marginBottom:6,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12}} onClick={onVoltar}>← {voltar}</button>}
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
      <div><h1 style={{fontSize:20,fontWeight:700,margin:0}}>{titulo}</h1>{sub&&<p style={{color:C.cinzaT,fontSize:12,marginTop:3,margin:0}}>{sub}</p>}</div>
      {acoes&&<div style={{display:"flex",gap:8}}>{acoes}</div>}
    </div>
  </div>;
}

function CompSel({mes,ano,onM,onA}){
  return <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:18}}>
    <span style={{fontSize:13,fontWeight:600,color:C.cinzaT}}>Competência:</span>
    <select style={{...s.sel,width:150}} value={mes} onChange={e=>onM(Number(e.target.value))}>
      {MESES.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
    </select>
    <select style={{...s.sel,width:90}} value={ano} onChange={e=>onA(Number(e.target.value))}>
      {[2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
    </select>
  </div>;
}

// ═══════════════════════════════════════════
// SISTEMA DE SENHAS — localStorage
// Senha provisória padrão: visa@2026
// Armazena: { [userId]: { hash, provisoria } }
// ═══════════════════════════════════════════
const SENHA_PROVISORIA = "visa@2026";

function hashSenha(s){ let h=5381; for(let i=0;i<s.length;i++) h=((h<<5)+h)+s.charCodeAt(i); return String(h>>>0); }
function carregarSenhas(){ try{ return JSON.parse(localStorage.getItem("visa_senhas")||"{}"); }catch{ return {}; } }
function salvarSenha(uid, senha, provisoria=false){
  const db=carregarSenhas(); db[String(uid)]={ hash:hashSenha(senha), provisoria };
  localStorage.setItem("visa_senhas", JSON.stringify(db));
}
function verificarSenha(uid, senha){
  const db=carregarSenhas(); const reg=db[String(uid)];
  if(!reg) return hashSenha(senha)===hashSenha(SENHA_PROVISORIA)?{ok:true,provisoria:true}:{ok:false};
  return hashSenha(senha)===reg.hash?{ok:true,provisoria:reg.provisoria}:{ok:false};
}
function eProvisoria(uid){ const db=carregarSenhas(); const r=db[String(uid)]; return !r||r.provisoria===true; }

// ═══════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════
function Login({onLogin}){
  const [email,setEmail]=useState("");
  const [senha,setSenha]=useState("");
  const [erro,setErro]=useState("");
  const [mostrar,setMostrar]=useState(false);

  const entrar=()=>{
    setErro("");
    if(!email.trim()){setErro("Informe seu e-mail.");return;}
    if(!senha){setErro("Informe sua senha.");return;}
    const u=USUARIOS.find(x=>x.email.toLowerCase()===email.trim().toLowerCase()&&x.ativo);
    if(!u){setErro("E-mail não encontrado ou usuário inativo.");return;}
    const check=verificarSenha(u.id,senha);
    if(!check.ok){setErro("Senha incorreta. No primeiro acesso use: visa@2026");return;}
    onLogin(u,check.provisoria);
  };

  return <div style={s.loginW}>
    <div style={s.loginC}>
      <div style={{textAlign:"center",marginBottom:26}}>
        <div style={{width:56,height:56,background:C.verde,borderRadius:14,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:14,boxShadow:`0 4px 14px ${C.verde}55`}}>
          <span style={{color:C.branco,fontWeight:800,fontSize:18}}>VISA</span>
        </div>
        <h1 style={{fontSize:21,fontWeight:700,margin:"0 0 4px"}}>Produtividade Fiscal</h1>
        <p style={{color:C.cinzaT,fontSize:12,margin:0}}>Vigilância Sanitária de Anápolis / GO</p>
      </div>
      {erro&&<Alerta t="danger">⚠ {erro}</Alerta>}
      <div style={s.fg}>
        <label style={s.lbl}>E-mail institucional</label>
        <input type="email" style={s.inp} value={email} onChange={e=>{setEmail(e.target.value);setErro("");}}
          onKeyDown={e=>e.key==="Enter"&&entrar()} placeholder="seuemail@anapolis.go.gov.br" autoComplete="username"/>
      </div>
      <div style={s.fg}>
        <label style={s.lbl}>Senha</label>
        <div style={{position:"relative"}}>
          <input type={mostrar?"text":"password"} style={{...s.inp,paddingRight:44}} value={senha}
            onChange={e=>{setSenha(e.target.value);setErro("");}} onKeyDown={e=>e.key==="Enter"&&entrar()}
            placeholder="Digite sua senha" autoComplete="current-password"/>
          <button style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.cinzaT,fontSize:16,padding:2}}
            onClick={()=>setMostrar(v=>!v)} tabIndex={-1}>{mostrar?"🙈":"👁️"}</button>
        </div>
      </div>
      <button style={{...s.btn("primary"),width:"100%",justifyContent:"center",padding:"11px 0",fontSize:14,marginBottom:14}} onClick={entrar}>
        Entrar no Sistema
      </button>
      <div style={{background:C.cinzaB,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.cinzaT}}>
        🔑 <strong>Primeiro acesso?</strong> Use a senha provisória:<br/>
        <code style={{background:C.branco,padding:"1px 6px",borderRadius:4,fontFamily:"monospace",color:C.verde,fontSize:13}}>visa@2026</code>
        <span style={{marginLeft:6}}>— você será solicitado a criar sua própria senha.</span>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════
// TELA: TROCA OBRIGATÓRIA DE SENHA (1º acesso)
// ═══════════════════════════════════════════
function TrocaSenhaObrigatoria({usuario,onConcluir}){
  const [nova,setNova]=useState("");
  const [confirma,setConfirma]=useState("");
  const [mostrar,setMostrar]=useState(false);
  const [erro,setErro]=useState("");
  const [ok,setOk]=useState(false);

  const regras=[
    {label:"Mínimo 8 caracteres",       ok:nova.length>=8},
    {label:"Letra maiúscula (A-Z)",      ok:/[A-Z]/.test(nova)},
    {label:"Letra minúscula (a-z)",      ok:/[a-z]/.test(nova)},
    {label:"Número (0-9)",              ok:/[0-9]/.test(nova)},
    {label:"Caractere especial (!@#...)",ok:/[^A-Za-z0-9]/.test(nova)},
  ];
  const forte=regras.filter(r=>r.ok).length;
  const corB=forte<=2?"#ef4444":forte<=3?"#f59e0b":forte<=4?"#3b82f6":"#22c55e";

  const salvar=()=>{
    setErro("");
    if(nova===SENHA_PROVISORIA){setErro("A nova senha não pode ser igual à provisória.");return;}
    if(forte<4){setErro("Senha fraca. Atenda ao menos 4 dos 5 requisitos.");return;}
    if(nova!==confirma){setErro("As senhas não coincidem.");return;}
    salvarSenha(usuario.id,nova,false);
    setOk(true);
    setTimeout(()=>onConcluir(),1800);
  };

  if(ok) return <div style={s.loginW}>
    <div style={{...s.loginC,textAlign:"center",padding:"48px 32px"}}>
      <div style={{fontSize:52,marginBottom:16}}>✅</div>
      <h2 style={{fontSize:18,fontWeight:700,color:C.verde,marginBottom:8}}>Senha criada com sucesso!</h2>
      <p style={{color:C.cinzaT}}>Redirecionando para o sistema...</p>
    </div>
  </div>;

  return <div style={s.loginW}>
    <div style={{...s.loginC,width:420,maxWidth:"96vw"}}>
      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{fontSize:44,marginBottom:10}}>🔐</div>
        <h1 style={{fontSize:19,fontWeight:700,margin:"0 0 6px"}}>Crie sua senha pessoal</h1>
        <p style={{color:C.cinzaT,fontSize:12,margin:0}}>
          Olá, <strong>{nomeCurto(usuario.nome)}</strong>! Primeiro acesso detectado.<br/>
          Defina uma senha exclusiva para continuar.
        </p>
      </div>
      {erro&&<Alerta t="danger">{erro}</Alerta>}
      <div style={s.fg}>
        <label style={s.lbl}>Nova senha</label>
        <div style={{position:"relative"}}>
          <input type={mostrar?"text":"password"} style={{...s.inp,paddingRight:44}} value={nova}
            onChange={e=>setNova(e.target.value)} placeholder="Crie uma senha forte" autoComplete="new-password"/>
          <button style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:C.cinzaT}} onClick={()=>setMostrar(v=>!v)} tabIndex={-1}>{mostrar?"🙈":"👁️"}</button>
        </div>
        {nova&&<>
          <div style={{height:5,background:C.cinzaL,borderRadius:4,marginTop:8,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(forte/5)*100}%`,background:corB,borderRadius:4,transition:"width .3s,background .3s"}}/>
          </div>
          <div style={{fontSize:11,color:corB,marginTop:4,fontWeight:600}}>{forte<=2?"Fraca":forte<=3?"Razoável":forte<=4?"Boa":"Forte"}</div>
        </>}
      </div>
      {nova&&<div style={{background:C.cinzaB,borderRadius:8,padding:"10px 14px",marginBottom:14}}>
        {regras.map((r,i)=><div key={i} style={{fontSize:12,color:r.ok?C.verde:C.cinzaT,padding:"2px 0",display:"flex",alignItems:"center",gap:6}}>
          <span style={{minWidth:14}}>{r.ok?"✓":"○"}</span>{r.label}
        </div>)}
      </div>}
      <div style={s.fg}>
        <label style={s.lbl}>Confirmar senha</label>
        <input type={mostrar?"text":"password"}
          style={{...s.inp,...(confirma&&nova!==confirma?{borderColor:C.verm}:confirma&&nova===confirma?{borderColor:C.verde}:{})}}
          value={confirma} onChange={e=>setConfirma(e.target.value)} placeholder="Repita a senha" autoComplete="new-password"/>
        {confirma&&nova===confirma&&<p style={{color:C.verde,fontSize:11,marginTop:3}}>✓ Senhas coincidem</p>}
        {confirma&&nova!==confirma&&<p style={{color:C.verm,fontSize:11,marginTop:3}}>As senhas não coincidem</p>}
      </div>
      <button style={{...s.btn("primary"),width:"100%",justifyContent:"center",padding:"11px 0",fontSize:14}} onClick={salvar}>
        🔒 Salvar minha senha e entrar
      </button>
    </div>
  </div>;
}

// ═══════════════════════════════════════════
// TELA: ALTERAR SENHA (voluntária — via menu)
// ═══════════════════════════════════════════
function AlterarSenha({usuario,onVoltar}){
  const [atual,setAtual]=useState("");
  const [nova,setNova]=useState("");
  const [confirma,setConfirma]=useState("");
  const [mostrar,setMostrar]=useState(false);
  const [erro,setErro]=useState("");
  const [ok,setOk]=useState(false);

  const regras=[
    {label:"Mínimo 8 caracteres",       ok:nova.length>=8},
    {label:"Letra maiúscula (A-Z)",      ok:/[A-Z]/.test(nova)},
    {label:"Letra minúscula (a-z)",      ok:/[a-z]/.test(nova)},
    {label:"Número (0-9)",              ok:/[0-9]/.test(nova)},
    {label:"Caractere especial (!@#...)",ok:/[^A-Za-z0-9]/.test(nova)},
  ];
  const forte=regras.filter(r=>r.ok).length;
  const corB=forte<=2?"#ef4444":forte<=3?"#f59e0b":forte<=4?"#3b82f6":"#22c55e";

  const salvar=()=>{
    setErro("");
    const check=verificarSenha(usuario.id,atual);
    if(!check.ok){setErro("Senha atual incorreta.");return;}
    if(nova===SENHA_PROVISORIA||nova===atual){setErro("A nova senha deve ser diferente da anterior.");return;}
    if(forte<4){setErro("Senha fraca. Atenda ao menos 4 dos 5 requisitos.");return;}
    if(nova!==confirma){setErro("As senhas não coincidem.");return;}
    salvarSenha(usuario.id,nova,false);
    setOk(true);
  };

  if(ok) return <div>
    <Pgheader titulo="Alterar Senha" onVoltar={onVoltar} voltar="Voltar ao Dashboard"/>
    <div style={{...s.card,...s.cBdy,textAlign:"center",padding:"40px 30px"}}>
      <div style={{fontSize:48,marginBottom:14}}>✅</div>
      <h2 style={{fontSize:17,fontWeight:700,color:C.verde,marginBottom:8}}>Senha alterada com sucesso!</h2>
      <p style={{color:C.cinzaT,marginBottom:20}}>Use sua nova senha no próximo acesso.</p>
      <button style={s.btn("primary")} onClick={onVoltar}>Voltar ao Dashboard</button>
    </div>
  </div>;

  return <div>
    <Pgheader titulo="Alterar Senha" sub="Atualize sua senha de acesso" onVoltar={onVoltar} voltar="Voltar ao Dashboard"/>
    <div style={{...s.card,...s.cBdy,maxWidth:440}}>
      {erro&&<Alerta t="danger">{erro}</Alerta>}
      <div style={s.fg}>
        <label style={s.lbl}>Senha atual</label>
        <div style={{position:"relative"}}>
          <input type={mostrar?"text":"password"} style={{...s.inp,paddingRight:44}} value={atual}
            onChange={e=>setAtual(e.target.value)} placeholder="Sua senha atual" autoComplete="current-password"/>
          <button style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:C.cinzaT}} onClick={()=>setMostrar(v=>!v)} tabIndex={-1}>{mostrar?"🙈":"👁️"}</button>
        </div>
      </div>
      <div style={s.fg}>
        <label style={s.lbl}>Nova senha</label>
        <input type={mostrar?"text":"password"} style={s.inp} value={nova} onChange={e=>setNova(e.target.value)} placeholder="Nova senha" autoComplete="new-password"/>
        {nova&&<>
          <div style={{height:5,background:C.cinzaL,borderRadius:4,marginTop:8,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(forte/5)*100}%`,background:corB,borderRadius:4,transition:"width .3s"}}/>
          </div>
          <div style={{fontSize:11,color:corB,marginTop:4,fontWeight:600}}>{forte<=2?"Fraca":forte<=3?"Razoável":forte<=4?"Boa":"Forte"}</div>
        </>}
      </div>
      {nova&&<div style={{background:C.cinzaB,borderRadius:8,padding:"10px 14px",marginBottom:14}}>
        {regras.map((r,i)=><div key={i} style={{fontSize:12,color:r.ok?C.verde:C.cinzaT,padding:"2px 0",display:"flex",alignItems:"center",gap:6}}>
          <span style={{minWidth:14}}>{r.ok?"✓":"○"}</span>{r.label}
        </div>)}
      </div>}
      <div style={s.fg}>
        <label style={s.lbl}>Confirmar nova senha</label>
        <input type={mostrar?"text":"password"}
          style={{...s.inp,...(confirma&&nova!==confirma?{borderColor:C.verm}:confirma&&nova===confirma?{borderColor:C.verde}:{})}}
          value={confirma} onChange={e=>setConfirma(e.target.value)} placeholder="Repita a nova senha" autoComplete="new-password"/>
        {confirma&&nova===confirma&&<p style={{color:C.verde,fontSize:11,marginTop:3}}>✓ Senhas coincidem</p>}
      </div>
      <button style={{...s.btn("primary"),width:"100%",justifyContent:"center",padding:"10px 0"}} onClick={salvar}>
        🔒 Salvar nova senha
      </button>
    </div>
  </div>;
}

// ═══════════════════════════════════════════
// TABELA DE PONTUAÇÃO (referência)
// ═══════════════════════════════════════════
function TabelaPontuacao(){
  return <div style={s.card}>
    <div style={s.cHdr}><div><div style={s.cTit}>📋 Tabela Oficial de Pontuação</div><div style={s.cSub}>LC 548/2023 — referência para lançamento de atividades</div></div></div>
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr>
          <th style={s.th}>Item</th><th style={s.th}>Descrição da Atividade</th>
          <th style={s.th}>Complexidade</th><th style={{...s.th,textAlign:"right"}}>Pontos</th>
        </tr></thead>
        <tbody>
          {TABELA_PONTUACAO.map(r=>(
            <tr key={r.item} style={{background:r.item%2===0?C.cinzaB:C.branco}}>
              <td style={{...s.td,fontWeight:700,textAlign:"center",width:40}}>{r.item}</td>
              <td style={s.td}>{r.descricao}</td>
              <td style={s.td}><Badge t={r.complexidade==="Alta"?"enviado":r.complexidade==="Média"?"manual":r.complexidade==="Baixa"?"fechado":"cvs"} lb={r.complexidade}/></td>
              <td style={{...s.td,fontWeight:700,textAlign:"right",color:C.verde}}>{r.pontos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>;
}

// ═══════════════════════════════════════════
// DASHBOARD FISCAL
// ═══════════════════════════════════════════
function DashFiscal({usuario,onPag,manuais,ocorrencias}){
  const [mes,setMes]=useState(new Date().getMonth()+1);
  const [ano,setAno]=useState(2026);
  const cvs=CVS_MOCK.filter(a=>a.fiscal_id===usuario.id&&a.data.startsWith(`${ano}-${String(mes).padStart(2,"0")}`));
  const man=manuais.filter(a=>a.fiscal_id===usuario.id&&a.mes===mes&&a.ano===ano);
  const oc=ocorrencias.filter(a=>a.fiscal_id===usuario.id&&a.mes_ref===mes&&a.ano_ref===ano);
  const res=calcular(cvs,man);
  const pendentes=man.filter(a=>a.status==="enviado").length;
  const rascunhos=man.filter(a=>a.status==="rascunho");

  return <div>
    <Pgheader titulo={`Olá, ${nomeCurto(usuario.nome)}!`} sub={`${usuario.email} · Fiscal Sanitário`}
      acoes={<button style={s.btn("primary")} onClick={()=>onPag("lancamento")}>+ Nova Atividade</button>}/>
    <CompSel mes={mes} ano={ano} onM={setMes} onA={setAno}/>
    {res.atingiuTetoPV&&<Alerta t="warn">⚠ Teto de PV (1.000) atingido. Atividades adicionais não aumentarão a apuração.</Alerta>}
    {pendentes>0&&<Alerta t="info">📤 {pendentes} lançamento(s) aguardando análise da supervisão.</Alerta>}
    {rascunhos.length>0&&<Alerta t="warn">📝 Você tem {rascunhos.length} rascunho(s) salvos. <button style={{...s.btn("outline"),padding:"2px 8px",fontSize:11}} onClick={()=>onPag("meuslancamentos")}>Ver e enviar</button></Alerta>}

    <div style={s.metG}>
      <MetCard label="PP — Produtividade Positiva" val={res.pp.toFixed(0)} cor={C.verde} nota="CVS + Manuais aceitas"/>
      <MetCard label="PN — Pontuação Negativa"     val={res.pn.toFixed(0)} cor={C.verm}  nota="Glosas e penalizações"/>
      <MetCard label="PV — Produtividade Válida"   val={res.pv.toFixed(0)} cor={C.azul}  nota="PP − PN"/>
      <MetCard label="Apuração Final"              val={res.apuracao}      cor="#7c3aed" nota={res.atingiuTetoFinal?"Teto 200 atingido":"(PV−250)×0,2666"}/>
    </div>

    <div style={s.card}>
      <div style={s.cHdr}>
        <div><div style={s.cTit}>Atividades — {MESES[mes-1]}/{ano}</div><div style={s.cSub}>{cvs.length} do CVS · {man.length} manuais</div></div>
        <button style={s.btn("outline")} onClick={()=>onPag("conferencia")}>Ver conferência</button>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={s.th}>Data</th><th style={s.th}>Nº/Controle</th><th style={s.th}>Descrição</th><th style={s.th}>Tipo</th><th style={s.th}>Complexidade</th><th style={{...s.th,textAlign:"right"}}>Pts</th><th style={s.th}>Origem</th><th style={s.th}>Status</th></tr></thead>
          <tbody>
            {cvs.map(a=><tr key={a.id} style={{background:C.azulP+"44"}}>
              <td style={s.td}>{fmtData(a.data)}</td><td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{a.numero_os}</td>
              <td style={s.td}>{a.contribuinte}</td><td style={s.td}>{a.tipo}</td><td style={s.td}>{a.complexidade}</td>
              <td style={{...s.td,textAlign:"right",fontWeight:700}}>{a.pontos}</td>
              <td style={s.td}><Badge t="cvs" lb="CVS"/></td><td style={s.td}><Badge t="aceito" lb="Importado"/></td>
            </tr>)}
            {man.map(a=><tr key={a.id}>
              <td style={s.td}>{fmtData(a.data)}</td><td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{a.numero_controle}</td>
              <td style={s.td}>{a.descricao}</td><td style={s.td}>{a.tipo_nome}</td><td style={s.td}>{a.complexidade}</td>
              <td style={{...s.td,textAlign:"right",fontWeight:700}}>{a.pontos_homologado??a.pontos}</td>
              <td style={s.td}><Badge t="manual" lb="Manual"/></td><td style={s.td}><Badge t={a.status}/></td>
            </tr>)}
            {cvs.length===0&&man.length===0&&<tr><td colSpan={8} style={{...s.td,textAlign:"center",color:C.cinzaT,padding:28}}>Nenhuma atividade nesta competência.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>

    {/* Ocorrências do fiscal */}
    <div style={s.card}>
      <div style={s.cHdr}>
        <div><div style={s.cTit}>Ocorrências e Afastamentos</div><div style={s.cSub}>Lançadas por você — analisadas pela supervisão</div></div>
        <button style={s.btn("primary")} onClick={()=>onPag("ocorrencias")}>+ Lançar ocorrência</button>
      </div>
      <div style={s.cBdy}>
        {oc.length===0?<p style={{color:C.cinzaT,margin:0,fontSize:13}}>Nenhuma ocorrência lançada nesta competência.</p>:
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><th style={s.th}>Tipo</th><th style={s.th}>Descrição</th><th style={s.th}>Status</th></tr></thead>
            <tbody>{oc.map(o=><tr key={o.id}><td style={s.td}>{o.tipo}</td><td style={s.td}>{o.descricao}</td><td style={s.td}><Badge t={o.status}/></td></tr>)}</tbody>
          </table>
        }
      </div>
    </div>
    <TabelaPontuacao/>
  </div>;
}

// ═══════════════════════════════════════════
// MEUS LANÇAMENTOS (rascunhos + enviados do fiscal)
// ═══════════════════════════════════════════
function MeusLancamentos({usuario,manuais,onVoltar,onAtualizar,onExcluir}){
  const [mes,setMes]=useState(new Date().getMonth()+1);
  const [ano,setAno]=useState(2026);
  const man=manuais.filter(a=>a.fiscal_id===usuario.id&&a.mes===mes&&a.ano===ano);

  const enviar=(id)=>{ if(confirm("Enviar para a supervisão?")) onAtualizar(id,"enviado"); };
  const excluir=(id)=>{ if(confirm("Excluir este rascunho?")) onExcluir(id); };

  return <div>
    <Pgheader titulo="Meus Lançamentos" sub="Gerencie rascunhos e acompanhe status" onVoltar={onVoltar} voltar="Voltar ao Dashboard"/>
    <CompSel mes={mes} ano={ano} onM={setMes} onA={setAno}/>
    <div style={s.card}>
      <div style={s.cBdy}>
        {man.length===0?<p style={{color:C.cinzaT,textAlign:"center",padding:20}}>Nenhum lançamento nesta competência.</p>:
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><th style={s.th}>Controle</th><th style={s.th}>Data</th><th style={s.th}>Tipo</th><th style={s.th}>Descrição</th><th style={{...s.th,textAlign:"right"}}>Pts solicitados</th><th style={{...s.th,textAlign:"right"}}>Pts homologados</th><th style={s.th}>Status</th><th style={s.th}>Ações</th></tr></thead>
            <tbody>{man.map(a=>(
              <tr key={a.id}>
                <td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{a.numero_controle}</td>
                <td style={s.td}>{fmtData(a.data)}</td>
                <td style={s.td}>{a.tipo_nome}</td>
                <td style={s.td}>{a.descricao}</td>
                <td style={{...s.td,textAlign:"right",fontWeight:700}}>{a.pontos}</td>
                <td style={{...s.td,textAlign:"right",fontWeight:700,color:a.pontos_homologado!=null?C.verde:C.cinzaT}}>
                  {a.pontos_homologado!=null?a.pontos_homologado:"—"}
                </td>
                <td style={s.td}><Badge t={a.status}/></td>
                <td style={s.td}>
                  <div style={{display:"flex",gap:6}}>
                    {a.status==="rascunho"&&<>
                      <button style={{...s.btn("primary"),padding:"4px 10px",fontSize:11}} onClick={()=>enviar(a.id)}>Enviar</button>
                      <button style={{...s.btn("danger"),padding:"4px 10px",fontSize:11}} onClick={()=>excluir(a.id)}>Excluir</button>
                    </>}
                    {a.status==="enviado"&&<span style={{fontSize:12,color:C.cinzaT}}>Aguardando supervisão</span>}
                    {a.status==="aceito"&&<span style={{fontSize:12,color:C.verde}}>✓ Aceito</span>}
                    {a.status==="recusado"&&<span style={{fontSize:12,color:C.verm}}>✗ Recusado</span>}
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        }
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════
// LANÇAMENTO DE ATIVIDADE
// ═══════════════════════════════════════════
function Lancamento({usuario,onVoltar,onSalvar}){
  const mes=new Date().getMonth()+1, ano=2026;
  const [tipoId,setTipoId]=useState("");
  const [itemId,setItemId]=useState("");
  const [data,setData]=useState(new Date().toISOString().split("T")[0]);
  const [descricao,setDescricao]=useState("");
  const [horas,setHoras]=useState("");
  const [pontos,setPontos]=useState("");
  const [complexidade,setComplexidade]=useState("—");
  const [erros,setErros]=useState({});
  const [sucesso,setSucesso]=useState(null);

  const tipoSel=TIPOS_ATIVIDADE.find(t=>t.id===Number(tipoId));
  const itensDisp=tipoSel?TABELA_PONTUACAO.filter(r=>tipoSel.itensPontuacao.includes(r.item)):[];
  const itemSel=TABELA_PONTUACAO.find(r=>r.item===Number(itemId));

  const handleTipo=(id)=>{
    setTipoId(id); setItemId(""); setPontos(""); setComplexidade("—");
  };
  const handleItem=(id)=>{
    const it=TABELA_PONTUACAO.find(r=>r.item===Number(id));
    setItemId(id);
    if(it){ setPontos(String(it.pontos)); setComplexidade(it.complexidade); }
  };

  const validar=()=>{
    const e={};
    if(!tipoId) e.tipo="Selecione o tipo";
    if(!itemId) e.item="Selecione o item da tabela";
    if(!data)   e.data="Informe a data";
    if(!descricao.trim()) e.desc="Informe a descrição";
    if(!pontos||isNaN(Number(pontos))||Number(pontos)<=0) e.pts="Pontuação inválida";
    setErros(e); return Object.keys(e).length===0;
  };

  const salvar=(status)=>{
    if(!validar()) return;
    const seq=String(Math.floor(Math.random()*900)+100).padStart(6,"0");
    const ctrl=`${tipoSel.codigo}-${ano}-${String(mes).padStart(2,"0")}-${seq}`;
    onSalvar({ id:"m"+Date.now(), numero_controle:ctrl, fiscal_id:usuario.id,
      tipo_nome:tipoSel.nome, item_tabela:Number(itemId), descricao,
      data, horas:Number(horas)||0, pontos:Number(pontos),
      pontos_homologado:null, complexidade, status, mes, ano });
    setSucesso({ctrl,status});
  };

  if(sucesso) return <div>
    <Pgheader titulo="Lançamento Salvo" onVoltar={onVoltar} voltar="Voltar ao Dashboard"/>
    <div style={{...s.card,...s.cBdy,textAlign:"center",padding:"40px 30px"}}>
      <div style={{fontSize:42,marginBottom:14}}>{sucesso.status==="enviado"?"📤":"📝"}</div>
      <h2 style={{fontSize:17,fontWeight:700,color:sucesso.status==="enviado"?C.verde:C.amar,marginBottom:8}}>
        {sucesso.status==="enviado"?"Enviado para a Supervisão!":"Rascunho salvo!"}
      </h2>
      <p style={{color:C.cinzaT,marginBottom:16}}>Número de controle: <strong style={{fontFamily:"monospace",color:C.verde}}>{sucesso.ctrl}</strong></p>
      {sucesso.status==="rascunho"&&<Alerta t="warn">Rascunho salvo. Acesse "Meus Lançamentos" para enviar à supervisão quando quiser.</Alerta>}
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <button style={s.btn("primary")} onClick={()=>setSucesso(null)}>+ Novo Lançamento</button>
        <button style={s.btn("outline")} onClick={()=>onVoltar("meuslancamentos")}>Ver Meus Lançamentos</button>
        <button style={s.btn()} onClick={()=>onVoltar("dashboard")}>Ir ao Dashboard</button>
      </div>
    </div>
  </div>;

  return <div>
    <Pgheader titulo="Lançar Nova Atividade" sub="Atividades não cobertas pelo CVS" onVoltar={()=>onVoltar("dashboard")} voltar="Voltar ao Dashboard"/>

    {/* Tabela de referência colapsável */}
    <details style={{...s.card,overflow:"hidden",marginBottom:18}}>
      <summary style={{...s.cHdr,cursor:"pointer",userSelect:"none"}}><div style={s.cTit}>📋 Tabela de Pontuação — clique para consultar</div></summary>
      <TabelaPontuacao/>
    </details>

    <div style={s.card}>
      <div style={s.cHdr}><div style={s.cTit}>Dados do Lançamento</div></div>
      <div style={s.cBdy}>
        <div style={s.fg}>
          <label style={s.lbl}>Tipo de Atividade *</label>
          <select style={{...s.sel,...(erros.tipo?{borderColor:C.verm}:{})}} value={tipoId} onChange={e=>handleTipo(e.target.value)}>
            <option value="">Selecione o tipo...</option>
            {TIPOS_ATIVIDADE.map(t=><option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          {erros.tipo&&<p style={{color:C.verm,fontSize:11,marginTop:3}}>{erros.tipo}</p>}
        </div>

        {tipoSel&&itensDisp.length>0&&<div style={s.fg}>
          <label style={s.lbl}>Item da Tabela de Pontuação *</label>
          <select style={{...s.sel,...(erros.item?{borderColor:C.verm}:{})}} value={itemId} onChange={e=>handleItem(e.target.value)}>
            <option value="">Selecione o item...</option>
            {itensDisp.map(r=><option key={r.item} value={r.item}>Item {r.item} — {r.complexidade!=="—"?r.complexidade+" · ":""}{r.pontos} pts — {r.descricao.substring(0,60)}...</option>)}
          </select>
          {erros.item&&<p style={{color:C.verm,fontSize:11,marginTop:3}}>{erros.item}</p>}
        </div>}

        {itemSel&&<Alerta t="info">
          <strong>Item {itemSel.item}:</strong> {itemSel.descricao}<br/>
          Complexidade: <strong>{itemSel.complexidade}</strong> · Pontuação padrão: <strong>{itemSel.pontos} pts</strong><br/>
          <span style={{fontSize:11,opacity:.8}}>A supervisão poderá ajustar a pontuação ao homologar.</span>
        </Alerta>}

        <div style={s.grid2}>
          <div style={s.fg}>
            <label style={s.lbl}>Data *</label>
            <input type="date" style={{...s.inp,...(erros.data?{borderColor:C.verm}:{})}} value={data} onChange={e=>setData(e.target.value)}/>
            {erros.data&&<p style={{color:C.verm,fontSize:11,marginTop:3}}>{erros.data}</p>}
          </div>
          <div style={s.fg}>
            <label style={s.lbl}>Horas (opcional)</label>
            <input type="number" step="0.5" min="0" style={s.inp} value={horas} onChange={e=>setHoras(e.target.value)} placeholder="Ex: 4"/>
          </div>
        </div>

        <div style={s.fg}>
          <label style={s.lbl}>Descrição *</label>
          <textarea rows={3} style={{...s.ta,...(erros.desc?{borderColor:C.verm}:{})}} value={descricao} onChange={e=>setDescricao(e.target.value)} placeholder="Descreva detalhadamente a atividade realizada..."/>
          {erros.desc&&<p style={{color:C.verm,fontSize:11,marginTop:3}}>{erros.desc}</p>}
        </div>

        <div style={s.grid2}>
          <div style={s.fg}>
            <label style={s.lbl}>Pontuação solicitada *</label>
            <input type="number" step="1" min="1" style={{...s.inp,...(erros.pts?{borderColor:C.verm}:{})}} value={pontos} onChange={e=>setPontos(e.target.value)}/>
            {erros.pts&&<p style={{color:C.verm,fontSize:11,marginTop:3}}>{erros.pts}</p>}
            <p style={{fontSize:11,color:C.cinzaT,marginTop:3}}>A supervisão pode alterar ao homologar</p>
          </div>
          <div style={s.fg}>
            <label style={s.lbl}>Complexidade</label>
            <input style={{...s.inp,background:C.cinzaB,color:C.cinzaT}} value={complexidade} readOnly/>
            <p style={{fontSize:11,color:C.cinzaT,marginTop:3}}>Definida pelo item selecionado</p>
          </div>
        </div>

        <div style={s.fg}>
          <label style={s.lbl}>Comprovante (opcional)</label>
          <input type="file" accept=".pdf,.jpg,.png" style={{...s.inp,padding:"6px 10px"}}/>
          <p style={{fontSize:11,color:C.cinzaT,marginTop:3}}>PDF, JPG, PNG — máx 5 MB</p>
        </div>

        <div style={{display:"flex",gap:10,paddingTop:8}}>
          <button style={s.btn()} onClick={()=>salvar("rascunho")}>💾 Salvar Rascunho</button>
          <button style={s.btn("primary")} onClick={()=>salvar("enviado")}>📤 Enviar para Supervisão</button>
        </div>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════
// OCORRÊNCIAS E AFASTAMENTOS (Fiscal lança)
// ═══════════════════════════════════════════
function OcorrenciasFiscal({usuario,ocorrencias,onVoltar,onSalvar}){
  const mes=new Date().getMonth()+1,ano=2026;
  const [tipo,setTipo]=useState("");
  const [desc,setDesc]=useState("");
  const [sucesso,setSucesso]=useState(false);
  const minhas=ocorrencias.filter(o=>o.fiscal_id===usuario.id&&o.mes_ref===mes&&o.ano_ref===ano);

  const salvar=()=>{
    if(!tipo||!desc.trim()){alert("Preencha o tipo e a descrição.");return;}
    onSalvar({id:"oc"+Date.now(),fiscal_id:usuario.id,mes:mes,ano:ano,mes_ref:mes,ano_ref:ano,tipo,descricao:desc,status:"pendente"});
    setTipo(""); setDesc(""); setSucesso(true); setTimeout(()=>setSucesso(false),3000);
  };

  return <div>
    <Pgheader titulo="Lançar Ocorrência / Afastamento" sub="Será analisado pela supervisão" onVoltar={onVoltar} voltar="Voltar ao Dashboard"/>
    {sucesso&&<Alerta t="ok">✅ Ocorrência registrada e enviada para análise da supervisão.</Alerta>}
    <div style={s.card}>
      <div style={s.cHdr}><div style={s.cTit}>Nova Ocorrência — {MESES[mes-1]}/{ano}</div></div>
      <div style={s.cBdy}>
        <div style={s.fg}>
          <label style={s.lbl}>Tipo de Ocorrência *</label>
          <select style={s.sel} value={tipo} onChange={e=>setTipo(e.target.value)}>
            <option value="">Selecione...</option>
            <option value="ferias">Férias regulamentares</option>
            <option value="licenca_medica">Licença médica / Atestado</option>
            <option value="licenca_gestante">Licença gestante/paternidade</option>
            <option value="afastamento_legal">Afastamento legal</option>
            <option value="outros">Outros afastamentos</option>
          </select>
        </div>
        <div style={s.fg}>
          <label style={s.lbl}>Descrição *</label>
          <textarea rows={3} style={s.ta} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Descreva a ocorrência, período, documentos..."/>
        </div>
        <button style={s.btn("primary")} onClick={salvar}>Enviar para Supervisão</button>
      </div>
    </div>

    {minhas.length>0&&<div style={s.card}>
      <div style={s.cHdr}><div style={s.cTit}>Minhas Ocorrências — {MESES[mes-1]}/{ano}</div></div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={s.th}>Tipo</th><th style={s.th}>Descrição</th><th style={s.th}>Status</th></tr></thead>
          <tbody>{minhas.map(o=><tr key={o.id}><td style={s.td}>{o.tipo}</td><td style={s.td}>{o.descricao}</td><td style={s.td}><Badge t={o.status}/></td></tr>)}</tbody>
        </table>
      </div>
    </div>}
  </div>;
}

// ═══════════════════════════════════════════
// CONFERÊNCIA (Fiscal = só leitura / Supervisor = pode alterar)
// ═══════════════════════════════════════════
function Conferencia({usuario,manuais,onVoltar,onHomologar,onHomologarCVS}){
  const [mes,setMes]=useState(new Date().getMonth()+1);
  const [ano,setAno]=useState(2026);
  const [fiscalId,setFiscalId]=useState(usuario.perfil==="fiscal"?usuario.id:USUARIOS.filter(u=>u.perfil==="fiscal"&&!u.teste)[0]?.id);
  // editando manuais
  const [editId,setEditId]=useState(null);
  const [ptEdit,setPtEdit]=useState("");
  // editando CVS (somente supervisor)
  const [cvsEdit,setCvsEdit]=useState(null); // id do CVS em edição
  const [cvsPtEdit,setCvsPtEdit]=useState("");
  const [cvsTipoEdit,setCvsTipoEdit]=useState("");
  const [cvsComplexEdit,setCvsComplexEdit]=useState("");

  // supervisor = só perfil "supervisor"; administrativo NÃO edita CVS
  const isSup=usuario.perfil==="supervisor";
  const isGestaoConf=usuario.perfil==="supervisor"||usuario.perfil==="administrativo";
  const fiscalSel=USUARIOS.find(u=>u.id===Number(fiscalId));
  const [cvsLocal,setCvsLocal]=useState(null); // sobrescritas locais de CVS
  const cvsBrutos=CVS_MOCK.filter(a=>a.fiscal_id===Number(fiscalId)&&a.data.startsWith(`${ano}-${String(mes).padStart(2,"0")}`));
  // Mescla overrides locais
  const cvs=cvsBrutos.map(a=>cvsLocal&&cvsLocal[a.id]?{...a,...cvsLocal[a.id]}:a);
  const man=manuais.filter(a=>a.fiscal_id===Number(fiscalId)&&a.mes===mes&&a.ano===ano);

  const homologar=(id,status,pts)=>{ onHomologar(id,status,pts||null); setEditId(null); };

  const iniciarEditCVS=(a)=>{
    setCvsEdit(a.id);
    setCvsPtEdit(String(a.pontos_homologado??a.pontos));
    setCvsTipoEdit(a.tipo_homologado||a.tipo);
    setCvsComplexEdit(a.complexidade_homologada||a.complexidade);
  };
  const salvarEditCVS=(a)=>{
    const override={
      pontos_homologado: Number(cvsPtEdit)||a.pontos,
      tipo_homologado: cvsTipoEdit,
      complexidade_homologada: cvsComplexEdit,
    };
    setCvsLocal(prev=>({...(prev||{}), [a.id]: override}));
    if(onHomologarCVS) onHomologarCVS(a.id, override);
    setCvsEdit(null);
  };

  return <div>
    <Pgheader titulo="Conferência de Atividades"
      sub={isGestaoConf?"Supervisor pode editar tipo, complexidade e pontos de qualquer atividade":"Apenas consulta — solicite alterações à supervisão"}
      onVoltar={onVoltar} voltar="Voltar"/>

    {isGestaoConf&&<div style={s.fg}>
      <label style={s.lbl}>Selecionar fiscal</label>
      <select style={{...s.sel,maxWidth:360}} value={fiscalId} onChange={e=>setFiscalId(Number(e.target.value))}>
        {USUARIOS.filter(u=>u.perfil==="fiscal"&&u.ativo&&!u.teste).map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}
      </select>
    </div>}

    <CompSel mes={mes} ano={ano} onM={setMes} onA={setAno}/>

    {!isGestaoConf&&<Alerta t="info">ℹ️ Esta tela é somente consulta. Contate a supervisão para alterar pontuações ou recusar lançamentos.</Alerta>}
    {usuario.perfil==="administrativo"&&<Alerta t="info">ℹ️ Perfil Administrativo: visualização completa. Apenas o Supervisor pode editar pontos e homologar.</Alerta>}

    <div style={s.card}>
      <div style={s.cHdr}>
        <div><div style={s.cTit}>Atividades — {fiscalSel?nomeCurto(fiscalSel.nome):""} · {MESES[mes-1]}/{ano}</div>
        <div style={s.cSub}>{cvs.length} CVS + {man.length} manuais{fiscalSel?.jornada===30?" · ⚡ Fiscal 30h — fator de correção 1,33":""}</div></div>
      </div>
      {fiscalSel?.jornada===30&&isSup&&<div style={{...s.alerta("warn"),margin:"0 0 0 0",borderRadius:0,borderLeft:"4px solid #f59e0b"}}>
        ⚡ <strong>Fiscal de 30h:</strong> aplique o fator de correção <strong>×1,33</strong> nos pontos ao homologar quando necessário.
      </div>}
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={s.th}>Data</th><th style={s.th}>Controle/OS</th><th style={s.th}>Descrição</th>
            <th style={s.th}>Tipo</th><th style={s.th}>Complexidade</th>
            <th style={{...s.th,textAlign:"right"}}>Pts originais</th>
            <th style={{...s.th,textAlign:"right"}}>Pts homologados</th>
            <th style={s.th}>Origem</th><th style={s.th}>Status</th>
            {isSup&&<th style={s.th}>Ações</th>}
          </tr></thead>
          <tbody>
            {/* ── CVS: editável só para supervisor ── */}
            {cvs.map(a=>{
              const ptHom=a.pontos_homologado??a.pontos;
              const tipoExib=a.tipo_homologado||a.tipo;
              const compExib=a.complexidade_homologada||a.complexidade;
              const editado=!!(a.pontos_homologado||a.tipo_homologado||a.complexidade_homologada);
              return <tr key={a.id} style={{background:C.azulP+"44"}}>
                <td style={s.td}>{fmtData(a.data)}</td>
                <td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{a.numero_os}</td>
                <td style={s.td}>{a.contribuinte}</td>
                {cvsEdit===a.id&&isSup?<>
                  <td style={s.td}>
                    <select style={{...s.sel,fontSize:11,padding:"3px 6px"}} value={cvsTipoEdit} onChange={e=>setCvsTipoEdit(e.target.value)}>
                      {TIPOS_ATIVIDADE.map(t=><option key={t.id} value={t.nome}>{t.nome}</option>)}
                    </select>
                  </td>
                  <td style={s.td}>
                    <select style={{...s.sel,fontSize:11,padding:"3px 6px",width:90}} value={cvsComplexEdit} onChange={e=>setCvsComplexEdit(e.target.value)}>
                      {["Alta","Média","Baixa","—"].map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                </>:<>
                  <td style={s.td}>{tipoExib}{editado&&<span style={{fontSize:9,color:C.verde,marginLeft:4}}>✎</span>}</td>
                  <td style={s.td}>{compExib}</td>
                </>}
                <td style={{...s.td,textAlign:"right",fontWeight:700,color:C.cinzaT}}>{a.pontos}</td>
                <td style={{...s.td,textAlign:"right",fontWeight:700,color:editado?C.verde:C.preto}}>
                  {cvsEdit===a.id&&isSup
                    ?<input type="number" style={{...s.inp,width:70,padding:"3px 6px",fontSize:12}} value={cvsPtEdit} onChange={e=>setCvsPtEdit(e.target.value)}/>
                    :ptHom}
                </td>
                <td style={s.td}><Badge t="cvs" lb="CVS"/></td>
                <td style={s.td}><Badge t="aceito" lb={editado?"Ajustado":"Importado"}/></td>
                {isSup&&<td style={s.td}>
                  {cvsEdit===a.id
                    ?<div style={{display:"flex",gap:5}}>
                      <button style={{...s.btn("primary"),padding:"3px 8px",fontSize:11}} onClick={()=>salvarEditCVS(a)}>✓ Salvar</button>
                      <button style={{...s.btn(),padding:"3px 8px",fontSize:11}} onClick={()=>setCvsEdit(null)}>✗</button>
                    </div>
                    :<button style={{...s.btn("outline"),padding:"3px 8px",fontSize:11}} onClick={()=>iniciarEditCVS(a)}>✏️ Editar</button>}
                </td>}
              </tr>;
            })}
            {/* ── MANUAIS ── */}
            {man.map(a=><tr key={a.id}>
              <td style={s.td}>{fmtData(a.data)}</td><td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{a.numero_controle}</td>
              <td style={s.td}>{a.descricao}</td><td style={s.td}>{a.tipo_nome}</td><td style={s.td}>{a.complexidade}</td>
              <td style={{...s.td,textAlign:"right",fontWeight:700,color:C.cinzaT}}>{a.pontos}</td>
              <td style={{...s.td,textAlign:"right",fontWeight:700,color:a.pontos_homologado!=null?C.verde:C.cinzaT}}>{a.pontos_homologado??"—"}</td>
              <td style={s.td}><Badge t="manual" lb="Manual"/></td><td style={s.td}><Badge t={a.status}/></td>
              {isSup&&<td style={s.td}>
                {editId===a.id?<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <input type="number" style={{...s.inp,width:70,padding:"3px 6px",fontSize:12}} value={ptEdit} onChange={e=>setPtEdit(e.target.value)} placeholder="Pts"/>
                  <button style={{...s.btn("primary"),padding:"4px 8px",fontSize:11}} onClick={()=>homologar(a.id,"aceito",Number(ptEdit)||a.pontos)}>✓ Aceitar</button>
                  <button style={{...s.btn("danger"),padding:"4px 8px",fontSize:11}} onClick={()=>homologar(a.id,"recusado",0)}>✗ Recusar</button>
                  <button style={{...s.btn(),padding:"4px 8px",fontSize:11}} onClick={()=>setEditId(null)}>Cancelar</button>
                </div>:
                <div style={{display:"flex",gap:6}}>
                  {(a.status==="enviado"||a.status==="aceito")&&<button style={{...s.btn("primary"),padding:"4px 8px",fontSize:11}} onClick={()=>{setEditId(a.id);setPtEdit(String(a.pontos_homologado??a.pontos));}}>✏️ Homologar</button>}
                  {a.status==="enviado"&&<button style={{...s.btn("danger"),padding:"4px 8px",fontSize:11}} onClick={()=>homologar(a.id,"recusado",0)}>✗ Recusar</button>}
                </div>}
              </td>}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════
// DASHBOARD SUPERVISOR
// ═══════════════════════════════════════════
function DashSupervisor({usuario,manuais,ocorrencias,onPag,onOcorrencia}){
  const [mes,setMes]=useState(new Date().getMonth()+1);
  const [ano,setAno]=useState(2026);
  const fiscais=USUARIOS.filter(u=>u.perfil==="fiscal"&&u.ativo&&!u.teste);
  const pendentesOc=ocorrencias.filter(o=>o.status==="pendente"&&o.mes_ref===mes&&o.ano_ref===ano);

  const dados=fiscais.map(f=>{
    const cvs=CVS_MOCK.filter(a=>a.fiscal_id===f.id&&a.data.startsWith(`${ano}-${String(mes).padStart(2,"0")}`));
    const man=manuais.filter(a=>a.fiscal_id===f.id&&a.mes===mes&&a.ano===ano);
    const pend=man.filter(a=>a.status==="enviado").length;
    const res=calcular(cvs,man);
    return{...f,pp:res.pp,pv:res.pv,apuracao:res.apuracao,pendentes:pend,total:cvs.length+man.length};
  });

  return <div>
    <Pgheader titulo="Dashboard do Supervisor" sub={`${usuario.nome} · ${MESES[mes-1]}/${ano}`}/>
    {pendentesOc.length>0&&<Alerta t="warn">⚠ {pendentesOc.length} ocorrência(s) de fiscais aguardando análise. <button style={{...s.btn("warn"),padding:"3px 10px",fontSize:11}} onClick={()=>onPag("ocorrencias_sup")}>Analisar</button></Alerta>}
    <CompSel mes={mes} ano={ano} onM={setMes} onA={setAno}/>
    <div style={s.card}>
      <div style={s.cHdr}><div><div style={s.cTit}>Produtividade por Fiscal</div><div style={s.cSub}>{fiscais.length} fiscais · clique em "Conferir" para homologar</div></div></div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={s.th}>Fiscal</th>
            <th style={{...s.th,textAlign:"right"}}>PP</th><th style={{...s.th,textAlign:"right"}}>PV</th>
            <th style={{...s.th,textAlign:"right"}}>Apuração</th>
            <th style={s.th}>Atividades</th><th style={s.th}>Pendentes</th><th style={s.th}>Ações</th>
          </tr></thead>
          <tbody>{dados.map(f=><tr key={f.id}>
            <td style={{...s.td,fontWeight:600}}>{nomeCurto(f.nome)}</td>
            <td style={{...s.td,textAlign:"right",fontWeight:700,color:C.verde}}>{f.pp.toFixed(0)}</td>
            <td style={{...s.td,textAlign:"right",fontWeight:700,color:C.azul}}>{f.pv.toFixed(0)}</td>
            <td style={{...s.td,textAlign:"right",fontWeight:700,color:"#7c3aed"}}>{f.apuracao}</td>
            <td style={s.td}>{f.total}</td>
            <td style={s.td}>{f.pendentes>0?<Badge t="enviado" lb={`${f.pendentes} pend.`}/>:<span style={{color:C.cinzaT}}>—</span>}</td>
            <td style={s.td}><button style={{...s.btn("outline"),padding:"4px 10px",fontSize:12}} onClick={()=>onPag("conferencia")}>Conferir</button></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════
// FECHAMENTO MENSAL — somente Supervisor fecha e gera relatório
// Administrativo: apenas consulta o resumo, SEM obs da chefia e SEM fechar
// ═══════════════════════════════════════════
function Relatorio({fiscal,mes,ano,cvs,man,oc,res,obs,supervisor}){
  const todasAtiv=[
    ...cvs.map((a,i)=>({...a,item:i+1,num:a.numero_os,id_label:a.contribuinte,origem:"CVS",pts_hom:a.pontos_homologado??a.pontos})),
    ...man.filter(a=>a.status==="aceito").map((a,i)=>({...a,item:cvs.length+i+1,num:a.numero_controle,id_label:a.descricao,origem:"Manual",pts_hom:a.pontos_homologado??a.pontos})),
  ];
  return <div id="relatorio-impressao" style={{background:C.branco,border:`1px solid ${C.cinzaL}`,borderRadius:10,overflow:"hidden",fontFamily:"Georgia,serif"}}>
    <div style={{background:C.verde,color:C.branco,padding:"18px 28px",textAlign:"center"}}>
      <div style={{fontSize:13,fontWeight:700,letterSpacing:".05em"}}>PREFEITURA MUNICIPAL DE ANÁPOLIS</div>
      <div style={{fontSize:11,opacity:.8}}>Secretaria Municipal de Saúde · Diretoria de Vigilância em Saúde · Vigilância Sanitária</div>
      <div style={{fontSize:15,fontWeight:700,marginTop:8}}>RELATÓRIO DE PRODUTIVIDADE FISCAL SANITÁRIO</div>
    </div>
    <div style={{padding:"14px 28px",borderBottom:`1px solid ${C.cinzaL}`,display:"flex",gap:28,flexWrap:"wrap",background:"#fafafa"}}>
      {[["Fiscal",fiscal?.nome],["Competência",`${MESES[mes-1]}/${ano}`],["Jornada",`${fiscal?.jornada||40}h`]].map(([l,v])=>(
        <div key={l}><div style={{fontSize:10,fontWeight:700,color:C.cinzaT,textTransform:"uppercase"}}>{l}</div><div style={{fontSize:13,fontWeight:600}}>{v}</div></div>
      ))}
    </div>
    <div style={{overflowX:"auto",padding:"0 14px 14px"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginTop:14}}>
        <thead><tr>
          {["Nº","OS/Controle","Identificação","Tipo","Complexidade","Pts Orig.","Pts Hom.","Data","Origem"].map(h=><th key={h} style={{...s.th,background:C.verde+"22",color:C.preto}}>{h}</th>)}
        </tr></thead>
        <tbody>{todasAtiv.map((a,i)=>(
          <tr key={i} style={{background:a.origem==="CVS"?C.azulP+"44":C.verdeP+"44"}}>
            <td style={{...s.td,textAlign:"center"}}>{a.item}</td>
            <td style={{...s.td,fontFamily:"monospace",fontSize:10}}>{a.num}</td>
            <td style={s.td}>{a.id_label}</td>
            <td style={s.td}>{a.tipo_homologado||a.tipo||a.tipo_nome}</td>
            <td style={s.td}>{a.complexidade_homologada||a.complexidade||"—"}</td>
            <td style={{...s.td,textAlign:"right"}}>{a.pontos}</td>
            <td style={{...s.td,textAlign:"right",fontWeight:700,color:a.pts_hom!==a.pontos?C.verde:C.preto}}>{a.pts_hom}</td>
            <td style={s.td}>{fmtData(a.data)}</td>
            <td style={s.td}><Badge t={a.origem.toLowerCase()} lb={a.origem}/></td>
          </tr>
        ))}</tbody>
      </table>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginTop:20}}>
        <div style={{border:`1px solid ${C.cinzaL}`,borderRadius:8,padding:"14px 18px"}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>QUADRO DE CÁLCULO</div>
          {[["PP",res.pp.toFixed(2),C.verde],["PN",res.pn.toFixed(2),C.verm],["PV",res.pv.toFixed(2),C.azul],["PV Limitado",res.pvLim.toFixed(2),C.azul],["Apuração Final",res.apuracao,"#7c3aed"]].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.cinzaL}`,fontSize:13}}>
              <span style={{color:C.cinzaT}}>{l}</span><strong style={{color:c}}>{v}</strong>
            </div>
          ))}
          <div style={{marginTop:10,fontSize:10,color:C.cinzaT,fontFamily:"monospace",background:C.cinzaB,borderRadius:5,padding:"6px 8px"}}>
            ({res.pvLim}−250)×0,2666 = {res.apuracao}
          </div>
        </div>
        <div style={{border:`1px solid ${C.cinzaL}`,borderRadius:8,padding:"14px 18px"}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>ASSINATURA DA CHEFIA</div>
          {obs&&<div style={{fontSize:12,color:C.cinzaT,marginBottom:14,fontStyle:"italic"}}>"{obs}"</div>}
          <div style={{marginTop:24,borderTop:`1px solid ${C.preto}`,paddingTop:8}}>
            <div style={{fontWeight:600,fontSize:12}}>{supervisor}</div>
            <div style={{color:C.cinzaT,fontSize:11}}>Supervisor — Vigilância Sanitária de Anápolis / GO</div>
          </div>
        </div>
      </div>
      {oc.length>0&&<div style={{marginTop:14,border:`1px solid ${C.cinzaL}`,borderRadius:8,padding:"12px 16px"}}>
        <div style={{fontWeight:700,fontSize:12,marginBottom:8}}>OCORRÊNCIAS E AFASTAMENTOS</div>
        {oc.map((o,i)=><div key={i} style={{fontSize:12,padding:"4px 0",borderBottom:`1px solid ${C.cinzaL}`}}><Badge t={o.status}/> <strong>{o.tipo}</strong> — {o.descricao}</div>)}
      </div>}
    </div>
  </div>;
}

function Fechamento({usuario,manuais,ocorrencias,onVoltar}){
  const [mes,setMes]=useState(new Date().getMonth()+1);
  const [ano,setAno]=useState(2026);
  const [fiscalId,setFiscalId]=useState(USUARIOS.filter(u=>u.perfil==="fiscal"&&!u.teste)[0]?.id);
  const [obs,setObs]=useState("");
  const [fechado,setFechado]=useState(false);

  const isSupervisor=usuario.perfil==="supervisor"; // só supervisor fecha e gera relatório
  const fiscal=USUARIOS.find(u=>u.id===Number(fiscalId));
  const cvs=CVS_MOCK.filter(a=>a.fiscal_id===Number(fiscalId)&&a.data.startsWith(`${ano}-${String(mes).padStart(2,"0")}`));
  const man=manuais.filter(a=>a.fiscal_id===Number(fiscalId)&&a.mes===mes&&a.ano===ano);
  const oc=ocorrencias.filter(o=>o.fiscal_id===Number(fiscalId)&&o.mes_ref===mes&&o.ano_ref===ano);
  const res=calcular(cvs,man);
  const pendentes=man.filter(a=>a.status==="enviado").length;

  // ── Tela pós-fechamento ─────────────────────────────────────
  // Relatório fica na mesma tela. Botão usa window.print() com
  // CSS @media print que esconde tudo exceto o relatório.
  // O app continua rodando normalmente após imprimir.
  if(fechado) return <div>
    {/* CSS de impressão — esconde header/nav/botões, exibe só o relatório */}
    <style>{`
      @media print {
        body > #root > div > header,
        body > #root > div > nav,
        .nao-imprimir { display: none !important; }
        .area-relatorio { margin: 0 !important; padding: 0 !important; }
        @page { size: A4; margin: 15mm; }
      }
    `}</style>

    {/* Barra de ações — NÃO aparece na impressão */}
    <div className="nao-imprimir">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:700,margin:"0 0 4px"}}>Competência Fechada 🔒</h1>
          <p style={{color:C.cinzaT,fontSize:13,margin:0}}>
            {nomeCurto(fiscal?.nome||"")} · {MESES[mes-1]}/{ano} ·
            Apuração final: <strong style={{color:"#7c3aed"}}>{res.apuracao} pts</strong>
          </p>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button
            style={{...s.btn("primary"),padding:"10px 20px",fontSize:14}}
            onClick={()=>window.print()}
          >🖨️ Imprimir / Salvar PDF</button>
          <button
            style={{...s.btn(),padding:"10px 20px",fontSize:13}}
            onClick={onVoltar}
          >← Voltar ao Dashboard</button>
        </div>
      </div>
      <Alerta t="ok">
        ✅ Competência <strong>{MESES[mes-1]}/{ano}</strong> de <strong>{nomeCurto(fiscal?.nome||"")}</strong> encerrada com sucesso.
        O relatório abaixo é o documento oficial. Use o botão acima para imprimir ou salvar em PDF.
        <br/><span style={{fontSize:11,opacity:.8}}>Dica: ao imprimir, selecione "Salvar como PDF" na impressora para gerar o arquivo.</span>
      </Alerta>
    </div>

    {/* Relatório — aparece na impressão */}
    <div className="area-relatorio">
      <Relatorio fiscal={fiscal} mes={mes} ano={ano} cvs={cvs} man={man} oc={oc} res={res} obs={obs} supervisor={usuario.nome}/>
    </div>
  </div>;

  return <div>
    <Pgheader titulo="Fechamento Mensal"
      sub={isSupervisor?"Supervisor fecha a competência e gera o relatório":"Administrativo — somente consulta do resumo"}
      onVoltar={onVoltar} voltar="Voltar"/>

    {!isSupervisor&&<Alerta t="info">ℹ️ Apenas o perfil Supervisor pode fechar a competência e gerar o relatório final.</Alerta>}

    <div style={s.fg}>
      <label style={s.lbl}>Selecionar Fiscal</label>
      <select style={{...s.sel,maxWidth:360}} value={fiscalId} onChange={e=>setFiscalId(Number(e.target.value))}>
        {USUARIOS.filter(u=>u.perfil==="fiscal"&&u.ativo&&!u.teste).map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}
      </select>
    </div>
    <CompSel mes={mes} ano={ano} onM={setMes} onA={setAno}/>
    {pendentes>0&&<Alerta t="warn">⚠ {pendentes} lançamento(s) ainda pendentes de homologação. Confira antes de fechar.</Alerta>}

    <div style={{display:"grid",gridTemplateColumns:isSupervisor?"1fr 1fr":"1fr",gap:16}}>
      <div>
        <div style={s.card}>
          <div style={s.cHdr}><div style={s.cTit}>Resumo de Produtividade</div></div>
          <div style={s.cBdy}>
            {[["PP",res.pp.toFixed(2),C.verde],["PN",res.pn.toFixed(2),C.verm],["PV",res.pv.toFixed(2),C.azul],["PV Limitado",res.pvLim.toFixed(2),C.azul],["Apuração Final",res.apuracao,"#7c3aed"]].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.cinzaL}`}}>
                <span style={{fontSize:13,color:C.cinzaT}}>{l}</span>
                <strong style={{color:c,fontSize:15}}>{v}</strong>
              </div>
            ))}
            <div style={{marginTop:12,fontSize:11,color:C.cinzaT,fontFamily:"monospace",background:C.cinzaB,borderRadius:6,padding:"7px 10px"}}>
              ({res.pvLim}−250)×0,2666 = {res.apuracao}
            </div>
          </div>
        </div>
        {oc.length>0&&<div style={s.card}>
          <div style={s.cHdr}><div style={s.cTit}>Ocorrências e Afastamentos</div></div>
          <div style={s.cBdy}>
            {oc.map(o=><div key={o.id} style={{padding:"6px 0",borderBottom:`1px solid ${C.cinzaL}`,fontSize:13}}>
              <Badge t={o.status}/> <strong>{o.tipo}</strong> — {o.descricao}
            </div>)}
          </div>
        </div>}
      </div>

      {/* Coluna direita: obs da chefia + botão fechar — SOMENTE supervisor */}
      {isSupervisor&&<div>
        <div style={s.card}>
          <div style={s.cHdr}><div style={s.cTit}>Observações da Chefia</div></div>
          <div style={s.cBdy}>
            <div style={s.fg}><label style={s.lbl}>Observações finais</label>
              <textarea rows={5} style={s.ta} value={obs} onChange={e=>setObs(e.target.value)} placeholder="Observações sobre o período, destaques, justificativas..."/>
            </div>
            <div style={{borderTop:`1px solid ${C.cinzaL}`,paddingTop:12,marginTop:4}}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Supervisor responsável</div>
              <div style={{fontSize:13,color:C.cinzaT}}>{usuario.nome}</div>
            </div>
          </div>
        </div>
        <button style={{...s.btn("primary"),width:"100%",justifyContent:"center",padding:"12px 0",fontSize:14}}
          onClick={()=>{
            if(pendentes>0&&!confirm(`Há ${pendentes} lançamento(s) pendentes. Fechar mesmo assim?`))return;
            if(confirm(`Fechar competência ${MESES[mes-1]}/${ano} de ${fiscal?nomeCurto(fiscal.nome):""}?

Esta ação não pode ser desfeita.`))setFechado(true);
          }}>
          🔒 Fechar Competência e Gerar Relatório
        </button>
      </div>}
    </div>
  </div>;
}

// ═══════════════════════════════════════════
// OCORRÊNCIAS — SUPERVISÃO
// ═══════════════════════════════════════════
function OcorrenciasSup({usuario,ocorrencias,onVoltar,onAtualizarOc}){
  const [mes,setMes]=useState(new Date().getMonth()+1);
  const [ano,setAno]=useState(2026);
  const ocs=ocorrencias.filter(o=>o.mes_ref===mes&&o.ano_ref===ano);

  return <div>
    <Pgheader titulo="Ocorrências e Afastamentos — Análise" sub="Aceite ou recuse as ocorrências dos fiscais" onVoltar={onVoltar} voltar="Voltar"/>
    <CompSel mes={mes} ano={ano} onM={setMes} onA={setAno}/>
    <div style={s.card}>
      <div style={s.cBdy}>
        {ocs.length===0?<p style={{color:C.cinzaT,textAlign:"center",padding:20}}>Nenhuma ocorrência nesta competência.</p>:
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><th style={s.th}>Fiscal</th><th style={s.th}>Tipo</th><th style={s.th}>Descrição</th><th style={s.th}>Status</th><th style={s.th}>Ações</th></tr></thead>
            <tbody>{ocs.map(o=>{
              const f=USUARIOS.find(u=>u.id===o.fiscal_id);
              return <tr key={o.id}>
                <td style={{...s.td,fontWeight:600}}>{f?nomeCurto(f.nome):"—"}</td>
                <td style={s.td}>{o.tipo}</td><td style={s.td}>{o.descricao}</td>
                <td style={s.td}><Badge t={o.status}/></td>
                <td style={s.td}>
                  {o.status==="pendente"&&<div style={{display:"flex",gap:6}}>
                    <button style={{...s.btn("primary"),padding:"4px 10px",fontSize:11}} onClick={()=>onAtualizarOc(o.id,"aceito")}>✓ Aceitar</button>
                    <button style={{...s.btn("danger"),padding:"4px 10px",fontSize:11}} onClick={()=>onAtualizarOc(o.id,"recusado")}>✗ Recusar</button>
                  </div>}
                </td>
              </tr>;
            })}</tbody>
          </table>
        }
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════
export default function App(){
  const [usuario,setUsuario]=useState(null);
  const [provisoria,setProvisoria]=useState(false);
  const [pagina,setPagina]=useState("dashboard");
  const [manuais,setManuais]=useState(MANUAIS_INICIAIS);
  const [ocorrencias,setOcorrencias]=useState(OCORRENCIAS_INICIAIS);

  const login=(u,isProv=false)=>{ setUsuario(u); setProvisoria(isProv); setPagina("dashboard"); };
  const logout=()=>{ setUsuario(null); setProvisoria(false); setPagina("dashboard"); };
  const concluirTroca=()=>{ setProvisoria(false); setPagina("dashboard"); };

  const addManual=useCallback((n)=>{ setManuais(p=>[...p,n]); },[]);
  const updStatus=useCallback((id,st)=>{ setManuais(p=>p.map(a=>a.id===id?{...a,status:st}:a)); },[]);
  const excluir=useCallback((id)=>{ setManuais(p=>p.filter(a=>a.id!==id)); },[]);
  const homologar=useCallback((id,st,pts)=>{ setManuais(p=>p.map(a=>a.id===id?{...a,status:st,pontos_homologado:pts}:a)); },[]);
  const addOc=useCallback((o)=>{ setOcorrencias(p=>[...p,o]); },[]);
  const updOc=useCallback((id,st)=>{ setOcorrencias(p=>p.map(o=>o.id===id?{...o,status:st}:o)); },[]);

  if(!usuario) return <Login onLogin={login}/>;

  // Intercepta: se senha ainda é provisória, força troca antes de qualquer coisa
  if(provisoria) return <TrocaSenhaObrigatoria usuario={usuario} onConcluir={concluirTroca}/>;

  const isFiscal=usuario.perfil==="fiscal";
  const isAdmin=usuario.perfil==="administrativo";
  const isSup=usuario.perfil==="supervisor";
  const isGestao=isAdmin||isSup;
  const navFiscal=[["dashboard","Dashboard"],["lancamento","Lançar Atividade"],["meuslancamentos","Meus Lançamentos"],["conferencia","Conferência"],["ocorrencias","Ocorrências"],["alterar_senha","🔒 Senha"]];
  const navGestao=[["dashboard","Dashboard"],["conferencia","Conferência"],["ocorrencias_sup","Ocorrências"],["fechamento","Fechamento"],["alterar_senha","🔒 Senha"]];
  const nav=isFiscal?navFiscal:navGestao;

  const renderPag=()=>{
    if(pagina==="alterar_senha") return <AlterarSenha usuario={usuario} onVoltar={()=>setPagina("dashboard")}/>;
    if(pagina==="lancamento"&&isFiscal) return <Lancamento usuario={usuario} onVoltar={(p)=>setPagina(p||"dashboard")} onSalvar={(n)=>{ addManual(n); }}/>;
    if(pagina==="meuslancamentos") return <MeusLancamentos usuario={usuario} manuais={manuais} onVoltar={()=>setPagina("dashboard")} onAtualizar={updStatus} onExcluir={excluir}/>;
    if(pagina==="conferencia") return <Conferencia usuario={usuario} manuais={manuais} onVoltar={()=>setPagina("dashboard")} onHomologar={homologar}/>;
    if(pagina==="ocorrencias"&&isFiscal) return <OcorrenciasFiscal usuario={usuario} ocorrencias={ocorrencias} onVoltar={()=>setPagina("dashboard")} onSalvar={addOc}/>;
    if(pagina==="ocorrencias_sup"&&isGestao) return <OcorrenciasSup usuario={usuario} ocorrencias={ocorrencias} onVoltar={()=>setPagina("dashboard")} onAtualizarOc={updOc}/>;
    if(pagina==="fechamento"&&isGestao) return <Fechamento usuario={usuario} manuais={manuais} ocorrencias={ocorrencias} onVoltar={()=>setPagina("dashboard")}/>;
    if(isFiscal) return <DashFiscal usuario={usuario} onPag={setPagina} manuais={manuais} ocorrencias={ocorrencias}/>;
    return <DashSupervisor usuario={usuario} manuais={manuais} ocorrencias={ocorrencias} onPag={setPagina} onOcorrencia={addOc}/>;
  };

  return <div style={s.app}>
    <style>{`
      @media print {
        header, nav, .nao-imprimir { display: none !important; }
        main { padding: 0 !important; max-width: 100% !important; }
        .area-relatorio { box-shadow: none !important; }
        @page { size: A4 portrait; margin: 12mm 15mm; }
      }
    `}</style>
    <header style={s.hdr}>
      <div>
        <div style={{fontWeight:700,fontSize:17,letterSpacing:".03em"}}>VISA Produtividade</div>
        <div style={{fontSize:11,opacity:.75}}>Vigilância Sanitária — Anápolis / GO</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:13,fontWeight:600}}>{nomeCurto(usuario.nome)}</div>
          <div style={{fontSize:11,opacity:.75,textTransform:"capitalize"}}>
            {usuario.perfil==="administrativo"?"Administrativo":usuario.perfil==="supervisor"?"Supervisor":usuario.perfil==="fiscal"?usuario.teste?"Fiscal (Teste)":"Fiscal":"—"}
          </div>
        </div>
        <button style={{...s.btn("outline"),color:C.branco,borderColor:"rgba(255,255,255,.4)",fontSize:12}} onClick={logout}>Sair</button>
      </div>
    </header>
    <nav style={s.nav}>
      {nav.map(([k,l])=><button key={k} style={s.navB(pagina===k)} onClick={()=>setPagina(k)}>{l}</button>)}
    </nav>
    <main style={s.main}>{renderPag()}</main>
  </div>;
}
