"use strict";
(() => {
 const get=id=>document.getElementById(id),frame=get('dashboard'),channelBytes=new Uint8Array(32);
 let channel='',child=null,childOrigin='',challenge='',client=null,connectionTimer=null,sdkTimer=null,pendingConfig=null,challengeExpires=0,verificationTimer=null,authPending=false,authAcknowledged=false,codeSent=false;
 const trustedGoogleOrigin=origin=>/^https:\/\/(?:script\.google\.com|[a-z0-9-]+\.googleusercontent\.com)$/.test(origin);
 function status(message){get('loginMessage').textContent=message;get('status').textContent=message;}
 function diagnostic(code,phase,config){get('connectionCode').textContent=code;get('connectionPhase').textContent=phase;get('connectionActual').textContent=window.location.origin;if(config?.build)get('connectionBuild').textContent=config.build;if(config?.origin)get('connectionExpected').textContent=config.origin;}
 function clearConnection(){if(connectionTimer!==null){clearTimeout(connectionTimer);connectionTimer=null;}}
 function clearVerification(){if(verificationTimer!==null){clearTimeout(verificationTimer);verificationTimer=null;}authPending=false;}
 function problem(code,message,phase='Koneksi belum siap',config){clearConnection();clearVerification();get('pagesLoading').hidden=true;get('login').hidden=false;get('googleLogin').disabled=true;get('connectionDetails').hidden=false;diagnostic(code,phase,config);status(message);}
 function setup(message){get('pagesLoading').hidden=true;get('login').hidden=true;get('setup').hidden=false;get('setupMessage').textContent=message;}
 let url;try{url=new URL(String(window.DASHBOARD_CONFIG?.appsScriptUrl||'').trim());if(url.protocol!=='https:'||url.hostname!=='script.google.com'||url.port||url.username||url.password||!/^\/(?:macros\/s|a\/macros\/[^/]+\/s)\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname))throw Error();url.hash='';}catch(_){setup('Isi appsScriptUrl pada config.js dengan URL Web App Apps Script /exec yang benar.');return;}
 if(!window.crypto?.getRandomValues){setup('Browser belum mendukung koneksi login yang aman. Gunakan browser terbaru melalui HTTPS.');return;}
 get('direct').href=url.href;get('direct').hidden=false;get('help').hidden=false;get('reload').hidden=false;
 function sendCode(response){
  if(codeSent)return;
  if(response.error||typeof response.code!=='string'){status('Login Google dibatalkan atau gagal. Silakan coba lagi.');get('googleLogin').disabled=false;return;}
  if(!child||!challenge){problem('LOGIN_CHANNEL_MISSING','Koneksi login berubah. Pilih Muat ulang koneksi.');return;}
  if(response.state&&response.state!==challenge){problem('LOGIN_STATE_MISMATCH','Jawaban Google berasal dari sesi berbeda. Pilih Muat ulang koneksi.');return;}
  codeSent=true;authPending=true;authAcknowledged=false;const attemptChannel=channel;verificationTimer=setTimeout(()=>{if(!authPending||channel!==attemptChannel)return;problem(authAcknowledged?'SERVER_VERIFICATION_TIMEOUT':'AUTH_MESSAGE_NOT_RECEIVED',authAcknowledged?'Server belum menyelesaikan verifikasi akun. Periksa Executions → authenticateDashboard pada Apps Script, lalu muat ulang koneksi.':'Apps Script belum mengonfirmasi penerimaan kode Google. Muat ulang koneksi untuk mencoba kembali.');},95000);
  diagnostic('VERIFYING','Mengirim kode Google');status('Memverifikasi akun dan hak akses…');get('googleLogin').disabled=true;child.postMessage({type:'NACS_AUTH_CODE',channel,challenge,code:response.code},childOrigin);
 }
 function prepareGoogle(config){
  pendingConfig=config;
  if(!window.google?.accounts?.oauth2){status('Apps Script tersambung. Menyiapkan tombol Google…');diagnostic('GOOGLE_SDK_LOADING','Memuat layanan Google');if(sdkTimer===null)sdkTimer=setTimeout(()=>problem('GOOGLE_SDK_UNAVAILABLE','Layanan tombol Google belum termuat. Periksa koneksi atau pemblokir pada browser, lalu pilih Muat ulang koneksi.'),15000);return;}
  if(sdkTimer!==null){clearTimeout(sdkTimer);sdkTimer=null;}
  const preparedChannel=channel,preparedChallenge=config.challenge;
  try{client=google.accounts.oauth2.initCodeClient({client_id:config.clientId,scope:'openid email profile',ux_mode:'popup',state:config.challenge,callback:response=>{if(preparedChannel===channel&&preparedChallenge===challenge)sendCode(response);},error_callback:()=>{if(codeSent||preparedChannel!==channel)return;status('Jendela Google belum terbuka atau ditutup. Izinkan popup untuk domain dashboard, lalu coba lagi.');get('googleLogin').disabled=false;}});}
  catch(_){problem('GOOGLE_CLIENT_INIT_FAILED','Tombol Google belum dapat disiapkan. Periksa Client ID tipe Web application dan Authorized JavaScript origins.');return;}
  get('googleLogin').disabled=false;diagnostic('READY','Siap masuk');status('Masuk menggunakan email yang terdaftar di AKSES_USER.');
 }
 get('googleSdk').addEventListener('load',()=>{if(pendingConfig)prepareGoogle(pendingConfig);});
 get('googleSdk').addEventListener('error',()=>problem('GOOGLE_SDK_UNAVAILABLE','Layanan tombol Google tidak dapat dimuat. Periksa koneksi atau pemblokir pada browser, lalu pilih Muat ulang koneksi.'));
 function openFrame(){
  clearConnection();clearVerification();codeSent=false;authAcknowledged=false;if(sdkTimer!==null){clearTimeout(sdkTimer);sdkTimer=null;}
  crypto.getRandomValues(channelBytes);channel=Array.from(channelBytes,b=>b.toString(16).padStart(2,'0')).join('');child=null;childOrigin='';challenge='';client=null;pendingConfig=null;challengeExpires=0;
  get('login').hidden=true;get('pagesLoading').hidden=false;get('connectionDetails').hidden=true;get('connectionBuild').textContent='Belum diterima';get('connectionExpected').textContent='Belum diterima';get('googleLogin').disabled=true;diagnostic('CONNECTING','Menunggu halaman Google');
  connectionTimer=setTimeout(()=>problem('APPS_SCRIPT_NO_RESPONSE','Halaman login Apps Script belum mengirim respons. Buka tautan Buka langsung pada bantuan (?), lalu pastikan URL /exec memakai deployment terbaru yang sudah selesai dan dapat dibuka pengguna.'),45000);
  frame.hidden=false;const target=new URL(url.href);target.searchParams.set('authChannel',channel);target.searchParams.set('uiBuild','ui-3010-r15');frame.src=target.href;
 }
 window.addEventListener('message',event=>{
  const data=event.data;if(!data||data.channel!==channel||!event.source||!trustedGoogleOrigin(event.origin))return;
  if(child&&(event.source!==child||event.origin!==childOrigin))return;
  if(data.type==='NACS_BRIDGE_STATUS'){
   child=event.source;childOrigin=event.origin;clearConnection();diagnostic(data.phase==='recovering'?'LOGIN_CONFIG_RECOVERING':'HTML_RECEIVED',data.phase==='recovering'?'Membaca konfigurasi login':'Halaman Apps Script diterima',data);
   if(data.origin&&data.origin!==window.location.origin){problem('APP_ORIGIN_MISMATCH','Domain yang dibuka ('+window.location.origin+') berbeda dari AUTH_APP_ORIGIN ('+data.origin+'). Samakan keduanya beserta Authorized JavaScript origins di Google Cloud.','Domain berbeda',data);return;}
   const issue=data.issues?.[0];
   if(data.phase==='error'||issue||data.configured===false){problem(data.code||issue?.code||'LOGIN_CONFIG_INCOMPLETE',data.message||issue?.message||'Konfigurasi login belum lengkap. Jalankan cekKoneksiLoginDashboard dari editor.','Periksa konfigurasi',data);return;}
   connectionTimer=setTimeout(()=>problem('APP_INIT_TIMEOUT','Halaman Apps Script diterima, tetapi persiapan login belum selesai. Jalankan cekKoneksiLoginDashboard dan pastikan Code.gs serta Index.html versi terbaru sudah di-deploy.'),90000);return;
  }
  if(data.type==='NACS_AUTH_READY'){
   clearConnection();const config=data.config;
   if(config?.origin!==window.location.origin){problem('APP_ORIGIN_MISMATCH','AUTH_APP_ORIGIN harus sama dengan '+window.location.origin+'. Periksa domain yang sedang dibuka.','Domain berbeda',config);return;}
   if(!/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/.test(config.clientId||'')){problem('CLIENT_ID_INVALID','Client ID belum lengkap. Nilainya harus berakhiran .apps.googleusercontent.com.');return;}
   if(!/^[a-f0-9]{64}$/.test(config.challenge||'')){problem('LOGIN_CHALLENGE_INVALID','Sesi persiapan login tidak valid. Perbarui Code.gs dan Index.html, lalu deploy New version.');return;}
   child=event.source;childOrigin=event.origin;challenge=config.challenge;challengeExpires=config.expiresAt||0;get('pagesLoading').hidden=true;get('login').hidden=false;diagnostic('GOOGLE_SDK_LOADING','Menyiapkan tombol Google',config);prepareGoogle(config);
  }else if(data.type==='NACS_AUTH_PROGRESS'&&event.source===child&&event.origin===childOrigin&&authPending){authAcknowledged=true;diagnostic('SERVER_VERIFYING','Memeriksa akun di Apps Script');status('Memeriksa akun dan hak akses di Apps Script…');}
  else if(data.type==='NACS_AUTH_OK'&&event.source===child&&event.origin===childOrigin&&authPending){clearVerification();get('login').hidden=true;get('pagesLoading').hidden=true;diagnostic('SIGNED_IN','Berhasil masuk');status('Dashboard siap.');}
  else if(data.type==='NACS_AUTH_ERROR'&&(!child||event.source===child)){problem('AUTHENTICATION_FAILED',String(data.message||'Login gagal. Pilih Muat ulang koneksi untuk mencoba lagi.'));}
  else if(data.type==='NACS_AUTH_LOGOUT'&&event.source===child&&event.origin===childOrigin){google.accounts?.id?.disableAutoSelect?.();openFrame();}
 });
 get('googleLogin').addEventListener('click',()=>{if(!client||!child)return;if(challengeExpires&&Date.now()>=challengeExpires){problem('LOGIN_PREPARATION_EXPIRED','Persiapan login sudah kedaluwarsa. Pilih Muat ulang koneksi, lalu masuk kembali.');return;}try{client.requestCode();}catch(_){problem('GOOGLE_POPUP_FAILED','Jendela Google belum dapat dibuka. Izinkan popup untuk domain ini, lalu muat ulang koneksi.');}});
 get('loginRetry').addEventListener('click',openFrame);get('reload').addEventListener('click',openFrame);openFrame();
})();
