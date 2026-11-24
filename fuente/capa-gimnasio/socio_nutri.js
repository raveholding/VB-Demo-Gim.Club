/* V27.34 · App del socio: asistente de alimentación y viandas (pestaña «Comidas").
   Orientación general y deportiva, NO prescripción: si el socio marca una condición clínica, da pautas seguras y deriva
   a un Lic. en Nutrición matriculado. Respeta sin TACC, sin lactosa, vegetariano y vegano. Porciones caseras con macros
   estimados; más carbohidratos alrededor del entrenamiento y menos en días de descanso. Todo corre en el celular. */
var NUK='__PRE__-nutri',NUP='__PRE__-nutri-plan';
/* [plato, momentos, kcal, proteínas, carbohidratos, grasas, aptos (g sin TACC · l sin lactosa · v vegetariano · V vegano), costo 1-3, porción casera, se lleva en tupper] */
var DISH=[
['Avena con banana y mantequilla de maní','d',450,15,65,14,'lvV',1,'½ taza de avena + 1 banana + 1 cda de maní',1],
['Tostadas integrales con huevos revueltos','d',420,24,40,17,'lv',1,'2 tostadas + 2 huevos',0],
['Yogur con granola y frutas','d',380,18,55,9,'v',2,'1 pote de yogur + 1 puño de granola + fruta',1],
['Panqueques de avena y claras','d',400,28,48,9,'lv',1,'3 panqueques chicos',1],
['Tortilla de huevo con tostadas de arroz','d',360,22,30,15,'glv',1,'2 huevos + 3 tostadas de arroz',0],
['Licuado de banana, bebida vegetal y avena','d',390,14,62,9,'lvV',1,'1 vaso grande',1],
['Pollo al horno con arroz y verduras','ac',620,45,70,14,'gl',2,'1 palma de pollo + 1 puño de arroz + 2 puños de verduras',1],
['Tarta de verduras y ricota','a',520,24,50,24,'v',1,'1 porción (⅙ de tarta) + ensalada',1],
['Guiso de lentejas con arroz','a',600,28,95,10,'glvV',1,'1 plato hondo',1],
['Bowl de quinoa, garbanzos y vegetales','a',560,22,78,16,'glvV',2,'1 bowl (1 puño de quinoa + ½ taza de garbanzos)',1],
['Fideos integrales con atún y tomate','a',610,38,80,12,'l',1,'1 plato (80 g en crudo) + 1 lata chica de atún',1],
['Carne magra con puré de calabaza','ac',580,42,45,22,'gl',3,'1 palma de carne + 1 puño de puré',1],
['Milanesas de pollo al horno con ensalada','a',560,40,45,20,'l',2,'2 milanesas chicas + ensalada libre',1],
['Salteado de tofu, arroz yamaní y verduras','ac',540,26,70,16,'glvV',2,'1 palma de tofu + 1 puño de arroz + verduras',1],
['Wrap integral de pollo y vegetales','a',500,35,50,14,'l',2,'1 wrap grande',1],
['Omelette de verduras con papas al horno','ac',480,26,40,20,'glv',1,'2 huevos + 1 papa mediana',1],
['Yogur griego con frutos rojos','m',220,18,22,6,'gv',2,'1 pote + ½ taza de frutos rojos',1],
['Fruta con un puñado de frutos secos','m',230,6,25,12,'glvV',2,'1 fruta + 1 puñado chico',1],
['Tostadas de arroz con queso untable y tomate','m',220,10,30,6,'gv',1,'3 tostadas',0],
['Batido de proteína con banana','mo',300,28,38,4,'gv',2,'1 medida de proteína + 1 banana + agua o leche',1],
['Huevo duro y una fruta','m',160,7,20,5,'glv',1,'1 huevo + 1 fruta',1],
['Barrita de cereal casera','m',210,6,32,7,'lvV',1,'1 barrita',1],
['Banana con una cucharada de miel','p',160,1,40,0,'glv',1,'1 banana + 1 cdita de miel',1],
['Tostada con mermelada','p',180,4,36,2,'lvV',1,'1 tostada + 1 cda de mermelada',0],
['Puñado de dátiles o pasas','p',150,1,38,0,'glvV',2,'1 puñado chico',1],
['Yogur con avena y miel','o',330,16,55,5,'v',1,'1 pote + 3 cdas de avena',1],
['Sándwich de pan integral con pollo','o',380,30,42,8,'l',2,'1 sándwich',1],
['Leche chocolatada (o bebida vegetal) con una fruta','o',300,12,50,6,'gv',1,'1 vaso + 1 fruta',1],
['Pescado al horno con ensalada y papa','c',480,36,40,16,'gl',3,'1 palma de pescado + 1 papa + ensalada',1],
['Ensalada completa con huevo y atún','c',420,32,20,22,'gl',1,'1 bowl grande',1],
['Calabaza rellena con queso y choclo','c',450,18,55,16,'gv',1,'½ calabaza chica',1],
['Sopa de verduras con pollo desmenuzado','c',380,30,35,10,'gl',1,'1 plato hondo',1],
['Hamburguesas de lentejas con ensalada','c',460,22,55,14,'glvV',1,'2 medallones + ensalada',1]];
/* viandas del bar del gimnasio (catálogo del local: en la versión real lo carga el gimnasio en el sistema) */
var BAR={'Pollo al horno con arroz y verduras':5200,'Bowl de quinoa, garbanzos y vegetales':5800,'Batido de proteína con banana':3500,'Yogur griego con frutos rojos':2600,'Wrap integral de pollo y vegetales':4500};
var NU_OBJ=[['bajar','Bajar grasa',26,1.8],['ganar','Ganar músculo',36,1.8],['rend','Rendimiento',33,1.6],['mant','Mantenerme',30,1.5]];
var NU_RES=[['g','Sin TACC'],['l','Sin lactosa'],['v','Vegetariano'],['V','Vegano']];
var NU_CLI=['Ninguna','Diabetes','Hipertensión','Enfermedad renal','Embarazo o lactancia','Trastorno de la conducta alimentaria','Alergia alimentaria grave'];
var NU_DAY=[['fuerza','Fuerza'],['inferior','Tren inferior'],['cardio','Cardio'],['descanso','Descanso']];
function nuP(){return read(NUK,null);}
function nuDay(){if(ui.nuDay)return ui.nuDay;var lg=read('mi-log',[]).filter(function(x){return x.d===today();})[0];var n=(lg&&lg.n)||'';if(!n&&D.rt){var d=D.rt[1][Math.min(ui.day||0,D.rt[1].length-1)];n=d?d[0]:'';}
 n=String(n).toLowerCase();if(/pierna|inferior|glúteo|gluteo/.test(n))return'inferior';if(/cardio|running|bici|spinning|hiit/.test(n))return'cardio';if(n)return'fuerza';var w=new Date().getDay();return w===0?'descanso':'fuerza';}
