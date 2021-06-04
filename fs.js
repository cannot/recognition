public async faceRecognition(fullFaceDescriptions: faceapi.WithFaceExpressions<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{
detection: faceapi.FaceDetection;
}, faceapi.FaceLandmarks68>>>[], canvas: HTMLCanvasElement, mode: string) {
const labels = ['Barney', 'Lily', 'Marshall', 'Robin', 'Ted']
const labeledFaceDescriptors = await Promise.all(
labels.map(async label => {
// fetch image data from urls and convert blob to HTMLImage element
const imgUrl = '../assets/images/' + `${label}.jpeg`
const img = await faceapi.fetchImage(imgUrl)
// detect the face with the highest score in the image and compute it's landmarks and face descriptor
const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
if (!fullFaceDescription) {
throw new Error(`no faces detected for ${label}`)
}
const faceDescriptors = [fullFaceDescription.descriptor]
return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
})
)
//match the face descriptors of the detected faces from our input image to our reference data
// 0.6 is a good distance threshold value to judge
// whether the descriptors match or not
const maxDescriptorDistance = 0.6
//match the face descriptors of the detected faces from our input image to our reference data
const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)
const results = fullFaceDescriptions.map(function (fd) {
return { faceMatcher: faceMatcher.findBestMatch(fd['descriptor']), faceExpressions: fd['expressions'] }
})
results.forEach((bestMatch, i) => {
let expression = bestMatch['faceExpressions'];
let recognize = bestMatch['faceMatcher'].toString().split(" ")[0]
let max = Math.max.apply(null, Object.values(expression))
const box = fullFaceDescriptions[i]['detection']['box']
let text = ""
this.saveExpression(text)
if (mode === "expression") {
text = recognize + ":" + this.getKeyByValue((expressions), max);
} else {
text = recognize;
}
//draw the bounding boxes together with their labels into a canvas to display the results
const drawBox = new faceapi.draw.DrawBox(box, { label: text })
drawBox.draw(canvas)
})
}