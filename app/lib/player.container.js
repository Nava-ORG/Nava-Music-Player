const rpc = require("discord-rpc")
const client = new rpc.Client({ transport: 'ipc' })
client.login({ clientId: '905808227768348682' }).catch(console.error);

const { ipcRenderer, remote } = require('electron')
const { dialog } = remote;
const dropArea = document.getElementById('drop_area')
const player = document.getElementById('player')
const btn_prev = document.getElementById('btn_prev')
const btn_play = document.getElementById('btn_play')
const btn_next = document.getElementById('btn_next')
const progress = document.getElementById('progress')
const player_title = document.getElementById('player_title')
const player_artist = document.getElementById('player_artist')
const player_year = document.getElementById('player_year')
const player_cover = document.getElementById('player_cover')
const show_list = document.getElementById('show_list')
const accName = document.getElementById('accName')

const checkInternetConnected = require('check-internet-connected');
const mediates = require('jsmediatags')
const playlist = []
let current = -1
const icons = document.querySelector('#btn_play > i')


client.on('ready', () => {
    accName.innerText = client.user.username + ' : اکتیویتی دیسکورد درحال نمایش برای'
    client.request('SET_ACTIVITY', {
        pid: process.pid,
        activity: {
            details: "نوآ اولین موزیک پلیر فارسی زبان",
            assets: {
                large_image: "nava",
                small_image: "pause",
                small_text: "چیزی درحال پخش نیست"
            },
            buttons: [
                { label: "پروژه ها", url: "https://github.com/Nava-ORG" }
            ]
        }
    })
})

function Private_Switch() {
    client.destroy()
}
function Public_Switch() {
    client.request('SET_ACTIVITY', {
        pid: process.pid,
        activity: {
            details: "نوآ اولین موزیک پلیر فارسی زبان",
            assets: {
                large_image: "nava",
                small_image: "pause",
                small_text: "چیزی درحال پخش نیست"
            },
            buttons: [
                { label: "پروژه ها", url: "https://github.com/Nava-ORG" }
            ]
        }
    })
}

const checkInternetConnectedConfig = { timeout: 3000, retries: 5, domain: 'discord.com' }
checkInternetConnected(checkInternetConnectedConfig).then(() => {
    accName.innerText = client.user.username + ' : درحال نمایش برای'
}).catch((error) => {
    accName.innerText = 'اکتیویتی دیسکورد به دلیل وصل نبودن اینترنت غیرفعال است'
});


const handelPlayPause = () => {
    if (playlist.length) {
        if (player.paused) {
            player.play()
            icons.name = 'pause-outline'
            ipcRenderer.send('setStatus', 'نگه‌داشتن')
        } else {
            player.pause()
            icons.name = 'play-outline'
            ipcRenderer.send('setStatus', 'پخش')
        }
    } else {
        alert('آهنگی یافت نشد')
    }

}


const handelGoBack = () => {
    current > 0 && play_item(current - 1)
}
const handelGoForward = () => {
    current <= playlist.length && play_item(current + 1)
}

const openFiles = () => {
    dialog
        .showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters: [
                {
                    name: 'Musics',
                    extensions: ['mp3', 'wav'],
                },
            ],
        })
        .then((res) => {
            res.filePaths.map((file) => insert_media(file))
        })
}

ipcRenderer.on('openFiles', openFiles)

ipcRenderer.on('controller', (e, arg) => {
    switch (arg) {
        case 'prev':
            current > 0 && play_item(current - 1)
            break
        case 'next':
            current <= playlist.length && play_item(current + 1)
            break
        case 'play':
            handelPlayPause()
            break
    }
})

btn_play.addEventListener('click', () => handelPlayPause())


player.ontimeupdate = () => {
    progress.max = player.duration
    progress.value = player.currentTime
}

progress.oninput = () => (player.currentTime = progress.value)

btn_prev.addEventListener('click', () => handelGoBack())

btn_next.addEventListener('click', () => handelGoForward())

player.onended = function () {
    handelGoForward()
}

const play_item = (id) => {
    current = id
    const { title, image, year, artist, path } = playlist[id]
    player_title.innerText = title
    player_year.innerText = year
    player_artist.innerText = artist
    player_cover.src = image
    player.src = path
    client.request('SET_ACTIVITY', {
        pid: process.pid,
        activity: {
            details: title || "اطلاعاتی یافت نشد",
            state: artist + ' - ' + year || "اطلاعاتی یافت نشد",
            assets: {
                large_image: "nava",
                large_text: "نوآ اولین موزیک پلیر فارسی زبان",
                small_image: "play",
                small_text: "درحال پخش آهنگ"
            },
            buttons: [
                { label: "آهنگ", url: `https://www.google.com/search?q=` + title.split(" ").join("-") || artist.split(" ").join("-") },
                { label: "پروژه ها", url: "https://github.com/Nava-ORG" }
            ]
        }
    })
    handelPlayPause()
}

const add_item = (data) => {
    const { id, title = '-', artist = '-', year = '-', album = '-', image } = data
    let item = `
             <div onclick="play_item(${id})" class="row py-1 music-item" id="item_${id}">
      <div class="col-2">
          <img
              src="${image}"
              alt="Cover"
              class="img-fluid responsive"
              width="50"
              height="50"
          >
      </div>
      <div class="col">
          <div class="row">
              <div class="col text-right">
                  ${title}
              </div>
              <div class="col text-left">
                  ${album}
              </div>
          </div>
          <div class="row small">
              <div class="col text-right">
                  ${artist}
              </div>
              <div class="col text-left">
                  ${year}
              </div>
          </div>
      </div>
  </div>
                `
    // play_item()
    show_list.innerHTML += item
}

const update_list = () => {
    show_list.innerHTML = ''
    playlist.forEach((music) => {
        add_item({
            id: music.id,
            title: music.title,
            album: music.album,
            artist: music.artist,
            image: music.image,
            year: music.year,
        })
    })
}

const insert_media = (file) => {
    mediates.read(file, {
        onSuccess: (tag) => {
            let info = tag.tags
            let picture = info.picture
            let base64String = ''
            let imageUri;

            if (picture)
            {
                for (let i = 0; i < picture.data.length; i++)
                {
                    base64String += String.fromCharCode(picture.data[i])
                }

                imageUri = 'data:' + picture.format + ';base64,' + window.btoa(base64String);
            }
            else
            {
                imageUri = '../img/cover.jpg';
            }

            const { title, album, artist, year } = info;

            playlist.push({
                id: playlist.length,
                title,
                image: imageUri,
                album,
                artist,
                year,
                path: file,
            })
            update_list()
        },
        onError: () => {
            console.log('Error')
        },
    })
    update_list()
}

dropArea.ondragover = () => false

dropArea.ondragleave = () => false

dropArea.ondragend = () => false

dropArea.ondrop = (event) => {
    event.preventDefault()
    for (let file of event.dataTransfer.files) {
        insert_media(file.path)
    }
}

function maximize() {
    ipcRenderer.send('maximize')
}

function minimize() {
    ipcRenderer.send('minimize')
}