function nuOk(x,p){var t=x[6];for(var i=0;i<p.res.length;i++){var r=p.res[i];if(r==='v'){if(t.indexOf('v')<0&&t.indexOf('V')<0)return false;}else if(t.indexOf(r)<0)return false;}return true;}
function nuPick(mo,p,seed,used,low){var L=DISH.filter(function(x){return x[1].indexOf(mo)>=0&&nuOk(x,p)&&used.indexOf(x[0])<0;});var bud=p.bud==='eco'?1:p.bud==='med'?2:3;var B=L.filter(function(x){return x[7]<=bud;});if(B.length)L=B;
 if(!L.length)return null;if(low)L=L.slice().sort(function(a,b){return a[4]-b[4];}).slice(0,Math.max(2,Math.ceil(L.length/2)));return L[seed%L.length];}
function nuPlan(p){var day=nuDay(),tr=day!=='descanso',o=NU_OBJ.filter(function(x){return x[0]===p.obj;})[0]||NU_OBJ[3];var kg=+p.kg||70;
 var meta={kcal:Math.round(kg*o[2]*(tr?1.05:0.92)/10)*10,P:Math.round(kg*o[3]),C:0};
 var M=[['d','Desayuno']].concat(tr?[['p','Pre-entreno']]:[]).concat([['a','Almuerzo · vianda']]).concat(tr?[['o','Post-entreno']]:[['m','Merienda']]).concat([['c','Cena']]);
 var base=+(today().replace(/-/g,''))%97,used=[],sw=ui.nuSw||{};var esc2=1;
 var out=M.map(function(m,i){var x=nuPick(m[0]==='o'?'o':m[0],p,base+i*7+(sw[m[0]]||0),used,!tr&&(m[0]==='a'||m[0]==='c'))||nuPick(m[0],p,base+(sw[m[0]]||0),[],false);if(x)used.push(x[0]);return{m:m[0],t:m[1],x:x,f:(m[0]==='p'?1:esc2)};});
 /* ajusta las porciones para acercarse a la meta del día (entre 0,8 y 1,4 de la porción base) */
 var tk=out.reduce(function(a,o){return a+(o.x?o.x[2]*(o.m==='p'?1:1):0);},0),pk=out.reduce(function(a,o){return a+(o.x&&o.m==='p'?o.x[2]:0);},0);var k=tk-pk>0?Math.max(0.8,Math.min(1.4,(meta.kcal-pk)/(tk-pk))):1;out.forEach(function(o){if(o.m!=='p')o.f=Math.round(k*20)/20;});
 return{day:day,tr:tr,meta:meta,out:out};}
