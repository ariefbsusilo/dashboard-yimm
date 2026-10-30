"use strict";
(() => {
 const get=id=>document.getElementById(id),frame=get('dashboard'),channelBytes=new Uint8Array(32);
 let channel='',child=null,childOrigin='',challenge='',client=null,connectionTimer=null;
 function setup(message){get('pagesLoading').hidden=true;get('login').hidden=true;get('setup').hidden=false;get('setupMessage').textContent=message;}
 let url;try{url=new URL(String(window.DASHBOARD_CONFIG?.appsScriptUrl||'').trim());if(url.protocol!=='https:'||url.hostname!=='script.google.com'||url.port||url.username||url.password||!/^\/(?:macros\/s|a\/macros\/[^/]+\/s)\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname))throw Error();url.hash='';}catch(_){setup('Isi appsScriptUrl pada config.js dengan URL Web App Apps Script /exec yang benar.');return;}
 if(!window.crypto?.getRandomValues){setup('Browser belum mendukung koneksi login yang aman. Gunakan browser terbaru melalui HTTPS.');return;}
 get('direct').href=url.href;get('direct').hidden=false;get('help').hidden=false;get('reload').hidden=false;
 function status(message){get('loginMessage').textContent=message;get('status').textContent=message;}
 function sendCode(response){if(response.error||typeof response.code!=='string'){status('Login dibatalkan atau gagal. Silakan coba lagi.');get('googleLogin').disabled=false;return;}status('Memverifikasi akun dan hak akses…');get('googleLogin').disabled=true;child.postMessage({type:'NACS_AUTH_CODE',channel,challenge,code:response.code},childOrigin);}
 function prepareGoogle(config){
  if(!window.google?.accounts?.oauth2){status('Menyiapkan tombol Google…');return;}
  client=google.accounts.oauth2.initCodeClient({client_id:config.clientId,scope:'openid email profile',ux_mode:'popup',state:config.challenge,callback:sendCode,error_callback:()=>{status('Jendela Google belum terbuka atau ditutup. Klik Masuk dengan Google untuk mencoba lagi.');get('googleLogin').disabled=false;}});
  get('googleLogin').disabled=false;status('Masuk menggunakan email yang terdaftar di AKSES_USER.');
 }
 function openFrame(){
  if(connectionTimer!==null)clearTimeout(connectionTimer);connectionTimer=setTimeout(()=>{get('pagesLoading').hidden=true;get('login').hidden=false;status('Koneksi login belum siap. Periksa konfigurasi OAuth pada Apps Script atau pilih Muat ulang koneksi.');},20000);
  crypto.getRandomValues(channelBytes);channel=Array.from(channelBytes,b=>b.toString(16).padStart(2,'0')).join('');child=null;childOrigin='';challenge='';client=null;get('login').hidden=true;get('pagesLoading').hidden=false;get('googleLogin').disabled=true;frame.hidden=false;const target=new URL(url.href);target.searchParams.set('authChannel',channel);frame.src=target.href;
 }
 window.addEventListener('message',event=>{
  const data=event.data;
  if(!data||data.channel!==channel||!event.source||!/^https:\/\/(?:script\.google\.com|[a-z0-9-]+\.googleusercontent\.com)$/.test(event.origin))return;
  if(data.type==='NACS_AUTH_READY'){
   if(connectionTimer!==null){clearTimeout(connectionTimer);connectionTimer=null;}
   const config=data.config;if(config?.origin!==window.location.origin||!/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/.test(config.clientId||'')||!/^[a-f0-9]{64}$/.test(config.challenge||'')){setup('AUTH_APP_ORIGIN pada Apps Script harus sama dengan alamat situs yang sedang dibuka. Periksa panduan pemasangan.');return;}
   if(child&&event.source!==child)return;child=event.source;childOrigin=event.origin;challenge=config.challenge;get('pagesLoading').hidden=true;get('login').hidden=false;
   prepareGoogle(config);if(!window.google?.accounts?.oauth2)get('googleSdk').addEventListener('load',()=>prepareGoogle(config),{once:true});
  }else if(data.type==='NACS_AUTH_OK'&&event.source===child&&event.origin===childOrigin){get('login').hidden=true;get('pagesLoading').hidden=true;status('Dashboard siap.');}
  else if(data.type==='NACS_AUTH_ERROR'&&(!child||event.source===child)){if(connectionTimer!==null){clearTimeout(connectionTimer);connectionTimer=null;}get('pagesLoading').hidden=true;get('login').hidden=false;status(String(data.message||'Login gagal. Muat ulang tampilan untuk mencoba lagi.'));get('googleLogin').disabled=true;}
  else if(data.type==='NACS_AUTH_LOGOUT'&&event.source===child&&event.origin===childOrigin){google.accounts?.id?.disableAutoSelect?.();openFrame();}
 });
 get('googleLogin').addEventListener('click',()=>{if(!client||!child)return;client.requestCode();});
 get('loginRetry').addEventListener('click',openFrame);get('reload').addEventListener('click',openFrame);openFrame();
})();
