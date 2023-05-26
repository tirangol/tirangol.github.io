/********************************************************
 Background Zoom
 ********************************************************/
let zoomFactor = 0.05;
let cursorX = 0;
let cursorY = 0;
const cZoom = [0.5, 0.44, 0.37, 1, 0.8, 0.9, 1, 0.8, 0.8, 0.3, 0.65, 0.6, 0.2];

function handleMouseMove(event) {
    cursorX = event.clientX;
    cursorY = event.clientY;

    let zoom1 = zoomFactor * (screen.width - cursorX) / screen.width;
    let zoom2 = 1200 * zoomFactor * cursorY / screen.height;
    cssScaleMany(zoom1, zoom2, cZoom);
}

function cssSetId(id, property, value) {
    document.getElementById(id).style.setProperty(property, value);
}

function cssScaleMany(zoom1, zoom2, cZoom) {
    function formatValue1(i) {
        let c = cZoom[i] * zoom1 + 1;
        return "scale(" + c + ", " + c + ")";
    }
    function formatValue2(i) {
        let c = cZoom[i] * zoom2 + 50;
        return "50% " + c + "%";
    }

    for (i = 0; i < 13; i++) {
        cssSetId("c" + (i + 1), "transform", formatValue1(i));
        cssSetId("c" + (i + 1), "background-position", formatValue2(i));
    }
}


/********************************************************
 Background Resizing
 ********************************************************/
let resolution = "low";
function backgroundResize() {
    // low: 1441 x 810
    // med: 1920 x 1080
    // high: 3840 x 2160
    function updateImage(size) {
        for (i = 1; i <= 13; i++) {
            let property = "background-image";
            let value = "url(\"assets/" + size + "_resolution/c" + i + ".png\")";
            cssSetId("c" + i, property, value);
        }
    }
    let width = window.innerWidth;
    if (width <= 1920 && resolution != "low") {
        updateImage("low");
        resolution = "low";
    } else if (width < 3000 && resolution != "med") {
        updateImage("med");
        resolution = "med";
    } else if (resolution != "high") {
        updateImage("high");
        resolution = "high";
    }
}
window.addEventListener('resize', backgroundResize);
window.addEventListener('resize', updateBackgroundSize);


/********************************************************
 Particle Drawing
 ********************************************************/
const p1 = new Image(); p1.src = "assets/particles/p1.png";
const p2 = new Image(); p2.src = "assets/particles/p2.png";
const p3 = new Image(); p3.src = "assets/particles/p3.png";
const p4 = new Image(); p4.src = "assets/particles/p4.png";
const p5 = new Image(); p5.src = "assets/particles/p5.png";
const p6 = new Image(); p6.src = "assets/particles/p6.png";
const p7 = new Image(); p7.src = "assets/particles/p7.png";

let particleScale = [0.08, 0.15, 0.2, 0.04, 0.1, 0.2, 0.1];
let particleXOffset = [15, 10, -18, 25, 30, 10, 5];
let particleYOffset = [6, 5, 12, 15, 16, 8, 10];
function readParticleList(lst, p) {
    let i = p.src[p.src.length - 5];
    return lst[parseInt(i) - 1];
}
function getParticleScale(p) {
    return readParticleList(particleScale, p);
}
function getParticleXOffset(p) {
    return readParticleList(particleXOffset, p);
}
function getParticleYOffset(p) {
    return readParticleList(particleYOffset, p);
}
function drawImage(context, image, x, y, scale, opacity) {
    if (opacity <= 0) {
        return;
    }
    context.globalCompositeOperation = "lighter";
    context.globalAlpha = opacity;
    context.drawImage(image,
                      x + getParticleXOffset(image),
                      y + getParticleYOffset(image),
                      scale * getParticleScale(image) * image.width,
                      scale * getParticleScale(image) * image.height);
}


/********************************************************
 HTML Canvas Animation
 ********************************************************/
function updateSelectAnimation() {
    let canvas = document.getElementById("select_animation");
    let context = canvas.getContext("2d");
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawParticles(context);
    diff = 0;

    if (!doneAnimation) {
        setTimeout(() => {
            window.requestAnimationFrame(updateSelectAnimation);
        }, 1000 / fps);
    }
}

