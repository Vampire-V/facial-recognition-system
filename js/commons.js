const PATH_MODEL = '/models'
const BASE_URL = "https://localhost:7093/api/"
const BASE_HUB = "https://localhost:7093/employeeImageHub"

// connection hub signalR
var connection = new signalR.HubConnectionBuilder().withUrl(BASE_HUB).withAutomaticReconnect().build()

// connection.onclose(async () => {
//   await startSignalR();
// });

// Example GET method implementation:
async function getApi(url, options) {
  if (options) {
    return await fetch(url, options);
  }
  return await fetch(url)
}

// Example POST method implementation:
async function postApi(url, formData, headers = {}) {
  // Fetch POST Form data new FormData()
  let options = {
    method: 'POST',
    body: formData
  }

  if (headers.hasOwnProperty('Content-Type')) {
    options.headers = headers
  //   if (Object.getOwnPropertyDescriptor(headers, 'Content-Type').value === "application/json") {
  //     options.body = JSON.stringify(formData)
  //   }else{
  //     options.body = formData
  //   }
  }
  // debugger
  return await fetch(url, options);
}

// Example PUT method implementation:
async function putApi(url, formData, headers = {}) {
  // Fetch POST Form data new FormData()
  let options = {
    method: 'PUT',
    body: formData
  }

  if (headers.hasOwnProperty('Content-Type')) {
    options.headers = headers
    if (Object.getOwnPropertyDescriptor(headers, 'Content-Type').value === "application/json") {
      options.body = JSON.stringify(formData)
    }else{
      options.body = formData
    }
  }
  return await fetch(url, options);
}

// Example PUT method implementation:
async function deleteApi(url, headers = {}) {
  // Fetch POST Form data new FormData()
  let options = {
    method: 'DELETE'
  }
  return await fetch(url, options);
}

async function requestExternalImage(imageUrl) {
  const res = await fetch('fetch_external_image', {
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ imageUrl })
  })
  if (!(res.status < 400)) {
    console.error(res.status + ' : ' + await res.text())
    throw new Error('failed to fetch image from url: ' + imageUrl)
  }

  let blob
  try {
    blob = await res.blob()
    return await faceapi.bufferToImage(blob)
  } catch (e) {
    console.error('received blob:', blob)
    console.error('error:', e)
    throw new Error('failed to load image from url: ' + imageUrl)
  }
}

function renderNavBar(navbarId, exampleUri) {
  const examples = [
    {
      uri: 'example_face_recognition.html',
      name: 'Example Face Recognition'
    },
    {
      uri: 'images_for_training.html',
      name: 'Images Traing'
    }
  ]

  const navbar = $(navbarId).get(0)
  const pageContainer = $('.page-container').get(0)

  const header = document.createElement('h3')
  header.innerHTML = examples.find(ex => ex.uri === exampleUri).name
  pageContainer.insertBefore(header, pageContainer.children[0])

  const menuContent = document.createElement('ul')
  menuContent.id = 'slide-out'
  menuContent.classList.add('side-nav', 'fixed')
  navbar.appendChild(menuContent)

  const menuButton = document.createElement('a')
  menuButton.href = '#'
  menuButton.classList.add('button-collapse', 'show-on-large')
  menuButton.setAttribute('data-activates', 'slide-out')
  const menuButtonIcon = document.createElement('img')
  menuButtonIcon.src = 'menu_icon.png'
  menuButton.appendChild(menuButtonIcon)
  navbar.appendChild(menuButton)

  const li = document.createElement('li')
  const githubLink = document.createElement('a')
  githubLink.classList.add('waves-effect', 'waves-light', 'side-by-side')
  githubLink.id = 'github-link'
  // githubLink.href = 'https://github.com/justadudewhohacks/face-api.js'
  const h5 = document.createElement('h5')
  h5.innerHTML = 'Bird Haier'
  githubLink.appendChild(h5)
  // const githubLinkIcon = document.createElement('img')
  // githubLinkIcon.src = 'github_link_icon.png'
  // githubLink.appendChild(githubLinkIcon)
  li.appendChild(githubLink)
  menuContent.appendChild(li)

  examples
    .forEach(ex => {
      const li = document.createElement('li')
      if (ex.uri === exampleUri) {
        li.style.background = '#b0b0b0'
      }
      const a = document.createElement('a')
      a.classList.add('waves-effect', 'waves-light', 'pad-sides-sm')
      a.href = ex.uri
      const span = document.createElement('span')
      span.innerHTML = ex.name
      span.style.whiteSpace = 'nowrap'
      a.appendChild(span)
      li.appendChild(a)
      menuContent.appendChild(li)
    })

  $('.button-collapse').sideNav({
    menuWidth: 260
  })
}

function renderSelectList(selectListId, onChange, initialValue, renderChildren) {
  const select = document.createElement('select')
  $(selectListId).get(0).appendChild(select)
  renderChildren(select)
  $(select).val(initialValue)
  $(select).on('change', (e) => onChange(e.target.value))
  $(select).material_select()
}

function renderOption(parent, text, value) {
  const option = document.createElement('option')
  option.innerHTML = text
  option.value = value
  parent.appendChild(option)
}

function imageToBase64(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  // var dataURL = canvas.toDataURL("image/png",1.0);
  // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  return canvas.toDataURL("image/jpg", 1.0);
}

function dataURLToBlob(dataURL) {
  var BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    var parts = dataURL.split(',');
    var contentType = parts[0].split(':')[1];
    var raw = parts[1];

    return new Blob([raw], { type: contentType });
  }

  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(':')[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

function blobToFile(theBlob, fileName) {
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  theBlob.lastModifiedDate = Date.now();
  theBlob.name = fileName;
  return new File([theBlob], fileName, {
    type: 'image/jpg',
    lastModified: Date.now()
  });
}

function faceFocus(arr, current) {
  if (arr.length < 10 || current === "unknown") {
    return false
  }
  let successList = []

  for (let index = 0; index < 10; index++) {
    const element = arr[index].some(e => e.name === current)
    successList.push(element)
  }
  // arr.forEach(element => {
  //   let e = element.some(e => e.name === current)
  //   if (e && current !== "unknown") {
  //     successList.push(e)
  //   }
  // });
  return successList.every(e => e === true)
}

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(':')
  );
}

async function startSignalR() {
  try {
      await connection.start();
      console.log("SignalR Connected.");
  } catch (err) {
      console.log(err);
      // setTimeout(startSignalR, 5000);
  }
};