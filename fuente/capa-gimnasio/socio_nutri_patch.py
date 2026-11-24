#!/usr/bin/env python3
"""V27.34 · Suma a la app del socio (socio.html ya generada) la pestaña «Comidas»: asistente de alimentación y viandas.
Idempotente: si ya está, la reemplaza. Uso: python3 socio_nutri_patch.py <socio.html> [prefijo=svbgym]"""
import sys,os,re
p=sys.argv[1];pre=sys.argv[2] if len(sys.argv)>2 else 'svbgym'
s=open(p,encoding='utf8').read()
M,E='/*vb-nutri*/','/*/vb-nutri*/'
while M in s:
    a=s.index(M);b=s.index(E)+len(E);s=s[:a]+s[b:]
nu=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'socio_nutri.js'),encoding='utf8').read().replace('__PRE__',pre).replace("'mi-log'","'%s-log'"%pre)
NU_A=("nuOk(){var kg=parseFloat(String(($('#nu-kg')||{}).value||'').replace(',','.'));if(!(kg>=30&&kg<=250)){toast('Escribí tu peso en kg');return}var res=[].slice.call(document.querySelectorAll('.nu-res:checked')).map(function(x){return x.value});if(res.indexOf('V')>=0&&res.indexOf('v')<0)res.push('v');store(NUK,{obj:$('#nu-obj').value,kg:kg,fr:Math.max(0,Math.min(14,+$('#nu-fr').value||0)),res:res,bud:$('#nu-bud').value,cli:$('#nu-cli').value});ui.nuEdit=false;ui.nuSw={};render();window.scrollTo(0,0)},"
 "nuEdit(){ui.nuEdit=true;render()},nuDay(d){ui.nuDay=d.v;ui.nuSw={};render()},nuOnly(d){ui.nuOnly=d.v;render()},nuSw(d){ui.nuSw=ui.nuSw||{};ui.nuSw[d.m]=(ui.nuSw[d.m]||0)+1;render()},"
 "nuEco(){var p=nuP();if(!p)return;p.bud=p.bud==='lib'?'med':'eco';store(NUK,p);ui.nuSw={};render();toast('Listo: te mostramos opciones más económicas')},"
 "nuSave(){var p=nuP();if(!p)return;var pl=nuPlan(p),L=read(NUP,[]).filter(function(x){return x.d!==today()});L.push({d:today(),day:pl.day,items:pl.out.filter(function(c){return c.x}).map(function(c){return [c.t,c.x[0]]})});store(NUP,L.slice(-30));toast('Plan de hoy guardado en tu celular')},")
V0="const V={inicio:inicio,rutina:rutina,progreso:progreso,clases:clases,avisos:avisos};";V1="const V={inicio:inicio,rutina:rutina,comidas:comidas,progreso:progreso,clases:clases,avisos:avisos};"
if "['comidas','Comidas']" not in s:
    o="const TABS=[['inicio','Inicio'],['rutina','Rutina'],['progreso'";assert o in s;s=s.replace(o,"const TABS=[['inicio','Inicio'],['rutina','Rutina'],['comidas','Comidas'],['progreso'",1)
if "const ICO={comidas:" not in s:
    o="const ICO={inicio:";assert o in s;s=s.replace(o,"const ICO={comidas:'<path d=\"M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 0-3 2-3 5s1 4 3 4v9\"/>',inicio:",1)
if V0 in s: s=s.replace(V0,V1,1)
assert V1 in s
s=s.replace(V1,M+nu+E+"\n"+V1,1)
assert "  finish(){" in s;s=s.replace("  finish(){","  "+M+NU_A+E+"\n  finish(){",1)
s=s.replace("</style>",M+".inp{width:100%;min-height:46px;border-radius:12px;border:1px solid var(--line);background:var(--field);color:var(--fg);padding:0 12px;font:inherit;font-size:16px}.tabs{grid-template-columns:repeat(6,minmax(0,1fr))!important}.tabs button{font-size:11.5px!important;padding:0 2px}"+E+"\n</style>",1)
open(p,'w',encoding='utf8').write(s);print('socio_nutri: ok')
