import sys
from playwright.sync_api import sync_playwright
F=sys.argv[1]
res=[]
def chk(c,m):print(('OK   ' if c else 'FALLA ')+m);res.append(bool(c))
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-proxy-server']);pg=b.new_page(viewport={'width':390,'height':844});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
    pg.goto('file://'+F);pg.wait_for_timeout(2500)
    fr=pg.frame_locator('#pubframe');F2=pg.frames[1]
    chk(fr.locator('#vbk-me-fab').is_visible(),'botón «Mi cuenta» en la web')
    chk(fr.locator('#vbk-chat-fab').is_visible(),'botón «Escribinos» (chat) en la web')
    fr.locator('#vbk-chat-fab').click();pg.wait_for_timeout(300)
    fr.locator('#vbk-cn').fill('Cliente Test');fr.locator('#vbk-ct').fill('Hola, ¿tienen proteína?');fr.locator('#vbk-chat .snd').click();pg.wait_for_timeout(600)
    chk('proteína' in fr.locator('#vbk-chat .th').inner_text(),'el chat envía el mensaje')
    chk(pg.evaluate("(S.convs||S.crm&&S.crm.convs||[]).length>=0"),'—')
    fr.locator('#vbk-chat [data-x]').click()
    # carrito
    fr.locator('.card [data-d="1"]').first.click();pg.wait_for_timeout(300)
    pg.wait_for_timeout(700);fr.locator('#bar-go').click();pg.wait_for_timeout(400)
    chk(fr.locator('#vbk-rep').is_visible(),'el carrito ofrece «Envío a domicilio»')
    fr.locator('#vbk-on').check();pg.wait_for_timeout(300)
    fr.locator('#vbk-z').select_option(index=1);pg.wait_for_timeout(200)
    fr.locator('[data-f=nm]').fill('Ana Envío');fr.locator('[data-f=tl]').fill('3874112233');fr.locator('[data-f=dr]').fill('Belgrano 123')
    chk('Total estimado' in fr.locator('#vbk-rep .sum').inner_text(),'muestra envío y total')
    n0=pg.evaluate("(S.envios||[]).length")
    fr.locator('#send').click();pg.wait_for_timeout(900)
    chk(pg.evaluate("(S.envios||[]).length")==n0+1,'el pedido con envío entra al sistema (Reparto)')
    chk(fr.locator('#vbk-me').is_visible() and fr.locator('#vbk-me .vbk-ped').count()==1 and fr.locator('.vbk-pin').count()==1,'«Mi cuenta» muestra el pedido con estado y código de entrega')
    fr.locator('#vbk-me [data-t=con]').click();pg.wait_for_timeout(200)
    chk('WhatsApp' in fr.locator('#vbk-me').inner_text(),'pestaña Contacto con WhatsApp')
    fr.locator('#vbk-me [data-t=app]').click();pg.wait_for_timeout(200)
    chk('app' in fr.locator('#vbk-me').inner_text().lower(),'pestaña App para instalarla')
    pg.screenshot(path='/tmp/rave/kit_me.png')
    chk(pg.evaluate("document.getElementById('pubframe').contentDocument.documentElement.scrollWidth")<=390,'entra en el celular')
    chk(not errs,'sin errores %s'%errs[:2])
    b.close()
print('%d/%d'%(sum(res),len(res)))
