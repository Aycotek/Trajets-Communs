/* Moteur de la démonstration : population fictive, appariement chacun son tour, bilans, règles de contrôle.
   Tout est déterministe (graine fixe) et paramétrable. Aucune donnée réelle, aucun appel réseau. */
(function(g){
const D=g.TCDATA;
const E={};
const JOURS=["Lun","Mar","Mer","Jeu","Ven"];
E.JOURS=JOURS;
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
E.rng=rng;
function hav(a,b){const R=6371,r=Math.PI/180;const dLa=(b.lat-a.lat)*r,dLo=(b.lng-a.lng)*r;const x=Math.sin(dLa/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
E.hav=hav;
E.defaults=function(){const p={};D.PARAMS.forEach(x=>p[x.k]=x.v);D.REGLES.forEach(x=>p[x.k]=x.v);return p};

/* Population fictive. Les domiciles sont des points inventés autour du centre d'une commune. */
E.population=function(n,seed){
 const R=rng(seed||2026),out=[];
 const tot=D.COMMUNES.reduce((s,c)=>s+c.w,0);
 function pickCommune(){let t=R()*tot;for(const c of D.COMMUNES){t-=c.w;if(t<=0)return c}return D.COMMUNES[0]}
 const roles=[];for(let i=0;i<n;i++)roles.push(i<Math.round(n*.43)?"conducteur":i<Math.round(n*.72)?"flexible":"passager");
 for(let i=0;i<n;i++){
  const c=pickCommune();
  const home={lat:c.lat+(R()-.5)*0.012,lng:c.lng+(R()-.5)*0.018};
  const role=roles[i];
  const win=[[465,510,1005,1050],[495,540,1020,1080],[510,555,1050,1110]][Math.floor(R()*3)];
  const presence=[1,1,1,1,1].map(()=>R()<.9?1:0);
  if(R()<.2)presence[2]=0;
  /* fenêtres : arrivée [a0,a1], départ [d0,d1], par jour (modifiable par la personne) */
  const jours=JOURS.map((_,d)=>({present:!!presence[d],a0:win[0]+Math.round((R()-.5)*10),a1:win[1]+Math.round((R()-.5)*10),d0:win[2]+Math.round((R()-.5)*10),d1:win[3]+Math.round((R()-.5)*10)}));
  let gare=null,mode="domicile";
  if(role==="passager"&&R()<.45){let best=null,bd=1e9;for(const s of D.GARES){const d=hav(home,s);if(d<bd){bd=d;best=s}}if(bd<12){gare=best;mode="gare"}}
  out.push({id:"P"+String(i+1).padStart(2,"0"),nom:"Profil "+D.NOMS[i%D.NOMS.length],commune:c.n,home,role,aVoiture:role!=="passager",mode,gare,adresse:(1+Math.floor(R()*40))+" rue fictive n°"+(i+1)+", "+c.n,jours});
 }
 return out;
};
function hm(m){m=Math.round(m);return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")}
E.hm=hm;

function ctx(p){return {p,dist:(a,b)=>hav(a,b)*p.detourFacteur,dur:km=>km/p.vitesse*60}}
function point(pers){return pers.mode==="gare"&&pers.gare?pers.gare:pers.home}

/* Évalue un groupe (conducteur + passagers ordonnés). Renvoie null si une contrainte casse. */
function evalGroup(c,dir,drv,pax,day){
 const p=c.p,site=D.SITE,stop=2;
 let best=null;
 const perms=pax.length<=1?[pax]:pax.length===2?[[pax[0],pax[1]],[pax[1],pax[0]]]:perm(pax);
 for(const order of perms){
  const pts=dir==="matin"?[drv.home,...order.map(point),site]:[site,...order.map(point),drv.home];
  let km=0;for(let i=0;i<pts.length-1;i++)km+=c.dist(pts[i],pts[i+1]);
  if(!best||km<best.km)best={km,order,pts};
 }
 const solo=c.dist(drv.home,site);
 const detour=best.km-solo;
 if(detour>p.maxDetourKm+1e-9)return null;
 const J=m=>m.jours[day];
 const all=[drv,...pax];
 let t0,tFix;
 if(dir==="matin"){const lo=Math.max(...all.map(m=>J(m).a0)),hi=Math.min(...all.map(m=>J(m).a1));if(lo>hi)return null;tFix=lo}
 else{const lo=Math.max(...all.map(m=>J(m).d0)),hi=Math.min(...all.map(m=>J(m).d1));if(lo>hi)return null;tFix=lo}
 const dur=c.dur(best.km)+stop*pax.length;
 const depart=dir==="matin"?tFix-dur:tFix, arrive=dir==="matin"?tFix:tFix+dur;
 if(depart<330||arrive>1260)return null;
 /* minutes en plus par passager */
 const extras=best.order.map((x,i)=>{
  let inCar;
  if(dir==="matin"){let k=0;for(let j=i+1;j<best.pts.length-1;j++)k+=c.dist(best.pts[j],best.pts[j+1]);const first=c.dist(best.pts[i+1],best.pts[i+2]);inCar=c.dur(k+first)+stop*(best.order.length-i-1)}
  else{let k=0;for(let j=0;j<=i;j++)k+=c.dist(best.pts[j],best.pts[j+1]);inCar=c.dur(k)+stop*(i+1)}
  const soloT=c.dur(c.dist(point(x),site));
  return {id:x.id,extra:Math.max(0,inCar-soloT)};
 });
 if(extras.some(e=>e.extra>p.maxExtraMin+1e-9))return null;
 return {km:best.km,solo,detour,order:best.order,pts:best.pts,depart,arrive,extras,dir,day,dur};
}
function perm(a){if(a.length<=1)return[a];const r=[];a.forEach((x,i)=>{perm(a.slice(0,i).concat(a.slice(i+1))).forEach(q=>r.push([x,...q]))});return r}

function metrics(c,drv,g){
 const p=c.p,site=D.SITE;
 let brut=0,prud=0,paxKm=0,paxCarless=0;
 const euros={pax:0,drv:0};
 const n=g.order.length,occ=n+1;
 const share=g.km*p.coutKm/occ;
 g.order.forEach(x=>{
  const km=c.dist(point(x),site);paxKm+=km;
  brut+=km*p.ef;
  if(x.aVoiture){prud+=km*(p.partVoiture*p.ef+(1-p.partVoiture)*p.efAlt);euros.pax+=km*(p.partVoiture*p.coutKm+(1-p.partVoiture)*p.coutAlt)-share}
  else{paxCarless++;prud+=km*p.efAlt;euros.pax+=km*p.coutAlt-share}
 });
 const add=g.detour*p.ef;
 euros.drv=g.solo*p.coutKm-(g.km*p.coutKm-n*share);
 return {brut:brut-add,prudent:prud-add,detourCO2:add,paxCarless,share,eurosPax:euros.pax,eurosDrv:euros.drv,paxKm};
}

/* Appariement "chacun son tour" : à chaque tour, un conducteur propose le meilleur ajout ; on boucle jusqu'à stabilité. */
E.match=function(pop,p,state){
 const c=ctx(p);const driven={};pop.forEach(x=>driven[x.id]=0);
 const trips=[];let id=0;
 for(let day=0;day<5;day++){
  for(const dir of["matin","soir"]){
   const present=pop.filter(x=>x.jours[day].present);
   const taken=new Set();const groups=[];
   const owners=present.filter(x=>x.aVoiture).sort((a,b)=>(driven[a.id]-driven[b.id])||a.id.localeCompare(b.id));
   const grp=new Map();
   let changed=true,rounds=0;
   while(changed&&rounds<8){
    changed=false;rounds++;
    for(const d of owners){
     if(taken.has(d.id)&&!grp.has(d.id))continue;
     const cur=grp.get(d.id)||{drv:d,pax:[],ev:null,sc:0};
     if(cur.pax.length>=p.places)continue;
     let bestAdd=null;
     for(const x of present){
      if(x.id===d.id||taken.has(x.id))continue;
      if(x.aVoiture&&x.role==="conducteur")continue;
      if(grp.has(x.id)&&grp.get(x.id).pax.length>0)continue;
      const np=[...cur.pax,x];
      const ev=evalGroup(c,dir,d,np,day);if(!ev)continue;
      const m=metrics(c,d,{...ev,order:ev.order});
      const sc=m.prudent+p.bonusAcces*m.paxCarless;
      const gain=sc-cur.sc;
      if(gain>0.05&&(!bestAdd||gain>bestAdd.gain))bestAdd={x,ev,sc,gain};
     }
     if(bestAdd){cur.pax.push(bestAdd.x);cur.ev=bestAdd.ev;cur.sc=bestAdd.sc;taken.add(d.id);taken.add(bestAdd.x.id);grp.set(d.id,cur);changed=true}
    }
   }
   grp.forEach(gv=>{if(gv.pax.length){
    const ev=gv.ev;const m=metrics(c,gv.drv,{...ev,order:ev.order});
    driven[gv.drv.id]++;
    trips.push({id:"T"+(++id),day,dir,drv:gv.drv,pax:ev.order,ev,m});
   }});
  }
 }
 return {trips,driven};
};

/* Règles de contrôle sur une trace de TEST (métriques synthétiques, pas de positions réelles). */
E.reglesEval=function(t,r){
 const f=[];
 if(t.rencontreM>r.rayonM)f.push({k:"rencontre",gr:"rejet",m:"Les deux traces ne se rejoignent pas au point de rencontre ("+Math.round(t.rencontreM)+" m, seuil "+r.rayonM+" m)."});
 if(Math.abs(t.ecartMin)>r.tolMin)f.push({k:"horaire",gr:"rejet",m:"Écart horaire de "+Math.round(Math.abs(t.ecartMin))+" min, seuil "+r.tolMin+" min."});
 if(t.copres<r.copres)f.push({k:"copres",gr:"rejet",m:"Seulement "+Math.round(t.copres*100)+" % du trajet fait ensemble, seuil "+Math.round(r.copres*100)+" %."});
 if(t.vit>r.vmax)f.push({k:"vitesse",gr:"rejet",m:"Vitesse moyenne de "+Math.round(t.vit)+" km/h, au-dessus de "+r.vmax+" km/h."});
 if(t.ratio<r.ratioMin||t.ratio>r.ratioMax)f.push({k:"distance",gr:"rejet",m:"Distance tracée / attendue = "+t.ratio.toFixed(2)+", hors de "+r.ratioMin+" à "+r.ratioMax+"."});
 if(t.appareilDouble)f.push({k:"appareil",gr:"rejet",m:"Le même appareil est lié à deux comptes."});
 if(t.trajetsJour>r.maxJour)f.push({k:"jour",gr:"rejet",m:t.trajetsJour+" trajets le même jour, maximum "+r.maxJour+"."});
 if(t.binomeSem>r.binomeSem)f.push({k:"binome",gr:"revue",m:"Même binôme "+t.binomeSem+" fois dans la semaine : revue humaine (une habitude légitime est possible)."});
 const verdict=f.some(x=>x.gr==="rejet")?"rejeté":f.length?"à vérifier":"corroboré";
 return {verdict,flags:f};
};
E.SCENARIOS={
 conforme:{l:"Trajet conforme",t:{rencontreM:40,ecartMin:2,copres:.97,vit:38,ratio:1.05,appareilDouble:false,trajetsJour:2,binomeSem:2}},
 absent:{l:"Passager jamais monté",t:{rencontreM:4200,ecartMin:1,copres:.05,vit:36,ratio:1.0,appareilDouble:false,trajetsJour:2,binomeSem:2}},
 incoherent:{l:"Trace incohérente",t:{rencontreM:60,ecartMin:3,copres:.92,vit:210,ratio:2.4,appareilDouble:false,trajetsJour:2,binomeSem:2}},
 decale:{l:"Départ décalé",t:{rencontreM:80,ecartMin:35,copres:.9,vit:34,ratio:1.1,appareilDouble:false,trajetsJour:2,binomeSem:2}},
 appareil:{l:"Un appareil pour deux comptes",t:{rencontreM:20,ecartMin:0,copres:1,vit:37,ratio:1.0,appareilDouble:true,trajetsJour:2,binomeSem:2}},
 binome:{l:"Binôme très régulier",t:{rencontreM:35,ecartMin:2,copres:.96,vit:37,ratio:1.0,appareilDouble:false,trajetsJour:2,binomeSem:10}},
 jour:{l:"Trop de trajets le même jour",t:{rencontreM:35,ecartMin:2,copres:.96,vit:37,ratio:1.0,appareilDouble:false,trajetsJour:6,binomeSem:3}}
};
E.scenarioMix=function(okRate,R){
 const bad=["absent","incoherent","decale","appareil","binome"];
 return R()<okRate?"conforme":bad[Math.floor(R()*bad.length)];
};

/* Bilan à trois niveaux : potentiel (propositions), déclaré (acceptées), corroboré (traces de test conformes). */
E.bilan=function(trips,p,seed){
 const R=rng(seed||7);
 const rules={};D.REGLES.forEach(x=>rules[x.k]=p[x.k]);
 const L={pot:blank(),dec:blank(),cor:blank()};
 const pairs={};
 trips.forEach(t=>t.pax.forEach(x=>{const k=[t.drv.id,x.id].sort().join("-");pairs[k]=(pairs[k]||0)+1}));
 trips.forEach(t=>{
  add(L.pot,t);
  t.accepte=R()<p.accept;
  const sc=E.scenarioMix(p.okTrace,R);
  const base={...E.SCENARIOS[sc].t};
  base.binomeSem=Math.max(base.binomeSem,...t.pax.map(x=>pairs[[t.drv.id,x.id].sort().join("-")]));
  t.scenario=sc;t.controle=E.reglesEval(base,rules);
  if(t.accepte){add(L.dec,t);if(t.controle.verdict==="corroboré")add(L.cor,t);}
 });
 return {L,pairs};
 function blank(){return {n:0,pax:0,paxCarless:0,brut:0,prud:0,eurPax:0,eurDrv:0,km:0,detour:0,people:new Set()}}
 function add(o,t){o.n++;o.pax+=t.pax.length;o.paxCarless+=t.m.paxCarless;o.brut+=t.m.brut;o.prud+=t.m.prudent;o.eurPax+=t.m.eurosPax;o.eurDrv+=t.m.eurosDrv;o.km+=t.ev.km;o.detour+=t.ev.detour;o.people.add(t.drv.id);t.pax.forEach(x=>o.people.add(x.id))}
};
g.TCENGINE=E;
if(typeof module!=="undefined")module.exports=E;
})(typeof window!=="undefined"?window:globalThis);
