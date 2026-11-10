/* Parcours utilisateur de bout en bout, dans l'appli réelle (cadre). Ouvrir tests-ui.html. */
const fr=document.getElementById("app"),out=[];let fails=0;
const T=(c,m)=>{out.push((c?"OK   ":"ECHEC ")+m);if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fr.addEventListener("load",async()=>{
 await sleep(800);if(window.__r1)return;window.__r1=1;
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
  const props=cases().filter(x=>st(x)==="Proposition à accepter");let c=props.find(x=>!/tirage simulé/.test(x.textContent))||props[0];T(!/tirage simulé/.test(c.textContent),"cas choisi : autres participants non acceptés par le tirage (accord unilatéral testable)");const n=nm(c);
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
  T(/non durable/.test(c.textContent),"récurrence dite non durable");
  btn(c,"Je suis en retard").click();c=by(n);T(/aucun message réel/.test(c.textContent)&&/pas annulé/.test(c.textContent),"retard : simulé, sans annulation");
  const dc=decl();
  const sim=btn(c,"Simuler : ");sim.click();
  c=by(n);T(/recalcul/.test(c.textContent),"retrait simulé d'un autre : créneau recalculé, message affiché");
  T(!/^Confirmé/.test(st(c)),"retrait d'un autre : l'accord précédent n'est pas reporté ("+st(c)+")");
  btn(c,"Rétablir les participants").click();c=by(n);
  T(decl()>=dc-1&&decl()<=dc+1,"rétablissement : déclarés "+dc+" -> "+decl());
  c=cases().find(x=>st(x)==="Proposition à accepter"||st(x).startsWith("Accepté par vous"));
  if(c){const n2=nm(c);if(btn(c,"Refuser")){btn(c,"Refuser").click();c=by(n2);T(st(c)==="Refusé par vous","refus : "+st(c));T(!!btn(c,"Revenir"),"bouton Revenir sur ma décision");btn(c,"Revenir").click();c=by(n2);T(st(c)!=="Refusé par vous","retour après revenir : "+st(c))}}
  /* non-régression : un trajet confirmé dans un autre créneau reste confirmé quand on se retire ailleurs */
  d.querySelector("#vue-semaine .barre-outils button:last-child").click();
  const li=cases();const ps=li.map((x,i)=>[x,i]).filter(([x])=>st(x)==="Proposition à accepter");
  if(ps.length>=2){const [a]=ps[0],[b]=ps[1],na=nm(a),nb=nm(b);
   btn(a,"Accepter").click();let ca=by(na);if(btn(ca,"Simuler : les autres"))btn(ca,"Simuler : les autres").click();
   const sa=st(by(na));T(sa.startsWith("Confirmé"),"créneau A confirmé : "+sa);
   btn(by(nb),"Refuser").click();
   T(st(by(na))===sa,"se retirer du créneau B ne modifie pas le créneau A confirmé ("+st(by(na))+")");}
  T(/Comprendre la démonstration en une minute/.test(d.querySelector("#vue-dg").innerText),"aide rapide présente sur l'onglet Décision");
  const outils=()=>[...d.querySelectorAll("#vue-semaine .barre-outils button")];
  const trouve=t=>outils().find(b=>b.textContent.startsWith(t));
  T(!!trouve("Effacer mes choix simulés"),"bouton d'effacement présent");
  const avantEff=decl();trouve("Effacer mes choix simulés").click();
  T(!!trouve("Confirmer l'effacement"),"1er clic : confirmation demandée, rien d'effacé");
  T(!!trouve("Annuler"),"annulation proposée");trouve("Annuler").click();
  T(decl()===avantEff,"annulation : choix inchangés ("+decl()+")");
  trouve("Effacer mes choix simulés").click();trouve("Confirmer l'effacement").click();
  T(decl()===d0,"confirmation : choix simulés effacés, retour au scénario de base ("+decl()+" = "+d0+")");
  d.querySelector('.onglets button[data-vue="reglages"]').click();await sleep(300);
  const W=d.defaultView;let cap=null;const oldCO=W.URL.createObjectURL,oldCl=W.HTMLAnchorElement.prototype.click;
  W.URL.createObjectURL=b=>{cap=b;return "blob:fictif"};W.HTMLAnchorElement.prototype.click=function(){};
  [...d.querySelectorAll("#vue-reglages button")].find(b=>b.textContent.startsWith("Exporter l'état simulé")).click();
  await sleep(60);W.URL.createObjectURL=oldCO;W.HTMLAnchorElement.prototype.click=oldCl;
  T(!!cap,"export : un fichier JSON est produit localement, rien n'est envoyé");
  const jx=JSON.parse(await cap.text());
  T(jx.demonstration===true&&/fictif/.test(jx.avertissement),"export : état marqué fictif avec avertissement");
  T(jx.choixSimules&&jx.recurrences!==undefined&&jx.tracesDeTest!==undefined,"export : seuls choix, récurrences et traces simulés");
  T(true,"fin du parcours");
 }catch(e){T(false,"exception "+e.message)}
 out.push(fails?fails+" ECHEC(S)":"PARCOURS OK");
 document.getElementById("res").textContent=out.join("\n");
});
/* Carte : zoom +/-, point déplacé "non calculé", liste texte */
fr.addEventListener("load",async()=>{await sleep(2500);if(window.__r2)return;window.__r2=1;const out2=[];let f2=0;const U=(c,m)=>{out2.push((c?"OK   ":"ECHEC ")+m);if(!c)f2++};
 try{const d=fr.contentDocument;d.querySelector('.onglets button[data-vue="carte"]').click();const v=()=>d.querySelector("#vue-carte");
  U(!!v().querySelector("details ol.liste-carte"),"liste texte équivalente présente");
  U(v().querySelector("#z-plus")&&v().querySelector("#z-moins")&&v().querySelector("#z-reset"),"boutons Zoom +, Zoom −, Vue d'ensemble");
  const vb0=v().querySelector("svg").getAttribute("viewBox");v().querySelector("#z-plus").click();
  const vb1=v().querySelector("svg").getAttribute("viewBox");U(vb1!==vb0&&parseFloat(vb1.split(" ")[2])===768,"zoom avant change la vue ("+vb1+")");
  v().querySelector("#z-reset").click();U(v().querySelector("svg").getAttribute("viewBox")===vb0,"vue d'ensemble rétablie");
  const ch=v().querySelector("#carte-choix");
  U(/ensemble des 28 collaborateurs fictifs est visible/.test(v().textContent),"accueil carte : tous les collaborateurs affichés, dit explicitement");
  U(/Aucun trajet sélectionné/.test(v().textContent),"sans sélection : consigne affichée");
  ch.value=ch.options[1].value;ch.dispatchEvent(new Event("change"));
  U(!!v().querySelector("#detail-trajet .trajet"),"trajet choisi dans la liste : fiche détaillée sous la carte");
  U(/Décision pour|ne concerne pas|est retiré de ce créneau/.test(v().querySelector(".actions-carte").textContent),"zone de décision du trajet présente pour le profil de démonstration");
  U(/Règle des captures/.test(v().textContent),"règle des captures rappelée dans le détail");
  ch.value="";ch.dispatchEvent(new Event("change"));
  U(!v().querySelector("#detail-trajet"),"retour à tous les trajets : détail fermé");
  const trace=v().querySelector("svg polyline.trace");
  U(!!trace,"tracés cliquables présents sur la carte");
  trace.dispatchEvent(new Event("click"));
  U(!!v().querySelector("#detail-trajet .trajet"),"clic sur un tracé : trajet sélectionné, fiche affichée");
  ch.value="";ch.dispatchEvent(new Event("change"));
  const sel=v().querySelector("#dep-qui");const det=v().querySelector("details:last-of-type");
  sel.value=sel.options[1].value;sel.dispatchEvent(new Event("change"));
  U(/non calculé/.test(v().textContent),"point déplacé : texte « non calculé »");
  U(!!v().querySelector("#pt-deplace"),"marqueur du point déplacé sur la carte");
  const km0=v().textContent.match(/jusqu'au site : ([\d,]+) km/)[1];v().querySelector("#dep-n").click();
  const km1=v().textContent.match(/jusqu'au site : ([\d,]+) km/)[1];U(km0!==km1,"déplacer change seulement la distance à vol d'oiseau ("+km0+" -> "+km1+")");
  U(/ne changent pas/.test(v().textContent),"trajets et bilans inchangés, dit explicitement");
  U(/précalculé le \d{4}-\d{2}-\d{2}/.test(v().textContent),"date du précalcul affichée");
  v().querySelector("svg image").dispatchEvent(new d.defaultView.Event("error"));
  U(v().querySelector("#tuiles-ko")&&!v().querySelector("#tuiles-ko").hidden,"tuile en échec : note visible, liste texte rappelée");
  const W2=d.defaultView,date0=W2.TCROUTE.date;
  const rerend=()=>{const sel=d.querySelector("#dep-qui");sel.dispatchEvent(new W2.Event("change"))};
  W2.TCROUTE.date="2020-01-01";rerend();
  U(/plus de 6 mois/.test(v().textContent),"tracés anciens : alerte d'expiration affichée (seuil convention de démonstration, pas une garantie)");
  W2.TCROUTE.date=date0;rerend();
  U(!/plus de 6 mois/.test(v().textContent),"tracés à jour : pas d'alerte d'expiration");
  const libres=[...d.querySelectorAll("input")].filter(i=>(i.type==="text"||i.type==="search")&&!i.classList.contains("hm"));
  U(libres.length===0,"aucun champ texte libre : surface d'injection réduite, données internes rendues via textContent");
  const host=d.createElement("div"),payload="<img src=x onerror=window.__inj=1>";
  const inj=W2.TCh("p",{text:payload});host.append(inj);d.body.append(host);
  U(!W2.__inj&&host.querySelectorAll("img").length===0,"helper h() : chaîne hostile rendue inerte (aucun élément créé, aucun script)");
  U(inj.textContent===payload,"helper h() : la chaîne est affichée telle quelle, comme texte");
  host.remove();
  v().querySelector("#pt-deplace").dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowLeft",bubbles:true}));U(true,"déplacement clavier sans erreur");
 }catch(e){U(false,"exception carte "+e.message+" @ "+(e.stack||"").split("\n")[1])}
 document.getElementById("res").textContent+="\n--- carte ---\n"+out2.join("\n")+"\n"+(f2?f2+" ECHEC(S) carte":"CARTE OK");
});
/* Aléas : départ ajouté tard, passager absent, retour non assuré */
fr.addEventListener("load",async()=>{await sleep(4500);if(window.__r3)return;window.__r3=1;const o=[];let f3=0;const V=(c,m)=>{o.push((c?"OK   ":"ECHEC ")+m);if(!c)f3++};
 try{const d=fr.contentDocument;d.defaultView.sessionStorage.clear();d.querySelector('.onglets button[data-vue="semaine"]').click();
  const cases=()=>[...d.querySelectorAll("#vue-semaine .case-sem")],st=c=>c.querySelector(".puce-etat").textContent,nm=c=>c.querySelector("b").textContent;
  const btn=(c,t)=>[...c.querySelectorAll("button")].find(b=>b.textContent.startsWith(t)),by=n=>cases().find(c=>nm(c)===n);
  const before=cases().filter(c=>st(c)!=="Congé ou absent").map(c=>nm(c)+"="+st(c)).join("|");
  const conge=cases().find(c=>st(c)==="Congé ou absent");const n=nm(conge);
  btn(conge,"Ajouter un départ tard").click();
  V(/Départ ajouté tard/.test(by(n).textContent),"départ ajouté tard : explication affichée");
  const after=cases().filter(c=>nm(c)!==n&&st(c)!=="Congé ou absent").map(c=>nm(c)+"="+st(c)).join("|");
  V(after===before,"les autres créneaux de la semaine sont inchangés après l'ajout");
  btn(by(n),"Annuler cet ajout").click();V(st(by(n))==="Congé ou absent","ajout annulé");
  let c=cases().find(x=>st(x)==="Proposition à accepter"&&/Je seriez|conducteur/.test(x.textContent));
  const a=nm(c);btn(c,"Accepter").click();if(btn(by(a),"Simuler : les autres"))btn(by(a),"Simuler : les autres").click();
  const bt=btn(by(a),"Simuler : un passager est absent");
  if(bt){bt.click();V(/ne prouve pas sa faute/.test(by(a).textContent)&&/aucun droit à un paiement/.test(by(a).textContent),"passager absent : ni faute prouvée ni paiement");}
  else V(true,"le profil n'est pas conducteur sur ce créneau (cas non testé)");
 }catch(e){V(false,"exception aléas "+e.message)}
 document.getElementById("res").textContent+="\n--- aléas ---\n"+o.join("\n")+"\n"+(f3?f3+" ECHEC(S) aléas":"ALÉAS OK");
});

/* Clavier : flèches entre onglets */
fr.addEventListener("load",async()=>{await sleep(6000);if(window.__r4)return;window.__r4=1;const o=[];let f4=0;const V=(c,m)=>{o.push((c?"OK   ":"ECHEC ")+m);if(!c)f4++};
 try{const d=fr.contentDocument,W=d.defaultView,tabs=[...d.querySelectorAll(".onglets button")];
  tabs[0].focus();tabs[0].dispatchEvent(new W.KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true,cancelable:true}));
  V(d.querySelector(".onglets button.actif")===tabs[1],"flèche droite : onglet suivant actif");
  V(d.activeElement===tabs[1],"le focus suit l'onglet");
  tabs[1].dispatchEvent(new W.KeyboardEvent("keydown",{key:"ArrowLeft",bubbles:true,cancelable:true}));
  V(d.querySelector(".onglets button.actif")===tabs[0],"flèche gauche : retour au premier onglet");
  V(tabs[0].getAttribute("aria-selected")==="true"&&tabs[1].getAttribute("aria-selected")==="false","aria-selected à jour");
 }catch(e){o.push("ECHEC exception clavier : "+e.message);f4++}
 document.getElementById("res").textContent+="\n--- clavier ---\n"+o.join("\n")+"\n"+(f4?f4+" ECHEC(S) clavier":"CLAVIER OK");});