function nuTot(pl){var t={k:0,P:0,C:0,F:0};pl.out.forEach(function(o){if(!o.x)return;t.k+=o.x[2]*o.f;t.P+=o.x[3]*o.f;t.C+=o.x[4]*o.f;t.F+=o.x[5]*o.f;});for(var k in t)t[k]=Math.round(t[k]);return t;}
function comidas(){var p=nuP();
 if(!p||ui.nuEdit)return nuForm(p||{obj:'mant',kg:'',fr:3,res:[],bud:'med',cli:'Ninguna'});
 if(p.cli&&p.cli!=='Ninguna')return '<section class="glass"><div class="eyebrow">Asistente de alimentación</div><h2>Te conviene un plan con un profesional</h2><p class="meta" style="margin-top:8px;font-size:15px">Marcaste <b>'+esc(p.cli)+'</b>. En ese caso no armamos un plan cerrado: lo tiene que indicar un Licenciado en Nutrición matriculado, junto con tu médico.</p>'+
  '<ul class="meta" style="font-size:15px;line-height:1.6;margin:10px 0 0 18px"><li>Comé a horario y no te saltees comidas antes de entrenar.</li><li>Hidratate antes, durante y después de cada clase.</li><li>Priorizá alimentos frescos y evitá ultraprocesados.</li><li>Si te sentís mal mientras entrenás, pará y avisale al profe.</li></ul>'+
  '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><a class="btn" target="_blank" rel="noopener" href="'+waGym('Hola, soy '+D.n+'. Quiero un turno con nutricionista: tengo '+p.cli.toLowerCase()+'.')+'">Pedir turno con nutricionista</a><button class="btn" type="button" data-a="nuEdit" style="background:var(--glass-2);color:inherit">Cambiar mis datos</button></div></section>';
 var pl=nuPlan(p),t=nuTot(pl),o=NU_OBJ.filter(function(x){return x[0]===p.obj;})[0]||NU_OBJ[3];var only=ui.nuOnly||'';
 var dayBtns='<div class="seg" role="group" aria-label="Entrenamiento de hoy">'+NU_DAY.map(function(d){return '<button type="button" data-a="nuDay" data-v="'+d[0]+'" aria-pressed="'+(pl.day===d[0])+'">'+d[1]+'</button>';}).join('')+'</div>';
 var quick='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="chip" type="button" data-a="nuOnly" data-v="a" style="cursor:pointer;min-height:36px'+(only==='a'?';outline:2px solid var(--teal)':'')+'">🥡 Vianda de hoy</button>'+(pl.tr?'<button class="chip" type="button" data-a="nuOnly" data-v="o" style="cursor:pointer;min-height:36px'+(only==='o'?';outline:2px solid var(--teal)':'')+'">💪 Post-entreno</button>':'')+'<button class="chip" type="button" data-a="nuOnly" data-v="" style="cursor:pointer;min-height:36px'+(!only?';outline:2px solid var(--teal)':'')+'">📋 Todo el día</button><button class="chip" type="button" data-a="nuEco" style="cursor:pointer;min-height:36px">💲 Más económico</button></div>';
 var cards=pl.out.filter(function(x){return !only||x.m===only;}).map(function(c){var x=c.x;if(!x)return '<article class="ex"><span class="nm">'+esc(c.t)+'</span><p class="meta">No encontramos un plato con tus restricciones para este momento.</p></article>';var f=c.f,bar=BAR[x[0]];
  return '<article class="ex"><div class="eyebrow" style="margin:0">'+esc(c.t)+(x[9]&&c.m==='a'?' · se lleva en tupper':'')+'</div><span class="nm" style="font-size:17px">'+esc(x[0])+'</span><p class="meta" style="margin:4px 0">'+esc(x[8])+(f>=1.1?' · porción grande (×'+String(f).replace('.',',')+')':f<=0.9?' · porción moderada (×'+String(f).replace('.',',')+')':'')+'</p>'+
  '<div class="row"><span class="chip">'+Math.round(x[2]*f)+' kcal</span><span class="chip">P '+Math.round(x[3]*f)+' g</span><span class="chip">C '+Math.round(x[4]*f)+' g</span><span class="chip">G '+Math.round(x[5]*f)+' g</span></div>'+
  '<div class="row" style="margin-top:6px"><button class="chip" type="button" data-a="nuSw" data-m="'+c.m+'" style="cursor:pointer;min-height:34px">↻ Cambiar plato</button>'+(bar?'<a class="chip" target="_blank" rel="noopener" href="'+waGym('Hola, soy '+D.n+'. Quiero reservar la vianda «'+x[0]+'» del bar para hoy.')+'" style="text-decoration:none;min-height:34px">🏷 En el bar del gimnasio $ '+bar.toLocaleString('es-AR')+' · Reservar</a>':'')+'</div></article>';}).join('');
 return '<section class="glass" style="display:flex;flex-direction:column;gap:10px"><div class="eyebrow">Asistente de alimentación y viandas</div><h2>Tus comidas de hoy</h2><p class="meta" style="font-size:14px">'+esc(o[1])+' · '+esc(String(p.kg))+' kg · '+p.fr+' entrenamientos por semana'+(p.res.length?' · '+NU_RES.filter(function(r){return p.res.indexOf(r[0])>=0;}).map(function(r){return r[1].toLowerCase();}).join(', '):'')+'</p>'+dayBtns+
  '<p class="meta" style="font-size:14px">'+(pl.tr?'Día de entrenamiento: carbohidratos complejos antes y después de entrenar, y proteína en cada comida.':'Día de descanso: proteínas magras, verduras y grasas saludables, con menos carbohidratos simples.')+'</p>'+quick+
  '<div class="row" style="margin-top:4px"><span class="chip">Total '+t.k+' kcal · meta '+pl.meta.kcal+'</span><span class="chip">Proteína '+t.P+' g · meta '+pl.meta.P+' g</span><span class="chip">C '+t.C+' g · G '+t.F+' g</span></div></section>'+
  '<div class="list">'+cards+'</div>'+
  '<section class="glass" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="button" data-a="nuSave">Guardar mi plan de hoy</button><a class="btn" target="_blank" rel="noopener" href="'+waGym('Hola, soy '+D.n+'. Este es mi plan de comidas de hoy:\n'+pl.out.filter(function(c){return c.x;}).map(function(c){return '• '+c.t+': '+c.x[0];}).join('\n'))+'" style="background:var(--glass-2);color:inherit">Consultarlo con el profe</a><button class="btn" type="button" data-a="nuEdit" style="background:var(--glass-2);color:inherit">Mis datos</button>'+
  '<p class="meta" style="font-size:12.5px;width:100%;margin-top:4px">Valores estimados y orientativos. Es una guía general de alimentación deportiva y no reemplaza la consulta con un Licenciado en Nutrición.</p></section>';}
