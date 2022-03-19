window.addEventListener('message', async e => {

const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

 let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?master.m3u8/;
 let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?master.m3u8/;
 let allorigins = "https://crp-proxy.herokuapp.com/get?url=";

 let video_config_media = await getStreams(e.data.config_media);
 let url = e.data.href;
 let video_mp4_array = [];
 let user_lang = 'es-LA';
 let sources = [];

 console.log(video_config_media)

 const streamlist = video_config_media['streams']
 video_mp4_array = mp4ListFromStream(streamlist.adaptive_hls[user_lang].url);

 for (let idx of [1, 0, 2, 3, 4])
  sources.push({ file: video_mp4_array[idx], label: r[idx] + (idx < 2 ? '<sup><sup>HD</sup></sup>' : '') });
 startPlayer();

function linkDownload(id, tentativas = 0) {
    console.log('  - Baixando: ', r[id])
    let video_mp4_url = video_mp4_array[id];

    let fileSize = "";
    let http = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
    http.onreadystatechange = () => {
      if (http.readyState == 4 && http.status == 200) {
        fileSize = http.getResponseHeader('content-length');
        if (!fileSize)
          return setTimeout(() => linkDownload(id), 5000);
        else {
          let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
          if (fileSize == 0) return console.log('addSource#fileSize == 0');
          let i = parseInt(Math.floor(Math.log(fileSize) / Math.log(1024)));
          if (i == 0) return console.log('addSource#i == 0');
          let return_fileSize = (fileSize / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
          dlSize[id].innerText = return_fileSize;
          return console.log(`[CR Premium] Source adicionado: ${r[id]} (${return_fileSize})`);
        }
      } else if (http.readyState == 4 && tentativas < 3)
        return setTimeout(() => linkDownload(id, tentativas + 1), 5000);
    }
    http.open("HEAD", video_mp4_url, true);
    http.send(null);
  }

 function startPlayer() {

  let playerInstance = jwplayer('player_div')
  playerInstance.setup({
   'playlist': [{
    'sources': sources,
  }]
  })

let download_iconPath = "assets/icon/download_icon.svg";
    let download_id = "download-video-button";
    let download_tooltipText = "Download";

function download_Button() {
      if (jwplayer().getEnvironment().OS.mobile == true) {
        modal.style.height = "200px";
        modal.style.overflow = "auto";
      }
      openModal.style.opacity = "1";
      openModal.style.visibility = "visible";

closeModal.addEventListener("click", function(e) {
        openModal.style.opacity = "0";
        openModal.style.visibility = "hidden"
      })
    }

playerInstance.addButton(download_iconPath, download_tooltipText, download_Button, download_id);

console.log('[CR Premium] Baixando sources:')
      for (let id of [1, 0, 2, 3, 4])
        linkDownload(id);
// Definir URL e Tamanho na lista de download
      for (let id of [1, 0, 2, 3, 4]) {
        dlUrl[id].href = video_mp4_array[id];
}


  jwplayer().on('ready', e => {

   document.body.querySelector(".loading_container").style.display = "none";
  });
 }



 function getAllOrigins(url) {
  return new Promise(async (resolve, reject) => {
   await $.ajax({
     async: true,
     type: "GET",
     url: allorigins + encodeURIComponent(url),
     responseType: 'json'
    })
    .then(res => {
     resolve(res.contents ?? res)
    })
    .catch(err => reject(err));
  })
 }

 async function getStreams(url) {
  const episodeStream = JSON.parse(await getAllOrigins(url));
  return episodeStream;
 }

 function mp4ListFromStream(url) {
  const cleanUrl = url.replace('evs1', 'evs').replace(url.split("/")[2], "fy.v.vrv.co");
  const res = [];
  for (let i in r)
   if (streamrgx_three.test(cleanUrl) && i <= 2) // por algum motivo alguns videos da CR tem apenas 3 resoluções
    res.push(cleanUrl.replace(streamrgx_three, `_$${(parseInt(i)+1)}`))
  else
   res.push(cleanUrl.replace(streamrgx, `_$${(parseInt(i)+1)}`))
  return res;
 }
});
