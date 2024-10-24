let img = document.querySelector('#box img');
let span = document.querySelectorAll('span');
let left = document.getElementById('left');
let right = document.getElementById('right');
let index = 0;
let timer;
function show() {
    img.src = `./resources/白/运动 ${index}.png`;
}

function autoPlay() {
    timer = setInterval(function () {
        if (index == span.length) {
            index = 0;
        }
        img.style.opacity = 1;
        show();
        index++;
    }, 2000);
}
autoPlay();

function ctrlPlay() {
    for (let i = 0; i < span.length; i++) {
        span[i].onclick = function () {
            index = i;
            show();
        }
    }
}
ctrlPlay();
function clickPlay() {
    left.onclick = function () {
        if (index <= 0) {
            index = span.length - 1;
        } else {
            index--;
        }
        show();
    }
    right.onclick = function () {
        if (index == span.length) {
            index = 0;
        }
        index++;
        show();
    }
}
clickPlay();
function eventList() {
    for (let i = 0; i < span.length; i++) {
        span[i].addEventListener('mouseenter', function () {
            clearInterval(timer);
            index = i;
            show();
        }, false);
        span[i].addEventListener('mousemove', function () {
            clearInterval(timer);
            autoPlay();
        }, false);

    }
}
eventList();