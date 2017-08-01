!function(name,path,ctx){
  var latest,prev=name!=='Keen'&&window.Keen?window.Keen:false;ctx[name]=ctx[name]||{ready:function(fn){var h=document.getElementsByTagName('head')[0],s=document.createElement('script'),w=window,loaded;s.onload=s.onerror=s.onreadystatechange=function(){if((s.readyState&&!(/^c|loade/.test(s.readyState)))||loaded){return}s.onload=s.onreadystatechange=null;loaded=1;latest=w.Keen;if(prev){w.Keen=prev}else{try{delete w.Keen}catch(e){w.Keen=void 0}}ctx[name]=latest;ctx[name].ready(fn)};s.async=1;s.src=path;h.parentNode.insertBefore(s,h)}}
}('KeenTracking','https://d26b395fwzu5fz.cloudfront.net/keen-tracking-1.1.4.min.js',this);

KeenTracking.ready(function() {
  var meta = new KeenTracking({
    projectId: '5368fa5436bf5a5623000000',
    writeKey: '725f3a571824d9c29f6e4d1c39af349a114d9034f8e493f95d39802529e2ccbb174033077bdcf10b541dbb50c20105922c59bbe1fe7741cb4b632dd0bc84fe98c0b591e17da3d429ef867cc674be0ad20ad768a5210662d2d18ff5492f37a1f91ce697a5489064bb3fa95c827b6cb394'
  });
  meta.recordEvent('visits', {
    page: {
      title: document.title,
      host: document.location.host,
      href: document.location.href,
      path: document.location.pathname,
      protocol: document.location.protocol.replace(/:/g, ''),
      query: document.location.search
    },
    visitor: {
      referrer: document.referrer,
      ip_address: '${keen.ip}',
      // tech: {} //^ created by ip_to_geo add-on
      user_agent: '${keen.user_agent}'
      // visitor: {} //^ created by ua_parser add-on
    },
    keen: {
      timestamp: new Date().toISOString(),
      addons: [
        { name:'keen:ip_to_geo', input: { ip:'visitor.ip_address' }, output:'visitor.geo' },
        { name:'keen:ua_parser', input: { ua_string:'visitor.user_agent' }, output:'visitor.tech' }
      ]
    }
  });
});
