import { exportModel, type ExportInput, type ExportModel, type ExportZone } from './model';
import { cssVariables, type Palettes } from './palette';
import { mapSvg, xml } from './svg';

/** Tokens mapa.html uses; both themes go in, following the reader's system (ux-ui 5). */
const TOKENS = [
  'bg',
  'surface',
  'text',
  'muted',
  'faint',
  'border',
  'border-strong',
  'fill',
  'fill-strong',
  'map-item',
  'warning',
  'danger',
  'ring',
  'brand-from',
  'brand-to',
  'zone-method',
  'zone-tools',
  'zone-ui',
  'zone-app',
  'zone-data',
  'zone-env',
  'zone-infra',
  'zone-security',
  'zone-observability',
] as const;

const STYLE = `
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{display:flex;flex-direction:column;background:var(--bg);color:var(--text);font:14px/1.5 Geist,'Geist Variable',ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
header{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px 24px;padding:20px 24px 16px;border-bottom:1px solid var(--border)}
h1{margin:0;font-size:24px;line-height:1.2;font-weight:600;letter-spacing:-0.01em}
header p{margin:4px 0 0;color:var(--muted);max-width:60ch}
.tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.segmented{display:inline-flex;padding:3px;gap:2px;border-radius:10px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}
button{font:inherit;color:inherit;cursor:pointer;min-height:32px;padding:0 12px;border-radius:8px;border:0;background:transparent}
button:hover{background:var(--fill-strong)}
button[aria-pressed=true]{background:var(--surface);box-shadow:inset 0 0 0 1px var(--border-strong);font-weight:500}
.ghost{box-shadow:inset 0 0 0 1px var(--border-strong);min-width:32px;padding:0 10px}
:focus-visible{outline:2px solid var(--ring);outline-offset:2px}
main{position:relative;flex:1;min-height:0;display:flex}
.canvas{position:relative;flex:1;overflow:hidden;cursor:grab;touch-action:none}
.canvas.dragging{cursor:grabbing}
.stage{position:absolute;left:0;top:0;transform-origin:0 0}
.stage svg{display:block}
.item{cursor:pointer}
.item:focus{outline:none}
.item:focus-visible rect{stroke:var(--ring);stroke-width:2}
.zone,.item,.edge{transition:opacity 150ms}
.filtering .zone:not(.on),.filtering .item:not(.on),.filtering .edge:not(.on){opacity:.18}
.flowing .edge:not(.on),.flowing .item:not(.on){opacity:.2}
.flowing .edge.on{stroke:var(--brand-to);stroke-opacity:1;stroke-width:2.5}
aside{width:320px;max-width:100%;border-left:1px solid var(--border);background:var(--surface);padding:20px;overflow:auto}
aside h2{margin:0 0 4px;font-size:17px;font-weight:600}
aside .meta{margin:0 0 12px;color:var(--muted);font-size:13px}
aside h3{margin:16px 0 6px;font-size:12px;font-weight:500;color:var(--faint);text-transform:uppercase;letter-spacing:.08em}
aside ul{margin:0;padding-left:18px}
aside .close{float:right;margin:-6px -6px 0 0}
nav{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;padding:10px 24px;border-top:1px solid var(--border)}
nav .group{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
nav .label{color:var(--faint);font-size:12px;margin-right:4px}
nav button{min-height:32px;font-size:13px;color:var(--muted)}
nav button[aria-pressed=true]{color:var(--text)}
.dot{display:inline-block;width:8px;height:8px;border-radius:999px;margin-right:6px;vertical-align:middle}
footer{padding:8px 24px 14px;color:var(--faint);font-size:12px}
[hidden]{display:none!important}
@media (max-width:759px){header{padding:12px 16px}h1{font-size:20px}.canvas{min-height:220px}aside{position:absolute;inset:auto 0 0 0;width:auto;max-height:60%;border-left:0;border-top:1px solid var(--border);border-radius:20px 20px 0 0}nav{flex-wrap:nowrap;overflow-x:auto;padding:6px 16px;scrollbar-width:none}nav .group{flex-wrap:nowrap}nav button{white-space:nowrap}footer{padding:4px 16px 10px}button{min-height:44px}}
@media (prefers-reduced-motion:reduce){.zone,.item,.edge{transition:none}}
`;

