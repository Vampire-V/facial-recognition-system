const SSD_MOBILENETV1 = 'ssd_mobilenetv1'
const TINY_FACE_DETECTOR = 'tiny_face_detector'
const COLOR_GREEN = '#2ecc71'
const COLOR_RED = '#f92d19'


let selectedFaceDetector = SSD_MOBILENETV1

// ssd_mobilenetv1 options
let minConfidence = 0.8

// tiny_face_detector options
// 128
// 160
// 224
// 320
// 416
// 512
// 608
let inputSize = 224
let scoreThreshold = 0.6

function getFaceDetectorOptions() {
  return selectedFaceDetector === SSD_MOBILENETV1
    ? new faceapi.SsdMobilenetv1Options({ minConfidence })
    : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
}

function onIncreaseMinConfidence() {
  minConfidence = Math.min(faceapi.utils.round(minConfidence + 0.1), 1.0)
  $('#minConfidence').val(minConfidence)
  updateResults()
}

function onDecreaseMinConfidence() {
  minConfidence = Math.max(faceapi.utils.round(minConfidence - 0.1), 0.1)
  $('#minConfidence').val(minConfidence)
  updateResults()
}

function onInputSizeChanged(e) {
  changeInputSize(e.target.value)
  updateResults()
}

function changeInputSize(size) {
  inputSize = parseInt(size)

  const inputSizeSelect = $('#inputSize')
  inputSizeSelect.val(inputSize)
  inputSizeSelect.material_select()
}

function onIncreaseScoreThreshold() {
  scoreThreshold = Math.min(faceapi.utils.round(scoreThreshold + 0.1), 1.0)
  $('#scoreThreshold').val(scoreThreshold)
  updateResults()
}

function onDecreaseScoreThreshold() {
  scoreThreshold = Math.max(faceapi.utils.round(scoreThreshold - 0.1), 0.1)
  $('#scoreThreshold').val(scoreThreshold)
  updateResults()
}

function onIncreaseMinFaceSize() {
  minFaceSize = Math.min(faceapi.utils.round(minFaceSize + 20), 300)
  $('#minFaceSize').val(minFaceSize)
}

function onDecreaseMinFaceSize() {
  minFaceSize = Math.max(faceapi.utils.round(minFaceSize - 20), 50)
  $('#minFaceSize').val(minFaceSize)
}

function getCurrentFaceDetectionNet() {
  if (selectedFaceDetector === SSD_MOBILENETV1) {
    return faceapi.nets.ssdMobilenetv1
  }
  if (selectedFaceDetector === TINY_FACE_DETECTOR) {
    return faceapi.nets.tinyFaceDetector
  }
}

function isFaceDetectionModelLoaded() {
  return !!getCurrentFaceDetectionNet().params
}

async function changeFaceDetector(detector) {
  // ['#ssd_mobilenetv1_controls', '#tiny_face_detector_controls']
  //   .forEach(id => $(id).hide())

  selectedFaceDetector = detector
  // const faceDetectorSelect = $('#selectFaceDetector')
  // faceDetectorSelect.val(detector)
  // faceDetectorSelect.material_select()

  // $('#loader').show()
  if (!isFaceDetectionModelLoaded()) {
    await getCurrentFaceDetectionNet().load(PATH_MODEL)
  }

  // $(`#${detector}_controls`).show()
  // $('#loader').hide()
}

async function onSelectedFaceDetectorChanged(e) {
  selectedFaceDetector = e.target.value

  await changeFaceDetector(e.target.value)
  updateResults()
}

function initFaceDetectionControls() {
  const faceDetectorSelect = document.querySelector("#selectFaceDetector")
  // $('#selectFaceDetector')
  // console.log(faceDetectorSelect.);
  faceDetectorSelect.value = selectedFaceDetector
  // console.log(faceDetectorSelect);
  faceDetectorSelect.addEventListener('change', onSelectedFaceDetectorChanged)
  // console.log(faceDetectorSelect);
  // faceDetectorSelect.material_select()

  // const inputSizeSelect = $('#inputSize')
  // inputSizeSelect.val(inputSize)
  // inputSizeSelect.on('change', onInputSizeChanged)
  // inputSizeSelect.material_select()
}