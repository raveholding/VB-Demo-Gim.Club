from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-proxy-server'])
    for f,pin,tag in [('/tmp/gy/index.html','1234','gym'),('/tmp/sa/index.html','1111','sal')]:
        pg=b.new_page(viewport={'width':400,'height':820})
        pg.on('pageerror',lambda e:errs.append(tag+str(e)[:200]))
        pg.goto('file://'+f+'#acceso');pg.wait_for_timeout(1800)
        pg.select_option('#lu',index=0);pg.fill('#lp',pin);pg.click('[data-act=login]');pg.wait_for_timeout(2500)
        vis=pg.evaluate("[...document.querySelectorAll('#vb-tab button')].filter(b=>!b.hidden).map(b=>b.dataset.id).join(',')")
        pg.screenshot(path='/tmp/gy/%s.png'%tag)
        pg.click('#vb-tab button[data-id=_mas]');pg.wait_for_timeout(300);o=pg.evaluate("document.querySelector('#side').classList.contains('open')")
        pg.mouse.click(380,450);pg.wait_for_timeout(300);c=pg.evaluate("document.querySelector('#side').classList.contains('open')")
        btn=[x for x in vis.split(',') if x!='_mas'][1]
        pg.click('#vb-tab button[data-id=%s]'%btn);pg.wait_for_timeout(800)
        print(tag,vis,o,c,pg.evaluate("location.hash"));pg.screenshot(path='/tmp/gy/%s2.png'%tag);pg.close()
    b.close()
print(errs)