/** Read-only viewer: drag, zoom, Hoje/Completo, flows, zone highlight, item details. */
const SCRIPT = `
(function(){
var data=JSON.parse(document.getElementById('map-data').textContent);
var canvas=document.getElementById('canvas');
var views=[].slice.call(document.querySelectorAll('.stage'));
var stage=views[0];var scale=1,x=0,y=0,drag=null,flow=-1,zones={};
function apply(){stage.style.transform='translate('+x+'px,'+y+'px) scale('+scale+')';}
function fit(){var svg=stage.querySelector('svg');var w=Number(svg.getAttribute('width')),h=Number(svg.getAttribute('height'));var cw=canvas.clientWidth||w,ch=canvas.clientHeight||h;scale=Math.min(1,cw/w,ch/h)||1;x=(cw-w*scale)/2;y=Math.max(0,(ch-h*scale)/2);apply();}
function zoom(f,cx,cy){var n=Math.min(2.5,Math.max(0.2,scale*f));if(cx===undefined){cx=canvas.clientWidth/2;cy=canvas.clientHeight/2;}x=cx-(cx-x)*(n/scale);y=cy-(cy-y)*(n/scale);scale=n;apply();}
canvas.addEventListener('pointerdown',function(e){if(e.target.closest('.item'))return;drag={px:e.clientX,py:e.clientY,x:x,y:y};canvas.classList.add('dragging');canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',function(e){if(!drag)return;x=drag.x+e.clientX-drag.px;y=drag.y+e.clientY-drag.py;apply();});
function stop(){drag=null;canvas.classList.remove('dragging');}
canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
canvas.addEventListener('wheel',function(e){e.preventDefault();var r=canvas.getBoundingClientRect();zoom(e.deltaY<0?1.1:1/1.1,e.clientX-r.left,e.clientY-r.top);},{passive:false});
canvas.addEventListener('keydown',function(e){var k=e.key;if(k==='+'||k==='=')zoom(1.2);else if(k==='-')zoom(1/1.2);else if(k==='0')fit();else if(k==='ArrowLeft'){x+=40;apply();}else if(k==='ArrowRight'){x-=40;apply();}else if(k==='ArrowUp'){y+=40;apply();}else if(k==='ArrowDown'){y-=40;apply();}else return;e.preventDefault();});
document.getElementById('zoom-in').onclick=function(){zoom(1.2);};
document.getElementById('zoom-out').onclick=function(){zoom(1/1.2);};
document.getElementById('zoom-fit').onclick=fit;
function press(list,on){list.forEach(function(b){b.setAttribute('aria-pressed',String(b===on));});}
var viewButtons=[].slice.call(document.querySelectorAll('[data-view-button]'));
viewButtons.forEach(function(b){b.onclick=function(){views.forEach(function(v){v.hidden=v.getAttribute('data-view')!==b.getAttribute('data-view-button');});stage=views.filter(function(v){return !v.hidden;})[0];press(viewButtons,b);paint();fit();};});
var flowButtons=[].slice.call(document.querySelectorAll('[data-flow]'));
flowButtons.forEach(function(b){b.onclick=function(){var i=Number(b.getAttribute('data-flow'));flow=flow===i?-1:i;flowButtons.forEach(function(o){o.setAttribute('aria-pressed',String(Number(o.getAttribute('data-flow'))===flow));});paint();};});
var zoneButtons=[].slice.call(document.querySelectorAll('[data-zone-button]'));
zoneButtons.forEach(function(b){b.onclick=function(){var z=b.getAttribute('data-zone-button');zones[z]=!zones[z];b.setAttribute('aria-pressed',String(!!zones[z]));paint();};});
function paint(){views.forEach(function(v){var picked=Object.keys(zones).filter(function(z){return zones[z];});v.classList.toggle('filtering',picked.length>0);[].forEach.call(v.querySelectorAll('.zone'),function(g){g.classList.toggle('on',picked.indexOf(g.getAttribute('data-zone'))>=0);});var inZone={};picked.forEach(function(z){(data.zoneItems[z]||[]).forEach(function(n){inZone[n]=true;});});[].forEach.call(v.querySelectorAll('.item'),function(g){g.classList.toggle('on',!!inZone[g.getAttribute('data-item')]||(flow>=0&&data.flows[flow].items.indexOf(g.getAttribute('data-item'))>=0));});var pairs=flow>=0?data.flows[flow].pairs:[];v.classList.toggle('flowing',flow>=0);[].forEach.call(v.querySelectorAll('.edge'),function(p){var ends=p.getAttribute('data-ends');var on=pairs.indexOf(ends)>=0;if(!on&&picked.length){var e=ends.split(' ');on=!!inZone[e[0]]&&!!inZone[e[1]];}p.classList.toggle('on',on);});});}
var aside=document.getElementById('details');
function text(id,value){var el=document.getElementById(id);el.textContent=value||'';el.hidden=!value;}
function list(id,values){var ul=document.getElementById(id);ul.textContent='';values.forEach(function(v){var li=document.createElement('li');li.textContent=v;ul.appendChild(li);});ul.parentNode.hidden=values.length===0;}
var opener=null;
function open(ref,from){var item=data.items[ref];if(!item)return;opener=from;text('d-name',item.name);text('d-meta',item.meta);text('d-choice',item.choice);text('d-description',item.description);list('d-notes',item.notes);aside.hidden=false;document.getElementById('d-close').focus();}
function close(){aside.hidden=true;if(opener)opener.focus();}
document.getElementById('d-close').onclick=close;
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!aside.hidden)close();});
[].forEach.call(document.querySelectorAll('.item'),function(g){g.addEventListener('click',function(){open(g.getAttribute('data-item'),g);});g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(g.getAttribute('data-item'),g);}});});
window.addEventListener('resize',fit);
fit();
})();
`;

