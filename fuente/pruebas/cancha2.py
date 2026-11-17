# V29.5 · Canchas: grilla dinámica, pedidos online 24/7 desde la web, turnos fijos, bloqueos, video, reportes y QR
import sys
from playwright.sync_api import sync_playwright
F=sys.argv[1] if len(sys.argv)>1 else '/tmp/gym.html'
res=[]
def chk(c,m):print(('OK   ' if c else 'FALLA ')+m);res.append(bool(c))
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-proxy-server']);pg=b.new_page(viewport={'width':1300,'height':900});ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.goto('file://'+F+'#acceso');pg.wait_for_timeout(1500);pg.select_option('#lu',index=0);pg.fill('#lp','1234');pg.click('[data-act=login]');pg.wait_for_timeout(800)
    ev("go('gcanchas')");pg.wait_for_timeout(600)
    chk(pg.locator('.gp-ccol').count()==3,'grilla con una columna por cancha')
    chk(ev("P_cn=S.gym.pro, S.gym.pro.courts.every(c=>c.dur&&c.surf&&c.open)"),'cada cancha tiene ficha (duración, superficie, horario)')
    chk(ev("S.gym.pro.cres.filter(b=>b.st==='solicitado').length")>=2,'la demo trae pedidos online de ejemplo')
    chk(ev("S.gym.pro.cres.filter(b=>b.fx).length")>=6,'la demo trae un turno fijo semanal')
    # precio pico
    pr=ev("(()=>{const c=S.gym.pro.courts[0];return [c.price,c.peak]})()")
    chk(pr[1]>pr[0],'precio de horario pico configurado %s'%pr)
    # público: disponibilidad sin datos de terceros
    pub=ev("RAVE_API.site().canchas")
    chk(pub and pub['on'] and len(pub['days'])==7 and len(pub['courts'])==3,'la web recibe 7 días y 3 canchas')
    txt=str(pub)
    chk('Oficina Norte' not in txt and 'Lucía' not in txt and '387' not in txt,'la web no ve nombres ni teléfonos de otros clientes')
    d1=pub['days'][1];c0=pub['courts'][0]['id'];sl=pub['slots'][c0][d1]
    free=[x for x in sl if x[2]];busy=[x for x in sl if not x[2]]
    chk(len(free)>0,'hay horarios libres mañana')
    h=free[0][0]
    r=ev("o=>RAVE_API.courtReq(o)",{'court':c0,'date':d1,'time':h,'name':'Ana Test','tel':'3875111222'})
    chk(r['ok'],'el público pide un turno libre')
    r2=ev("o=>RAVE_API.courtReq(o)",{'court':c0,'date':d1,'time':h,'name':'Otro','tel':'3875333444'})
    chk(not r2['ok'] and 'libre' in r2['msg'],'el mismo horario ya no se puede pedir dos veces')
    r3=ev("o=>RAVE_API.courtReq(o)",{'court':c0,'date':d1,'time':free[1][0],'name':'A','tel':'12'})
    chk(not r3['ok'],'valida nombre y WhatsApp')
    r4=ev("o=>RAVE_API.courtReq(o)",{'court':c0,'date':'2099-01-01','time':'10:00','name':'Ana','tel':'3875111222'})
    chk(not r4['ok'],'no acepta días fuera de la ventana')
    q=ev("S.gym.pro.cres.find(b=>b.who==='Ana Test')")
    chk(q and q['st']=='solicitado' and q['src']=='web','el pedido entra como «pedido online»')
    # pantalla de pedidos
    ev("window.gCnV='pedidos';rerender()");pg.wait_for_timeout(300)
    chk(pg.locator('.gp-req').count()>=3,'pestaña Pedidos online lista los pendientes')
    ev("window.__op=[];window.open=(u)=>{window.__op.push(u);return null;}")
    pg.locator('.gp-req',has_text='Ana Test').locator('[data-act=gCnAcc]').click();pg.wait_for_timeout(300)
    chk(ev("S.gym.pro.cres.find(b=>b.who==='Ana Test').st")=='reservado','aceptar pasa el pedido a reservado')
    # rechazo
    pg.locator('.gp-req').first.locator('[data-act=gCnRej]').click();pg.wait_for_timeout(300)
    chk(ev("S.gym.pro.cres.filter(b=>b.st==='rechazado').length")==1 and pg.locator('.ov').count()==1,'rechazar ofrece avisar por WhatsApp');ev("$$('#modal-root .ov').forEach(o=>o.remove())")
    # turno fijo nuevo desde la grilla
    ev("window.gCnV='grilla';window.gCnD=addDays(gT(),3);rerender()");pg.wait_for_timeout(300)
    n0=ev("S.gym.pro.cres.length")
    pg.locator('.gp-slot.free:not(.pas)').first.click();pg.wait_for_timeout(300)
    pg.fill('#cn-w','Los Jueves');pg.check('#cn-fx');pg.select_option('#cn-fxn','4');pg.click('.ov [data-m=ok]');pg.wait_for_timeout(400)
    fx=ev("S.gym.pro.cres.filter(b=>b.who==='Los Jueves')")
    chk(len(fx)>=3 and len(set(x['fx'] for x in fx))==1,'turno fijo: %d semanas con la misma serie'%len(fx))
    ev("window.gCnV='fijos';rerender()");pg.wait_for_timeout(300)
    chk('Los Jueves' in pg.inner_text('main') if pg.locator('main').count() else 'Los Jueves' in pg.inner_text('body'),'la serie aparece en Turnos fijos')
    pg.locator('tr',has_text='Los Jueves').locator('[data-act=gCnFxExt]').click();pg.wait_for_timeout(300)
    chk(ev("S.gym.pro.cres.filter(b=>b.who==='Los Jueves').length")>len(fx),'sumar 4 semanas extiende la serie')
    pg.locator('tr',has_text='Los Jueves').locator('[data-act=gCnFxCan]').click();pg.wait_for_timeout(300);pg.click('.ov [data-m=ok]');pg.wait_for_timeout(300)
    chk(ev("S.gym.pro.cres.filter(b=>b.who==='Los Jueves'&&b.st!=='cancelado').length")==0,'cancelar la serie de una vez')
    # bloqueo
    ev("window.gCnV='grilla';window.gCnD=addDays(gT(),4);rerender()");pg.wait_for_timeout(300)
    pg.click('[data-act=gCnBlkN]');pg.wait_for_timeout(300);pg.fill('#cb-d',ev("addDays(gT(),4)"));pg.fill('#cb-f','08:00');pg.fill('#cb-t','10:00');pg.fill('#cb-w','Mantenimiento');pg.click('.ov [data-m=ok]');pg.wait_for_timeout(400)
    chk(pg.locator('.gp-slot.blk').count()==6,'bloqueo de 2 horas en las 3 canchas')
    pub=ev("RAVE_API.site().canchas");d4=ev("addDays(gT(),4)")
    chk(all(not x[2] for c in pub['courts'] for x in pub['slots'][c['id']][d4] if x[0] in ('08:00','09:00')),'la web muestra el horario bloqueado como no disponible')
    # editar cancha: duración 90 y precio pico
    pg.click('[data-act=gCnAdm]');pg.wait_for_timeout(300)
    cid=ev("S.gym.pro.courts[2].id")
    pg.locator('details.gp-cedit').nth(2).locator('summary').click();pg.select_option('#ce-dur-'+cid,'90');pg.wait_for_timeout(300)
    ev("$$('#modal-root .ov').forEach(o=>o.remove())")
    sl=ev("(()=>{const c=S.gym.pro.courts[2];return cnSlotsT=null,c.dur})()")
    chk(sl==90,'duración del turno editable (90 min)')
    pub=ev("RAVE_API.site().canchas");d6=pub['days'][6]
    t6=[x[0] for x in pub['slots'][cid][d6]]
    chk('09:30' in t6 and '11:00' in t6,'la grilla se arma con turnos de 90 min %s'%t6[:4])
    # video
    ev("window.gCnD=gT();rerender()");pg.wait_for_timeout(200)
    bid=ev("S.gym.pro.cres.find(b=>b.court==='cn1'&&b.date===gT()&&b.st!=='cancelado'&&b.st!=='rechazado').id")
    ev("id=>{S.gym.pro.cres.find(b=>b.id===id).tel='3874001122'}",bid);ev("id=>A.gCnB({dataset:{id}})",bid);pg.wait_for_timeout(300)
    pg.fill('#cn-vid','http://malo');pg.click('[data-act=gCnVid]');pg.wait_for_timeout(200)
    chk(not ev("id=>S.gym.pro.cres.find(b=>b.id===id).vid",bid),'el video sólo acepta enlaces https')
    pg.fill('#cn-vid','https://beelup.com/v/abc123');pg.click('[data-act=gCnVid]');pg.wait_for_timeout(300)
    chk(ev("id=>S.gym.pro.cres.find(b=>b.id===id).vid",bid)=='https://beelup.com/v/abc123' and 'Enviar video' in pg.locator('.ov').inner_text(),'video del partido guardado con botón para enviarlo')
    ev("$$('#modal-root .ov').forEach(o=>o.remove())")
    # reportes
    ev("window.gCnV='reportes';rerender()");pg.wait_for_timeout(300)
    body=pg.inner_text('body')
    chk('Ocupación (30 días)' in body and 'Horarios más pedidos' in body and 'Clientes que más juegan' in body,'reportes: ocupación, mapa de calor y clientes')
    chk(pg.locator('.gp-heat td').count()>=7,'mapa de calor por día y hora')
    # QR
    ev("window.gCnV='grilla';rerender()");pg.click('[data-act=gCnQr]');pg.wait_for_timeout(300)
    chk('#canchas' in pg.locator('.ov').inner_text() and pg.locator('.ov svg').count()>=1,'QR con el enlace directo a la reserva')
    ev("$$('#modal-root .ov').forEach(o=>o.remove())")
    # apagar online
    pg.uncheck('#gcn-on');pg.wait_for_timeout(300)
    chk(ev("RAVE_API.site().canchas")is None,'con las reservas online apagadas la web no las muestra')
    pg.check('#gcn-on');pg.wait_for_timeout(300)
    # web pública: sección y pedido
    pg.goto('file://'+F+'#canchas');pg.wait_for_timeout(1800)
    fr=pg.frame_locator('#pubframe')
    chk(fr.locator('#canchas').is_visible(),'la web pública muestra «Reservá tu cancha»')
    chk(fr.locator('#go-cn').is_visible(),'botón «Reservar cancha» en la portada')
    fr.locator('[data-cnd]').nth(2).click();pg.wait_for_timeout(200)
    fr.locator('.cn-sl:not([disabled])').first.click();pg.wait_for_timeout(300)
    chk(fr.locator('#cn-form').is_visible() and '$' in fr.locator('#cn-sum').inner_text(),'al elegir horario aparece el resumen con precio')
    fr.locator('#cn-send').click();pg.wait_for_timeout(200)
    chk('Completá' in fr.locator('#cn-msg').inner_text(),'pide nombre y WhatsApp')
    fr.locator('#cn-n').fill('Pedro Web');fr.locator('#cn-w').fill('387 5 999 000')
    fr.locator('#cn-send').click();pg.wait_for_timeout(500)
    for x in pg.context.pages[1:]:x.close()
    pu=fr.locator('#cn-done a').get_attribute('href') or ''
    chk(pu.startswith('https://wa.me/') and 'Pedro' in pu and 'reservar' in pu,'arma el WhatsApp al club con el pedido')
    chk(ev("S.gym.pro.cres.some(b=>b.who==='Pedro Web'&&b.st==='solicitado')"),'el pedido queda en el sistema para aceptar')
    chk('Listo' in fr.locator('#cn-done').inner_text(),'confirma al cliente que se envió')
    # celular
    pg.set_viewport_size({'width':390,'height':800});pg.wait_for_timeout(400)
    chk(ev("document.getElementById('pubframe').contentDocument.documentElement.scrollWidth")<=390,'la sección entra en el celular sin desplazamiento lateral')
    pg.screenshot(path='/tmp/rave/cn_pub_m.png',full_page=False)
    chk(not errs,'sin errores de JavaScript %s'%errs[:3])
    b.close()
print('%d/%d'%(sum(res),len(res)))