let defaultStartX = 250;
let defaultStartY = 15;
let defaultEndX = 50;
let defaultEndY = 15;
let fps = 30;
let maxIterations = 100;
let pauseAnimation = true;
let doneAnimation = true;

let endXPositions = [60, 30, 60, 0, 30];
let currSelect = 0;
let diff = 0;
function enterSelect(i) {
    diff = i - currSelect;
    currSelect = i;
    
    defaultStartY += diff * 42;
    defaultEndY += diff * 42;
    defaultEndX = endXPositions[i];
    
    pauseAnimation = false;
    if (doneAnimation) {
        doneAnimation = false;
        window.requestAnimationFrame(updateSelectAnimation);
    }
}
function leaveSelect() {
    pauseAnimation = true;
}


/********************************************************
 Particle Data
 ********************************************************/
particles = new Array();
for (i = 0; i < 10; i++) {
    createParticle(p1);
    createParticle(p2);
    createParticle(p3);
    createParticle(p4);
    createParticle(p5);
    createParticle(p6);
    createParticle(p7);
}
function createParticle(p) {
    let map = new Map();
    map.clear();
    map.set('startX', 0);
    map.set('startY', 0);
    map.set('startScale', 0);
    map.set('endX', 0);
    map.set('endY', 0);
    map.set('endScale', 0);
    map.set('currX', 0);
    map.set('currY', 0);
    map.set('currScale', 0);
    map.set('iterations', 0);
    map.set('currIteration', 0);
    map.set('currOpacity', 0);
    map.set('delay', 0);
    map.set('restartAnimation', true);
    map.set('image', p);
    particles.push(map);
}
function drawParticles(context) {
    // console.log(particles[0].get('currIteration') + " / " + particles[0].get('iterations') + ", " + particles[0].get('restartAnimation') + ", " + particles[0].get('delay'));
    let doneAnimationSoFar = true;
    for (i = 0; i < particles.length; i++) {
        let pInfo = particles[i];
        let pathFinished = updateParticleInfo(pInfo);
        if (!pathFinished) {
            doneAnimationSoFar = false;
            drawImage(context, pInfo.get('image'), pInfo.get('currX'), pInfo.get('currY'), pInfo.get('currScale'), pInfo.get('currOpacity'));
        }
    }
    doneAnimation = doneAnimationSoFar;
}

function updateParticleInfo(pInfo) {
    if (pInfo.get('currIteration') >= pInfo.get('iterations')) {
        resetParticleInfo(pInfo);
        return pauseAnimation;
    } else if (pInfo.get('delay') > 0) {
        if (diff != 0) {
            jumpParticleY(pInfo);
        }
        if (!pauseAnimation) {
            pInfo.set('delay', pInfo.get('delay') - 1);
        }
        return pauseAnimation;
    }
    let x = pInfo.get('currIteration') / pInfo.get('iterations')
    let i = 1 - Math.sqrt(x);
    let j = Math.sin((Math.PI / 2) * (x));
    let k = 0.3 * (x - 1) * (5 * x * (x - 1) ** 3 - 0.5);
    pInfo.set('currX',          (1 - x) * pInfo.get('startX') + x * pInfo.get('endX'));
    pInfo.set('currY',          i * pInfo.get('startY') + (1 - i) * pInfo.get('endY'));
    pInfo.set('currOpacity',    k);
    pInfo.set('currScale',      (1 - j) * pInfo.get('startScale') + j * pInfo.get('endScale'));
    pInfo.set('currIteration',  pInfo.get('currIteration') + 1);
    return false;
}