/** JSON inside a script tag: nothing can close the tag early. */
const scriptJson = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/[\u2028\u2029]/g, ' ');

/**
 * RN 19: mapa.html, one file to publish or send. Read-only and interactive (drag, zoom,
 * zones, flows, Hoje/Completo), with no network, no variable values, no private notes
 * and nothing from other projects.
 */
export function mapHtml(input: ExportInput, palettes: Palettes): string {
  const { t, language } = input;
  const today = exportModel({ ...input, options: { ...input.options, futures: false } });
  const complete: ExportModel | undefined = input.options.futures ? exportModel(input) : undefined;
  const widest = complete ?? today;
  const paint = (token: string) => `var(--${token})`;
  const svgFor = (model: ExportModel, prefix: string) =>
    mapSvg(
      { ...input, options: { ...input.options, futures: model.view === 'complete' } },
      { paint, title: false, idPrefix: prefix, interactive: true },
      model,
    ).svg;

  const zoneItems = Object.fromEntries(
    widest.zones.map((zone) => {
      const inside = (z: ExportZone): string[] => [
        ...z.items.map((i) => i.ref),
        ...widest.zones.filter((child) => child.parentId === z.id).flatMap(inside),
      ];
      return [zone.ref, inside(zone)];
    }),
  );
  const refs = new Map(widest.items.map((item) => [item.id, item.ref]));
  // Model connections only join items of the same model, so both refs exist.
  const pairOf = new Map(
    widest.connections.map((c) => [c.id, `${refs.get(c.from)} ${refs.get(c.to)}`]),
  );
  const flows = widest.flows
    .map((flow) => {
      const pairs = flow.connections.map((id) => pairOf.get(id) as string);
      return {
        name: flow.name,
        pairs,
        items: [...new Set(pairs.flatMap((pair) => pair.split(' ')))],
      };
    })
    .filter((flow) => flow.pairs.length > 0);
  const items = Object.fromEntries(
    widest.items.map((item) => {
      const status = item.notApplicable
        ? t('mapItem.status.notApplicable')
        : t(`mapItem.status.${item.status}`);
      const notes = [
        ...item.notes,
        ...item.risks.map((risk) => `${t(`status.severity.${risk.severity}`)} · ${risk.text}`),
      ];
      return [
        item.ref,
        {
          name: item.name,
          meta: `${item.zone} · ${status}`,
          choice: item.choice && item.choice !== item.name ? item.choice : '',
          description: item.description ?? '',
          notes,
        },
      ];
    }),
  );

  const topZones = widest.zones.filter(
    (zone) => zone.parentId === null && zoneItems[zone.ref]?.length,
  );
  const view = (model: ExportModel, prefix: string, hidden: boolean) =>
    `<div class="stage" data-view="${model.view}"${hidden ? ' hidden' : ''}>${svgFor(model, prefix)}</div>`;

  return `<!doctype html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="Prólogos">
<title>${xml(t('files.html.title', { name: widest.name }))}</title>
<style>
:root{color-scheme:dark;${cssVariables(palettes.dark, TOKENS)}}
@media (prefers-color-scheme: light){:root{color-scheme:light;${cssVariables(palettes.light, TOKENS)}}}
${STYLE.trim()}
</style>
</head>
<body>
<header>
<div><h1>${xml(widest.name)}</h1>${widest.goal ? `<p>${xml(widest.goal)}</p>` : ''}</div>
<div class="tools" role="toolbar" aria-label="${xml(t('files.html.tools'))}">
${
  complete
    ? `<div class="segmented" role="group" aria-label="${xml(t('files.html.view'))}"><button type="button" data-view-button="today" aria-pressed="false">${xml(t('files.view.today'))}</button><button type="button" data-view-button="complete" aria-pressed="true">${xml(t('files.view.complete'))}</button></div>`
    : ''
}
<button type="button" class="ghost" id="zoom-out" aria-label="${xml(t('files.html.zoomOut'))}">−</button>
<button type="button" class="ghost" id="zoom-fit">${xml(t('files.html.fit'))}</button>
<button type="button" class="ghost" id="zoom-in" aria-label="${xml(t('files.html.zoomIn'))}">+</button>
</div>
</header>
<main>
<div class="canvas" id="canvas" tabindex="0" role="application" aria-label="${xml(t('files.html.canvas'))}" aria-roledescription="${xml(t('files.html.canvasRole'))}">
${complete ? `${view(complete, 'c-', false)}\n${view(today, 't-', true)}` : view(today, 't-', false)}
</div>
<aside id="details" hidden aria-labelledby="d-name">
<button type="button" class="ghost close" id="d-close" aria-label="${xml(t('files.html.close'))}">×</button>
<h2 id="d-name"></h2>
<p class="meta" id="d-meta"></p>
<p id="d-choice"></p>
<p id="d-description"></p>
<div><h3>${xml(t('files.html.notes'))}</h3><ul id="d-notes"></ul></div>
</aside>
</main>
<nav aria-label="${xml(t('files.html.legend'))}">
<div class="group" role="group" aria-label="${xml(t('files.html.zones'))}"><span class="label">${xml(t('files.html.zones'))}</span>${topZones
    .map(
      (zone) =>
        `<button type="button" data-zone-button="${zone.ref}" aria-pressed="false"><span class="dot" style="background:var(--zone-${zone.color})"></span>${xml(zone.name)}</button>`,
    )
    .join('')}</div>
${
  flows.length > 0
    ? `<div class="group" role="group" aria-label="${xml(t('files.html.flows'))}"><span class="label">${xml(t('files.html.flows'))}</span>${flows
        .map(
          (flow, index) =>
            `<button type="button" data-flow="${index}" aria-pressed="false">${xml(flow.name)}</button>`,
        )
        .join('')}</div>`
    : ''
}
</nav>
<footer>${xml(t('files.html.footer'))}</footer>
<script type="application/json" id="map-data">${scriptJson({ items, flows, zoneItems })}</script>
<script>${SCRIPT.trim()}</script>
</body>
</html>
`;
}
