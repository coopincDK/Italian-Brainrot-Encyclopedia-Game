// Italian Brainrot - Service Worker
// Enables offline functionality and caching

const CACHE_NAME = 'italian-brainrot-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './game.js',
  './jeopardy.js',
  './characters.js',
  './descriptions.js',
  './translations.js',
  './firebase-config.js',
  './manifest.json',
  // Sound files
  './Sound/01_italian_brainrot_ringtone.mp3',
  './Sound/02_tung_tung_tung_tung_sahur.mp3',
  './Sound/03_Strawberry_elephant_spawn_troll_steal_a_brainrot.mp3',
  './Sound/04_Steal_a_Brainrot_-_Dragon_Cannelloni.mp3',
  './Sound/06_Thick_Of_It_Brainrot.mp3',
  './Sound/07_balerina_capuchina.mp3',
  './Sound/08_Bobrito_Bandito_Italian_brainrot.mp3',
  './Sound/09_Sahur_song.mp3',
  './Sound/10_Tralalero_Tralala_Meme.mp3',
  './Sound/11_noo_la_policia.mp3',
  './Sound/12_Steal_a_Brainrot_-_Garama_and_Mandundung.mp3',
  './Sound/13_Trippi_Troppi_Italian_brainrot.mp3',
  './Sound/14_Meowl_Steal_a_Brainrot.mp3',
  './Sound/15_Udin_Din_Din_Dun.mp3',
  './Sound/16_Get_Out_MEMES.mp3',
  './Sound/17_Dragon_Cannelloni_Steal_A_Brainrot.mp3',
  './Sound/18_brainrot_ringtone.mp3',
  './Sound/19_drill_brainrot.mp3',
  './Sound/20_toilet_ananas_nasdas.mp3',
  './Sound/21_Brainrot_rap.mp3',
  './Sound/22_RickRoll_Tralalero_Tralala.mp3',
  './Sound/23_Steal_a_Brainrot_-_Los_Tralaleritos.mp3',
  './Sound/25_garam_brainrot.mp3',
  './Sound/26_Brainrot_Phonk.mp3',
  './Sound/27_Steal_a_Brainrot_-_Job_Job_Job_Sahur.mp3',
  './Sound/28_Capuccino_Assasino_Italian_Brainrot.mp3',
  './Sound/29_oh_berinjela.mp3',
  './Sound/30_brainrot_cat.mp3',
  './Sound/31_mateooo_italian_brainrot_by_Tristank.mp3',
  './Sound/32_KSI_Thick_Of_It_Brainrot.mp3',
  './Sound/33_Hotspot_brainrot.mp3',
  './Sound/34_Steal_a_Brainrot_kid_cry.mp3',
  './Sound/35_Steal_a_Brainrot_-_Chicleteira_Bicicletera.mp3',
  './Sound/36_Anatoxic_-_Garamararamararaman.mp3',
  './Sound/37_my_mother_ate_fries.mp3',
  './Sound/39_Trikitrakatelas_italian_brainrot.mp3',
  './Sound/40_Trullimero_Trullicina.mp3',
  './Sound/41_erm_what_the_sigma_full.mp3',
  './Sound/42_Steal_a_Brainrot_-_Karkerkar_Kurkur.mp3',
  './Sound/43_Bobrini_Cocococini.mp3',
  './Sound/44_tatata_sahur.mp3',
  './Sound/45_Steal_a_Brainrot_-_La_Vacca_Saturno_Saturnita.mp3',
  './Sound/46_Tung_Tung_Sahur_Song.mp3',
  './Sound/47_Steal_a_Brainrot_-_Esok_Sekolah.mp3',
  './Sound/48_Glorbo_Frutodrilo.mp3',
  './Sound/50_Skibidi_Fortnite_-_Cartel_Dealer.mp3',
  './Sound/51_Steal_a_Brainrot_-_Noobini_Pizzanini.mp3',
  './Sound/52_BRAINROT_SOUNDS.mp3',
  './Sound/53_Tricktrack_Bataboom.mp3',
  './Sound/54_Steal_a_Brainrot_-_Ketupat_Kepat.mp3',
  './Sound/55_Italian_brainrot.mp3',
  './Sound/56_what_help_me.mp3',
  './Sound/57_Steal_a_Brainrot_-_Pipi_Kiwi.mp3',
  './Sound/58_Steal_a_Brainrot_-_La_Supreme_Combinasion.mp3',
  './Sound/59_Steal_a_Brainrot_-_Tung_Tung_Tung_Sahur.mp3',
  './Sound/60_brain_rot_7000.mp3',
  './Sound/61_Richard_Ahh_Screaming.mp3',
  './Sound/62_Bobombini_Goosini_Italian_Brainrot.mp3',
  './Sound/63_Steal_a_Brainrot_-_Tralalero_Tralala.mp3',
  './Sound/64_Steal_a_Brainrot_-_Los_Combinasionas.mp3',
  './Sound/65_Last_sahur.mp3',
  './Sound/66_callate_ala_verga.mp3',
  './Sound/67_Bombardiro_Crocodilo.mp3',
  './Sound/68_Steal_a_Brainrot_-_Nuclearo_Dinossauro.mp3',
  './Sound/69_Larry_grave_Viens_là.mp3',
  './Sound/70_Ballarina_Cappucina.mp3',
  './Sound/72_Max_design_pro_-_What_Help_me.mp3'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
