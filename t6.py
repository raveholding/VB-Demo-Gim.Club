from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-proxy-server']);pg=b.new_page(viewport={'width':400,'height':820})
    pg.goto('file:///tmp/gy/index.html#acceso');pg.wait_for_timeout(1800)
    pg.select_option('#lu',index=0);pg.fill('#lp','1234');pg.click('[data-act=login]');pg.wait_for_timeout(2000)
    pg.goto('file:///tmp/gy/index.html#panel/gacceso');pg.wait_for_timeout(1500)
    print(pg.evaluate("""(()=>{const c=document.querySelector('.ux-tabs');const a=c.querySelector('a.on');const s=getComputedStyle(c);return [c.scrollWidth,c.clientWidth,c.scrollLeft,s.overflowX,s.flexWrap,s.display,a.offsetLeft,c.offsetLeft,typeof mvTabsCentrar]})()"""))
    b.close()
