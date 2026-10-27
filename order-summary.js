// One shared calculation for the basket, review and WhatsApp request.
(function (root) {
  function calculate(items,method='Collection in Cherrywood') {
    const units = i => i.count * (i.pack + (i.extra || 0));
    const base = {'Traditional Conchas':450,'Talavera Conchas':450,'Gourmet Butter Conchas':500,'Mazapán Conchas':500,'Oaxacan Pan de Muerto':550};
    const lines = items.map(i => {
      const quantity = units(i);
      const unit = i.name === 'Pan de Muerto' ? 650 : base[i.name];
      if (!Number.isInteger(quantity) || quantity < 1 || unit === undefined) throw Error('Invalid basket');
      return {...i, quantity, cents: quantity * unit};
    });
    const pan = lines.filter(i => i.name === 'Pan de Muerto').reduce((n,i) => n+i.quantity,0);
    const best = [0];
    for (let n=1;n<=pan;n++) best[n]=Math.min(best[n-1]+650,n>=4?best[n-4]+2400:Infinity,n>=6?best[n-6]+3500:Infinity);
    const panDiscount = pan*650-best[pan];
    // Traditional vanilla/chocolate share the four-piece price; premium varieties do not.
    const conchas = lines.filter(i => i.name === 'Traditional Conchas').reduce((n,i)=>n+i.quantity,0);
    const conchaDiscount = conchas>=4 ? conchas*50 : 0;
    const gross = lines.reduce((n,i)=>n+i.cents,0);
    const conchaQuantity=lines.filter(i=>i.name.includes('Conchas')).reduce((n,i)=>n+i.quantity,0);
    // Launch offer: collection and agreed meeting points are free for every order.
    const fee=method==='Delivery'?null:0;
    const subtotal=gross-panDiscount-conchaDiscount;
    return {lines,panDiscount,conchaDiscount,subtotal,fee,total:subtotal+(fee||0),conchaQuantity,quantity:lines.reduce((n,i)=>n+i.quantity,0)};
  }
  root.RaizOrder = {calculate};
  if(typeof module!=='undefined') module.exports = root.RaizOrder;
})(typeof window==='undefined'?globalThis:window);