function resetParticleInfo(pInfo) {
    if (!pauseAnimation) {
        let move = defaultStartX - defaultEndX;
        let rand = randomInteger(0, move * 0.6);
        pInfo.set('startX',         defaultStartX - rand);
        pInfo.set('endX',           defaultEndX + randomInteger(0, 50) + move * 0.6 - rand);
        pInfo.set('startY',         defaultStartY + randomInteger(-7, 3));
        pInfo.set('endY',           defaultEndY + randomInteger(2, 6));
        pInfo.set('startScale',     0.6 * Math.random() + 0.6);
        pInfo.set('endScale',       0.5 * Math.random() + 0.5);
        pInfo.set('currX',          pInfo.get('startX'));
        pInfo.set('currY',          pInfo.get('startY'));
        pInfo.set('currScale',      pInfo.get('startScale'));
        pInfo.set('iterations',     randomInteger(50, maxIterations) * fps / 100);
        pInfo.set('currIteration',      0);
        if (pInfo.get('restartAnimation')) {
            pInfo.set('delay',            randomInteger(0, maxIterations - 25) * fps / 100);
            pInfo.set('restartAnimation', false);
        } else {
            pInfo.set('delay', 0);
        }
    } else {
        pInfo.set('restartAnimation', true);
    }
    pInfo.set('currOpacity', 0);    
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function jumpParticleY(pInfo) {
    pInfo.set('startY', pInfo.get('startY') + diff * 42);
    pInfo.set('endY', pInfo.get('endY') + diff * 42);
    pInfo.set('currY', pInfo.get('startY') + diff * 42);
}

/********************************************************
 Select
 ********************************************************/
function select(i) {
    let text = document.querySelector("#menu_block h1:nth-child(" + (i + 1) + ")");
    let position = text.getBoundingClientRect();
    let centerX = position.x + position.width / 2;
    let centerY = position.y + position.height / 2;
    let diffX = (cursorX - centerX) * 0.15;
    let diffY = (cursorY - centerY) * -2;
    
    let value = 'rotateX(' + diffY + 'deg) rotateY(' + diffX + 'deg)';
    text.style.transition = '0s';
    text.style.transform = value;
    setTimeout(() => {
        text.style.transition = '0.5s';
        text.style.transform = 'initial';
    }, 100);
}
let currScreen = -1;
function goTo(i) {
    currScreen = i;
    screenTransition(i);
}

function screenTransition(i) {
    if (i == 0) {
        cssSetId('tv', 'height', '65%');    cssSetId('tv_body', 'height', '65%');   cssSetId('tv_screen', 'height', '65%');
        cssSetId('tv', 'bottom', '28%');    cssSetId('tv_body', 'bottom', '28%');   cssSetId('tv_screen', 'bottom', '28%');
        cssSetId('tv', 'right', '8%');      cssSetId('tv_body', 'right', '8%');     cssSetId('tv_screen', 'right', '8%');
        cssSetId("tv_body", 'z-index', '5');
        cssSetId("tv_screen", 'z-index', '5');
        cssSetId('stand', 'height', '55%');
        cssSetId('stand', 'bottom', '-25%');
        cssSetId('stand', 'right', '5.5%');
        cssSetId('room_zoom', 'transform', 'scale(1) translate(0)');
        cssSetId('background', 'transform', 'scale(0.35)');   
        updateBackgroundSize();
    }
}
function updateBackgroundSize() {
    if (currScreen == -1) {
        cssSetId('background', 'width', "100%");
        cssSetId('background', 'height', "100%");
        cssSetId('background', 'min-width', "1000px");
        cssSetId('background', 'right', "0%");
    } else if (currScreen == 0) {
        let width = window.innerHeight * 1.3;
        let height = window.innerHeight * 1.05;
        let right = width * -0.155 + window.innerWidth * 0.08;
        let bottom = height * -0.01;
        cssSetId('menu_block', 'right', 'min(3.5%, calc(100% - 800px))');
        cssSetId('background', 'width', width + "px");
        cssSetId('background', 'height', height + "px");
        cssSetId('background', 'min-width', "1px");
        cssSetId('background', 'right', right + "px");
        cssSetId('background', 'bottom', bottom + "px");
    } 
}

/* About

I like video games, music, and machine learning.

And I study computer science and data science at the University of Toronto.

Programming Languages:
- Python
- Java
- HTML/CSS
- Javascript
- C
- R
- Matlab

Links:
- Github
- Musescore



*/
// About: zoom out, revealing current screen to be screen of TV of my current laptop
// Projects: glitchy thing
// Music: zoom up
// Resources: cloud up?
// Resume: no animation


// https://sketchfab.com/3d-models/retro-70s-sony-trinitron-crt-tv-309572a900d2491fb0f992dce6d6af0e