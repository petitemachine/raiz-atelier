(() => {
  const storageKey='raiz-basket-v2';
  const form=document.getElementById('order-form');
  const submit=form.querySelector('button[type="submit"]');
  const review=document.createElement('section');
  review.className='field-wide'; review.hidden=true; review.id='complete-order-review';
  review.style.cssText='padding:20px;border:1px solid #cbb49b;scroll-margin-top:160px';
  const heading=document.createElement('h3');
  const message=document.createElement('textarea'); message.readOnly=true;message.rows=15;message.setAttribute('aria-label','Complete order / Pedido completo');
  const notice=document.createElement('p');notice.setAttribute('role','status');
  const send=document.createElement('button');send.type='button';
  review.append(heading,message,notice,send);form.append(review);
  let snapshot='', orderId='', opened=false;
  // Internal navigation must stay in the same tab and therefore in the same basket.
  document.querySelectorAll('a[href^="#"][target="_blank"]').forEach(link=>link.removeAttribute('target'));
  const spanish=()=>document.documentElement.lang==='es';
  const currency=cents=>money(cents/100);
  const seasonNote=document.createElement('p');seasonNote.id='pan-season-note';seasonNote.style.cssText='padding:16px;border:1px solid var(--terracotta);font-weight:700;';
  document.getElementById('pan-de-muerto-menu').append(seasonNote);
  function updateSeason(){
    const closed=RaizSchedule.availableDates(new Date(),35,true).length===0;
    seasonNote.textContent=closed?(spanish()?'Pedidos de pan de muerto cerrados. Última horneada: 5 de noviembre de 2026.':'Pan de Muerto orders are closed. Final bake: 5 November 2026.'):(spanish()?'Última horneada de pan de muerto: jueves 5 de noviembre de 2026. Pedidos hasta el miércoles 4 de noviembre a las 18:00 (hora de Irlanda).':'Final Pan de Muerto bake: Thursday 5 November 2026. Order by Wednesday 4 November at 6 pm (Irish time).');
    document.querySelectorAll('#menu .basket-choice').forEach(choice=>{
      if(choice.dataset.name.includes('Pan de Muerto'))choice.querySelectorAll('button[aria-label^="Add one"]').forEach(button=>button.disabled=closed);
    });
  }
  const methodNote=document.createElement('p');methodNote.setAttribute('role','status');
  fulfilment.parentElement.append(methodNote);
  function totalsText(s){
    const es=spanish();
    const feeLabel=fulfilment.value==='Agreed meeting point'?(es?'Punto de encuentro':'Meeting point'):(es?'Recogida':'Collection');
    return 'Subtotal: '+currency(s.subtotal)+'\n'+(s.fee===null?(es?'Entrega: coste pendiente de confirmar':'Delivery: fee pending confirmation'):feeLabel+': '+(s.fee?currency(s.fee):(es?'GRATIS':'FREE')))+'\n'+(s.fee===null?(es?'Total sin entrega: ':'Total excluding delivery: '):'Total: ')+currency(s.total);
  }
  function renderTotals(){
    const el=document.getElementById('basket-total');el.style.whiteSpace='pre-line';
    el.textContent=cart.length?totalsText(RaizOrder.calculate(cart,fulfilment.value)):'';
  }
  function syncFulfilment(){
    const labels={
      'Collection in Cherrywood':spanish()?'Recogida en Cherrywood — GRATIS':'Collection in Cherrywood — FREE',
      'Delivery':spanish()?'Entrega a domicilio — coste por confirmar':'Local delivery — fee to be confirmed',
      'Agreed meeting point':spanish()?'Punto de encuentro — €2; gratis con 7 o más conchas':'Agreed meeting point — €2; FREE with 7+ conchas'
    };
    Array.from(fulfilment.options).forEach(option=>{const value=option.value;option.value=value;option.disabled=false;option.textContent=labels[value]||option.textContent;});
    const delivery=fulfilment.value==='Delivery';
    document.getElementById('delivery-field').hidden=!delivery;
    document.getElementById('delivery-area').required=delivery;
    methodNote.textContent=spanish()?'Domingos y jueves: recogida en Cherrywood, entrega o punto de encuentro acordado.':'Sundays and Thursdays: collection in Cherrywood, delivery or an agreed meeting point.';
    renderTotals();
  }
  dateInput.addEventListener('change',syncFulfilment);
  fulfilment.addEventListener('change',syncFulfilment);
  function remember(){try{sessionStorage.setItem(storageKey,JSON.stringify(cart));}catch{}}
  function syncQuantities(){document.querySelectorAll('#menu .basket-choice').forEach(choice=>{
    choice.querySelectorAll('output').forEach(output=>{
      const controls=output.parentElement;
      const plus=controls.querySelector('button:last-child');
      const prefix='Add one '+choice.dataset.name+' ';
      const flavour=plus.getAttribute('aria-label').slice(prefix.length);
      output.textContent=cart.find(i=>i.name===choice.dataset.name&&i.flavour===flavour)?.count||0;
    });
  });}
  const oldDraw=drawCart;
  drawCart=function(){
    oldDraw();
    const summary=RaizOrder.calculate(cart,fulfilment.value);
    const container=document.getElementById('basket-lines');container.replaceChildren();
    if(!summary.lines.length){container.textContent=spanish()?'Tu carrito está vacío.':'Your basket is empty.';}
    summary.lines.forEach(item=>{
      const row=document.createElement('div');row.className='basket-row';
      const text=document.createElement('span');text.textContent=`${item.name} · ${item.flavour} · ${item.quantity} × ${spanish()?'pieza':'piece'} · ${currency(item.cents)}`;
      const remove=document.createElement('button');remove.type='button';remove.className='basket-remove';remove.textContent=spanish()?'Quitar':'Remove';
      remove.onclick=()=>{const index=cart.findIndex(i=>i.name===item.name&&i.flavour===item.flavour);if(index>=0)cart.splice(index,1);drawCart();};
      row.append(text,remove);container.append(row);
    });
    for(const [label,amount] of [[spanish()?'Descuento pan de muerto':'Pan de Muerto discount',summary.panDiscount],[spanish()?'Descuento conchas tradicionales':'Traditional concha discount',summary.conchaDiscount]]){
      if(amount){const p=document.createElement('p');p.textContent=label+': −'+currency(amount);container.append(p);}
    }
    document.getElementById('basket-total').textContent=cart.length?'Subtotal: '+currency(summary.total):'';
    document.querySelectorAll('.cart-link').forEach(a=>a.textContent=(spanish()?'Carrito':'Basket')+' ('+summary.quantity+')');
    submit.textContent=spanish()?'Revisar pedido completo →':'Review complete order →';
    syncQuantities();remember();review.hidden=true;populateDates();updateSeason();syncFulfilment();
  };
  try{const saved=JSON.parse(sessionStorage.getItem(storageKey)||'[]');RaizOrder.calculate(saved);if(Array.isArray(saved)&&saved.length)cart.splice(0,cart.length,...saved);}catch{}
  function signature(){return JSON.stringify([cart,...['customer-name','customer-contact','preferred-date','fulfilment','delivery-area','order-details'].map(id=>document.getElementById(id).value)]);}
  buildOrderMessage=function(){
    const s=RaizOrder.calculate(cart,fulfilment.value);
    return ['RAÍZ ATELIER — ORDER REQUEST / SOLICITUD '+orderId,
      'Name: '+document.getElementById('customer-name').value.trim(),
      'Contact: '+document.getElementById('customer-contact').value.trim(),'',
      ...s.lines.map(i=>`${i.name} | ${i.flavour} | ${i.quantity} pieces | ${currency(i.cents)}`),
      ...(s.panDiscount?['Pan de Muerto discount: −'+currency(s.panDiscount)]:[]),
      ...(s.conchaDiscount?['Traditional concha discount: −'+currency(s.conchaDiscount)]:[]),
      '',s.quantity+' pieces in ONE order / piezas en UN pedido',totalsText(s),
      'Date: '+dateInput.selectedOptions[0].textContent+' ('+dateInput.value+')',
      'Method: '+(fulfilment.value==='Agreed meeting point'?'Agreed meeting point / Punto de encuentro acordado':fulfilment.value),
      ...(fulfilment.value==='Agreed meeting point'?['Meeting place and time subject to confirmation / Lugar y horario sujetos a confirmación.']:[]),
      ...(fulfilment.value==='Delivery'?['Address: '+document.getElementById('delivery-area').value.trim(),'Delivery fee pending confirmation; not included in subtotal.']:[]),
      ...(document.getElementById('order-details').value.trim()?['Notes: '+document.getElementById('order-details').value.trim()]:[]),
      'Availability and payment pending confirmation.'].join('\n');
  };
  form.addEventListener('input',()=>{review.hidden=true;});
  form.addEventListener('change',()=>{review.hidden=true;});
  form.onsubmit=event=>{
    event.preventDefault();const error=document.getElementById('order-error');error.textContent='';
    if(!cart.length){error.textContent=spanish()?'Añade productos al carrito.':'Add products to your basket.';return;}
    const conchas=RaizOrder.calculate(cart).lines.filter(i=>i.name.includes('Conchas')).reduce((n,i)=>n+i.quantity,0);
    if(conchas&&conchas<3){error.textContent=spanish()?'Elige al menos 3 conchas. Puedes combinar sabores.':'Choose at least 3 conchas. You can mix flavours.';return;}
    const requested=dateInput.value;populateDates();
    if(!requested||dateInput.value!==requested){error.textContent=spanish()?'Elige una fecha disponible.':'Choose an available date.';return;}
    syncFulfilment();
    if(!form.reportValidity())return;
    const next=signature();
    if(next!==snapshot){snapshot=next;orderId='RZ-'+Date.now().toString(36).toUpperCase();opened=false;}
    heading.textContent=spanish()?'Todo tu pedido en un solo mensaje':'Your entire order in one message';
    message.value=buildOrderMessage();
    notice.textContent=opened?(spanish()?'WhatsApp ya se abrió para esta solicitud. Si ya la enviaste, no la repitas.':'WhatsApp already opened for this request. If you sent it, do not send it again.'):(spanish()?'Comprueba que están las conchas y el pan de muerto antes de continuar.':'Check that all your conchas and Pan de Muerto are included before continuing.');
    send.textContent=spanish()?'Abrir WhatsApp con TODO el pedido':'Open WhatsApp with the COMPLETE order';send.disabled=opened;
    review.hidden=false;review.scrollIntoView({behavior:'smooth',block:'center'});
  };
  send.onclick=()=>{
    if(opened)return;
    const requested=dateInput.value;populateDates();
    if(!requested||dateInput.value!==requested){
      review.hidden=true;
      document.getElementById('order-error').textContent=spanish()?'El plazo de las 18:00 para esa fecha ya cerró. Elige otra fecha.':'The 6 pm cutoff for that date has passed. Choose another date.';
      return;
    }
    syncFulfilment();
    if(signature()!==snapshot){review.hidden=true;return;}
    const popup=window.open('https://wa.me/353873578235?text='+encodeURIComponent(message.value),'_blank');
    if(!popup){notice.textContent=spanish()?'Permite abrir WhatsApp y vuelve a intentarlo.':'Allow WhatsApp to open and try again.';return;}
    popup.opener=null;opened=true;send.disabled=true;
    notice.textContent=spanish()?'WhatsApp abierto con TODO el pedido. Pulsa Enviar allí. No necesitas enviar las conchas por separado.':'WhatsApp opened with the COMPLETE order. Tap Send there. Do not send conchas separately.';
  };
  function refreshAvailability(){
    const previous=dateInput.value;populateDates();updateSeason();syncFulfilment();
    if(previous&&previous!==dateInput.value){
      review.hidden=true;
      document.getElementById('order-error').textContent=spanish()?'El plazo de las 18:00 para esa fecha ya cerró. Elige otra fecha.':'The 6 pm cutoff for that date has passed. Choose another date.';
    }
  }
  setInterval(refreshAvailability,30000);
  window.addEventListener('focus',refreshAvailability);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshAvailability();});
  drawCart();
})();