function nuForm(p){return '<section class="glass" style="display:flex;flex-direction:column;gap:10px"><div class="eyebrow">Asistente de alimentación y viandas</div><h2>Contanos un poco de vos</h2><p class="meta" style="font-size:14px">Con esto te armamos las comidas de cada día según tu entrenamiento. Queda guardado sólo en tu celular.</p>'+
 '<label class="meta" for="nu-obj">Objetivo</label><select id="nu-obj" class="inp">'+NU_OBJ.map(function(o){return '<option value="'+o[0]+'"'+(p.obj===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select>'+
 '<label class="meta" for="nu-kg">Peso actual (kg)</label><input id="nu-kg" class="inp" inputmode="decimal" value="'+esc(String(p.kg||''))+'" placeholder="Ej.: 70">'+
 '<label class="meta" for="nu-fr">Entrenamientos por semana</label><input id="nu-fr" class="inp" type="number" min="0" max="14" value="'+(p.fr||3)+'">'+
 '<fieldset style="border:0;padding:0;margin:0"><legend class="meta">Restricciones</legend><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">'+NU_RES.map(function(r){return '<label class="chip" style="cursor:pointer;min-height:36px"><input type="checkbox" class="nu-res" value="'+r[0]+'"'+(p.res.indexOf(r[0])>=0?' checked':'')+'> '+r[1]+'</label>';}).join('')+'</div></fieldset>'+
 '<label class="meta" for="nu-bud">Presupuesto</label><select id="nu-bud" class="inp"><option value="eco"'+(p.bud==='eco'?' selected':'')+'>Económico</option><option value="med"'+(p.bud==='med'?' selected':'')+'>Intermedio</option><option value="lib"'+(p.bud==='lib'?' selected':'')+'>Sin límite</option></select>'+
 '<label class="meta" for="nu-cli">¿Tenés alguna de estas condiciones?</label><select id="nu-cli" class="inp">'+NU_CLI.map(function(c){return '<option'+(p.cli===c?' selected':'')+'>'+c+'</option>';}).join('')+'</select>'+
 '<button class="btn" type="button" data-a="nuOk">Armar mis comidas</button></section>';}
