const imageView = document.getElementById("image");
const canvas = document.getElementById('canvas')
const eraser = document.getElementById('eraser')
const pen = document.getElementById('pen')
const pencil = document.getElementById('pencil')
const colors = document.getElementById('colors')
const download = document.getElementById('download')
const clear = document.getElementById('clear')

const context = canvas.getContext('2d')
let lineSize = 1
let lineColor = '#F00'
let eraserSize = 50
let eraserEnabled = false

// autoSetCanvasSize(canvas)
listenToUser(canvas)

var images=[];
var curImageIdx=0;

function chooseImage(idx) {
    if (idx > images.length) {
        alert("没有更多图片了,请重新选择文件夹");
    }
    curImageIdx = idx;
    var reader = new FileReader();
    
    imageView.onload = function(){
        canvas.height = imageView.height;
        canvas.width = imageView.width;
    }

    reader.onload = function (e) {
        imageView.src = e.target.result;
    }
    reader.readAsDataURL(images[curImageIdx]);
}

function fileChange(that) {
    var files = that.files;
    images = [];
    curImageIdx = 0;
    for (var i = 0; i < files.length; i++) {
        let name = files[i].name;
        if (/\.jpg$/ig.test(name) && !/label\.png$/ig.test(name)) {
            images.push(files[i]);
        }
    }
    chooseImage(0);
}


// 细笔
pen.onclick = function () {
    eraserEnabled = false
    lineSize = 1
    pen.classList.add('active')
    pencil.classList.remove('active')
    eraser.classList.remove('active')
}

// 粗笔
pencil.onclick = function () {
    eraserEnabled = false
    lineSize = 2
    pencil.classList.add('active')
    pen.classList.remove('active')
    eraser.classList.remove('active')
}

// 橡皮擦
eraser.onclick = function () {
    eraserEnabled = true
    pencil.classList.remove('active')
    pen.classList.remove('active')
    eraser.classList.add('active')
}

function changeColor(target) {
    lineColor = window.getComputedStyle(target,false)['backgroundColor']
    for (let i in target.parentNode.children) {
        target.parentNode.children[i].className = ''
    }
    target.classList.add('active')
}
// 颜色设置
colors.onclick = function (event) {
    if (event.target.nodeName === 'UL') return
    changeColor(event.target);
}

// 清空画布
clear.onclick = function () {
    context.clearRect(0, 0, canvas.width, canvas.height)
}

function saveAndNext() {
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = images[curImageIdx].name +"_label.png";
    a.target = '_blank'
    a.click()
    chooseImage(curImageIdx+1);
}

// 保存画布
download.onclick = saveAndNext;

function listenToUser(canvas) {
    let using = false
    let lastPoint = {
        x: 0,
        y: 0,
    }
    let eSize = eraserSize/2
    if (document.body.ontouchstart !== undefined) {
        // 触摸设备
        canvas.ontouchstart = function (event) {
            let x = event.touches[0].clientX 
            let y = event.touches[0].clientY
            using = true
            if (eraserEnabled) {
                context.clearRect(x-eSize, y-eSize, eraserSize, eraserSize)
            } else {
                lastPoint = { x, y }
            }
        }
        canvas.ontouchmove = function (event) {
            if (!using) return
            let x = event.touches[0].clientX 
            let y = event.touches[0].clientY
            if (eraserEnabled) {
                context.clearRect(x-eSize, y-eSize, eraserSize, eraserSize)
            } else {
                drawLine(lastPoint, { x, y }, lineSize)
                lastPoint = { x, y }
            }
        }
        canvas.ontouchend = function () {
            using = false
        }
    } else {
        // 非触摸设备
        // 鼠标按下，开始绘制圆和绘制开始点
        canvas.onmousedown = function (event) {
            let x = event.clientX
            let y = event.clientY
            using = true
            if (eraserEnabled) {
                context.clearRect(x-eSize, y-eSize, eraserSize, eraserSize)
            } else {
                lastPoint = { x, y }
            }
        }

        // 鼠标移动开始连线
        canvas.onmousemove = function (event) {
            if (!using) return
            let x = event.clientX
            let y = event.clientY

            if (eraserEnabled) {
                context.clearRect(x-eSize, y-eSize, eraserSize, eraserSize)
            } else {
                drawLine(lastPoint, { x, y }, lineSize)
                lastPoint = { x, y }
            }
        }

        // 鼠标弹起结束绘制
        canvas.onmouseup = function (event) {
            using = false
        }
    }

}

// 设置画板大小为浏览器大小且自适应
function autoSetCanvasSize(canvas) {
    onCanvasResize()
    document.getElementById("image").onresize = function () {
        onCanvasResize()
    }
    function onCanvasResize() {
        let pageWidth = document.documentElement.clientWidth
        let pageHeight = document.documentElement.clientHeight

        canvas.height = pageHeight
        canvas.width = pageWidth
    }
}

function drawLine(lastPoint, newPoint, width) {
    context.beginPath()
    context.strokeStyle = lineColor
    context.moveTo(lastPoint.x, lastPoint.y)
    context.lineWidth = width * 2
    context.lineTo(newPoint.x, newPoint.y)
    context.stroke()
    context.closePath()
}

window.addEventListener("keydown", function(e) {
    e.preventDefault();
    var e = event || window.event || arguments.callee.caller.arguments[0]; 

    var colorTarget = null;
    if(e && e.keyCode==81){ // 按 Esc 
        // alert("label 0"); 
        colorTarget = document.getElementById("red");
    } 
    if(e && e.keyCode==87 ){ // 按 F2  
        // alert("label 1"); 
        colorTarget = document.getElementById("green");
    }             
    if(e && e.keyCode==69 ){ // enter 键 
        // alert("label 2"); 
        colorTarget = document.getElementById("blue");
    }
    if (e && e.keyCode == 82) {  
        // alert("label 3");  
        colorTarget = document.getElementById("dark");
    }
    if (colorTarget!=null) {
        changeColor(colorTarget);
    }

    if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        saveAndNext();
    }
}, false);