/* Saisie des heures : champ texte 24 heures, validation accessible */
fr.addEventListener("load",async()=>{await sleep(7500);if(window.__r5)return;window.__r5=1;const o=[];let f5=0;const V=(c,m)=>{o.push((c?"OK   ":"ECHEC ")+m);if(!c)f5++};
 try{const d=fr.contentDocument;d.querySelector('.onglets button[data-vue="profil"]').click();await sleep(150);
  const champs=()=>[...d.querySelectorAll("#vue-profil input.hm")];
  V(champs().length===20,"20 champs horaires au format texte (5 jours x 4 bornes)");
  const c0=champs()[0];const v0=c0.value;
  V(/^\d{2}:\d{2}$/.test(v0),"valeur initiale affichée en 24 heures ("+v0+")");
  c0.value="7h35";c0.dispatchEvent(new Event("change"));await sleep(150);
  const c0b=champs()[0];V(c0b.value==="07:35","saisie « 7h35 » normalisée en 07:35 ("+c0b.value+")");
  const c1=champs()[1];c1.value="25:99";c1.dispatchEvent(new Event("change"));await sleep(120);
  const c1b=champs()[1];
  V(c1b.classList.contains("ko")&&c1b.getAttribute("aria-invalid")==="true","heure impossible refusée, champ marqué invalide");
  const err=c1b.parentElement.querySelector(".hm-err");
  V(err&&/Heure invalide/.test(err.textContent),"message d'erreur lisible et annoncé (role alert)");
  const v1=champs()[1].value;c1b.value="06:00";c1b.dispatchEvent(new Event("change"));await sleep(120);
  V(champs()[1].classList.contains("ko")&&/après le début/.test(champs()[1].parentElement.querySelector(".hm-err").textContent),"borne de fin avant le début refusée avec explication");
 }catch(e){V(false,"exception saisie "+e.message)}
 document.getElementById("res").textContent+="\n--- saisie heures ---\n"+o.join("\n")+"\n"+(f5?f5+" ECHEC(S) saisie":"SAISIE OK");
});
/* Largeur : aucun débordement horizontal à 390 px sur chaque onglet */
fr.addEventListener("load",async()=>{await sleep(9500);if(window.__r6)return;window.__r6=1;const o=[];let f6=0;const V=(c,m)=>{o.push((c?"OK   ":"ECHEC ")+m);if(!c)f6++};
 try{fr.style.width="390px";fr.style.height="1200px";const d=fr.contentDocument;await sleep(250);
  for(const vue of ["carte","semaine","profil","controles","reglages","reel","dg"]){
   d.querySelector('.onglets button[data-vue="'+vue+'"]').click();await sleep(200);
   const sw=d.documentElement.scrollWidth,iw=d.defaultView.innerWidth;
   V(sw<=iw,"onglet "+vue+" : pas de débordement horizontal à 390 px ("+sw+" <= "+iw+")");}
  fr.style.width="320px";await sleep(250);
  for(const vue of ["carte","semaine","profil","controles","reglages","reel","dg"]){
   d.querySelector('.onglets button[data-vue="'+vue+'"]').click();await sleep(200);
   const sw=d.documentElement.scrollWidth,iw=d.defaultView.innerWidth;
   V(sw<=iw,"onglet "+vue+" : pas de débordement horizontal à 320 px ("+sw+" <= "+iw+")");}
  fr.style.width="390px";d.body.style.zoom="200%";await sleep(250);
  for(const vue of ["carte","semaine","profil","controles","reglages","reel","dg"]){
   d.querySelector('.onglets button[data-vue="'+vue+'"]').click();await sleep(200);
   const sw=d.documentElement.scrollWidth,iw=d.defaultView.innerWidth;
   V(sw<=iw,"onglet "+vue+" : zoom 200 % sans débordement horizontal ("+sw+" <= "+iw+")");}
  d.body.style.zoom="";
 }catch(e){V(false,"exception largeur "+e.message)}
 document.getElementById("res").textContent+="\n--- largeur 390px ---\n"+o.join("\n")+"\n"+(f6?f6+" ECHEC(S) largeur":"LARGEUR OK");
});

/* Stockage : un état corrompu ne casse pas l'appli */
fr.addEventListener("load",async()=>{await sleep(16000);if(window.__r7)return;window.__r7=1;const o=[];let f7=0;const V=(c,m)=>{o.push((c?"OK   ":"ECHEC ")+m);if(!c)f7++};
 try{const d=fr.contentDocument,W=d.defaultView;
  W.sessionStorage.setItem("tc_dec","<<corrompu>>");W.sessionStorage.setItem("tc_rec","{cassé");
  W.location.reload();await sleep(2000);
  const d2=fr.contentDocument;
  V(!!d2.querySelector("#vue-dg h2"),"stockage corrompu : l'application redémarre sur un état vide");
  V(!/corrompu|NaN|undefined/.test(d2.querySelector("#vue-dg").innerText),"aucune valeur corrompue affichée");
 }catch(e){V(false,"exception stockage "+e.message)}
 document.getElementById("res").textContent+="\n--- stockage ---\n"+o.join("\n")+"\n"+(f7?f7+" ECHEC(S) stockage":"STOCKAGE OK");
});
