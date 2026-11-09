/* Parcours utilisateur de bout en bout, dans l'appli réelle (cadre). Ouvrir tests-ui.html. */
const fr=document.getElementById("app"),out=[];let fails=0;
const T=(c,m)=>{out.push((c?"OK   ":"ECHEC ")+m);if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fr.addEventListener("load",async()=>{
 await sleep(800);
 try{
  const d=fr.contentDocument;d.defaultView.sessionStorage.clear();
  d.querySelector('.onglets button[data-vue="semaine"]').click();
  const cases=()=>[...d.querySelectorAll("#vue-semaine .case-sem")];
  const st=c=>c.querySelector(".puce-etat").textContent;
  const nm=c=>c.querySelector("b").textContent;
  const btn=(c,t)=>[...c.querySelectorAll("button")].find(b=>b.textContent.startsWith(t));
  const by=n=>cases().find(c=>nm(c)===n);
  const decl=()=>{const m=d.querySelector("#vue-dg").innerText;const i=m.indexOf("Trajets déclarés");return +(m.slice(i).match(/\n?\s*(\d+)/g)||[]).map(s=>s.trim())[0]||+m.slice(i,i+80).replace(/\D+/g," ").trim().split(" ")[0]};
  const d0=decl();
  const props=cases().filter(x=>st(x)==="Proposition à accepter");let c=props.find(x=>!/tirage simulé/.test(x.innerText))||props[0];T(!/tirage simulé/.test(c.innerText),"cas choisi : autres participants non acceptés par le tirage (accord unilatéral testable)");const n=nm(c);
  T(!!btn(c,"Accepter")&&!!btn(c,"Refuser"),"une proposition offre Accepter et Refuser");
  T(!c.querySelector('input[type=checkbox]'),"pas de récurrence avant acceptation");
  btn(c,"Accepter").click();c=by(n);
  const s1=st(c);T(/^(Confirmé|Accepté par vous, en attente)/.test(s1),"après accord : "+s1);
  if(s1.startsWith("Accepté par vous, en attente")){
   T(decl()===d0,"accord unilatéral : déclarés inchangés ("+d0+")");
   T(!c.querySelector('input[type=checkbox]'),"pas de récurrence tant que non confirmé");
   btn(c,"Simuler : les autres acceptent").click();c=by(n);
   T(st(c).startsWith("Confirmé"),"autres simulés acceptent : "+st(c));T(decl()===d0+1,"déclarés +1 ("+decl()+")");
  }
  const cb=c.querySelector('input[type=checkbox]');T(!!cb,"récurrence proposée une fois confirmé");cb.click();c=by(n);
  T(/pas durable/.test(c.innerText),"récurrence dite non durable");
  btn(c,"Je suis en retard").click();c=by(n);T(/aucun message réel/.test(c.innerText)&&/pas annulé/.test(c.innerText),"retard : simulé, sans annulation");
  const dc=decl();
  const sim=btn(c,"Simuler : ");sim.click();
  c=by(n);T(/recalculés/.test(c.innerText),"retrait simulé d'un autre : créneau recalculé, message affiché");
  T(!/^Confirmé/.test(st(c)),"retrait d'un autre : l'accord précédent n'est pas reporté ("+st(c)+")");
  btn(c,"Rétablir les participants").click();c=by(n);
  T(decl()>=dc-1&&decl()<=dc+1,"rétablissement : déclarés "+dc+" -> "+decl());
  c=cases().find(x=>st(x)==="Proposition à accepter"||st(x).startsWith("Accepté par vous"));
  if(c){const n2=nm(c);if(btn(c,"Refuser")){btn(c,"Refuser").click();c=by(n2);T(st(c)==="Refusé par vous","refus : "+st(c));T(!!btn(c,"Revenir"),"bouton Revenir sur ma décision");btn(c,"Revenir").click();c=by(n2);T(st(c)!=="Refusé par vous","retour après revenir : "+st(c))}}
  T(true,"fin du parcours");
 }catch(e){T(false,"exception "+e.message)}
 out.push(fails?fails+" ECHEC(S)":"PARCOURS OK");
 document.getElementById("res").textContent=out.join("\n");
});
