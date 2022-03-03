const letters = "いろはにほへとちりぬるをわかよたれそつねならむういのおくやまけふこえてあさきゆめみしえいもせすんー"

const alt_from = "かきくけこさしすせとたちつてとはひふへほあいうえおやゆよがぎぐげござじずぜぞだぢづでどばびぶべぼぁぃぅぇぉゃゅょぱぴぷぺぽ".split("");
const alt_to   = "がぎぐげござじずぜぞだぢづでどばびぶべぼぁぃぅぇぉゃゅょかきくけこさしすせとたちってとぱぴぷぺぽあいゔえおやゆよはひふへほ".split("");

const n_letters = letters.length

const windowX = 280;
const windowY = 550;
const outframeX = 150;
const outframeY = 150;

let mojis = [];
let main_window = document.getElementById("main_window");

let potential = [];
let grid = [];
let typhoons = [];

let endtime = 60*17*3;

let haiku = [];

const fd_l = -outframeX;
const fd_r = windowX + outframeX;
const fd_t = -outframeY;
const fd_b = windowY+outframeY;
const flen_x  = windowX + outframeX*2;
const flen_y = windowY + outframeY*2;

const n_f_x = 200;
const n_f_y = 200;

const dx = flen_x/n_f_x;
const dy = flen_y/n_f_y;

const offset_x = outframeX/dx;
const offset_y = outframeY/dy;




function make_potential() {
    for (let i = 0; i < n_f_x; i++ ) {
        for (let j = 0; j < n_f_y; j++) {
            potential[i][j] = 0;
            potential[i][j] += typhoons[0].power / Math.max(3,((i*dx-typhoons[0].x)**2+(j*dy-typhoons[0].y)**2)**0.25);
            potential[i][j] += typhoons[1].power / Math.max(3,((i*dx-typhoons[1].x)**2+(j*dy-typhoons[1].y)**2)**0.25);
        }
    }
}



class typhoon {
    constructor(id, power, x, y) {
        this.id = id;
        this.power = power;
        this.x = x;
        this.y = y;
        this.vx = -0.7;
        this.vy = 0.7;
        this.div = document.createElement("div");
        this.div.innerText = this.id; 
        this.div.style.left = (this.x-outframeX).toString()+"px";
        this.div.style.top  = (this.y-outframeY).toString()+"px";
        this.div.classList.add("typhoon");
        main_window.appendChild(this.div);
    }
    move () {
        this.x += this.vx;
        this.y += this.vy;
        if ( this.x> flen_x ) { this.x -= flen_x };
        if ( this.y> flen_y ) { this.y -= flen_y };
        this.div.style.top  = (this.y-outframeY).toString()+"px";
        this.div.style.left = (this.x-outframeX).toString()+"px";
    }
}

const hosei_x = [0, -1,  0, 1, 0, -1,  1,  1,  1];
const hosei_y = [0,  0, -1, 0, 1, -1, -1, -1,  1];

class c_moji {
    constructor(id) {
        this.id = id;
        this.l = letters[id];
        this.go = Math.floor(2*Math.random())*2-1;
        this.x =  flen_x * Math.random();//* ( 0.5 + id% 7 ) /  7;
        this.y =  flen_y * Math.random();//* ( 0.5 + Math.floor(id/7) ) / 7;
        this.vx = 0.;
        this.vy = 0.;
        this.vx0 = Math.random()*0.2;
        this.vy0 = 1.25+Math.random()*0.25;
        this.size = 95- (this.vx0**2 + this.vy0**2)**0.5*300;

        this.div = document.createElement("div");
        this.div.innerText = this.l;
        this.div.classList.add("letter");
        this.div.style.left = (this.x-outframeX).toString()+"px";
        this.div.style.top  = (this.y-outframeY).toString()+"px";
        this.div.setAttribute("onclick", "yomu("+id.toString()+")");
        main_window.appendChild(this.div);
        this.div.setAttribute("style", "font-size:" + this.size.toString()+"px");
        this.ouch = true;

    }

    vector() {
        this.vx = this.vx0+0.; this.vy = this.vy0+0.;
        for ( let j=0 ; j<9; j++ ) {
            for ( let i=0 ; i<2; i++ ) {
                let dx1 = (this.x-typhoons[i].x-hosei_x[j]*flen_x)//+flen_x)%flen_x;
                let dy1 = (this.y-typhoons[i].y-hosei_y[j]*flen_y)//+flen_y)%flen_y;
                //let r2 = Math.max(5,(dx1**2+dy1**2));
                let r2 = (dx1**2+dy1**2)+50;

                this.vx += typhoons[i].power * (-dy1) / r2;
                this.vy += typhoons[i].power * (dx1) / r2;
            }
        }
    }

    move() {
        //if (this.wait()) {
            this.x += this.vx;
            this.y += this.vy;
            this.div.style.top  = (this.y-outframeY).toString()+"px";
            this.div.style.left = (this.x-outframeX).toString()+"px";
        //}
        if ( this.x > flen_x ){
            this.x -= flen_x;
            this.y += (Math.random()-0.5)*40;
        } else if ( this.x < 0) {
            this.x += flen_x;
            this.y += (Math.random()-0.5)*40;
        }
        if ( this.y > flen_y ){
            this.y -= flen_y;
            this.x = flen_x * Math.random();
        } else if ( this.y < 0 ) {
            this.y += flen_y;
        }
    } 

}


initialize();

function initialize() {
    for (let i=0; i<n_letters; i++) {
        mojis.push(new c_moji(i));
    }
    for (let i = 0; i <= n_f_x; i++ ) {
        potential.push([]);
        grid.push([]);
        for (let j = 0; j <= n_f_y; j++) {
            potential[i].push(0.0);
        }
        for (let j = 0; j <= n_f_y; j++) {
            grid[i].push([fd_l+dx*i, fd_l+dy*j]);
        }
    }
    typhoons.push(new typhoon(0, -100, 700, 100));
    typhoons.push(new typhoon(1, 20,  100, 550));
    //typhoons.push(new typhoon(1, 85, -100, 1000));
    //typhoons.push(new typhoon(2, 65, 930, 500));
    //make_potential();
}

const bar = document.getElementById("bar");

function draw_bar() {
    bar.style.height =  (timestep/endtime*550).toString()+"px";
}

let timestep = -1;
wait();

const title = document.getElementById("title");
function start() {
    timestep = 0;
    refresh();
    title.style.display = "none";
}

function wait () {
    if (timestep % 2 ==0) {
      for (let i=0; i<n_letters; i++) {
          mojis[i].vector();
          mojis[i].move();
      }
      for (let i = 0; i < 2; i++ ) {
          typhoons[i].move();
      }
    }
    timestep --;

    if(timestep >=0)  { return; }

    requestAnimationFrame( wait );
}

function refresh () {
    for (let i=0; i<n_letters; i++) {
        mojis[i].vector();
        mojis[i].move();
    }

    timestep ++;
    for (let i = 0; i < 2; i++ ) {
        typhoons[i].move();
    }

    draw_bar();
    
    if (timestep %100 == 0) {
        console.log(timestep)
    }

    if(timestep > endtime) { finalize(); return; }

    requestAnimationFrame( refresh );
}


function finalize() {
    const ending = document.getElementById("ending");
    ending.style.display = "block";
    const ouvre = document.getElementById("ouvre");
    for ( let i=0; i<haiku.length; i++ ) {
        const span = document.createElement("span");
        span.id = i.toString();
        span.innerText = haiku[i];
        span.setAttribute("onclick","change("+i.toString()+")");
        ouvre.appendChild(span);
    }
    div_haiku.style.display="none";
    bar.style.display="none";
}

function change(i) {
    const span = document.getElementById(i.toString()); 
    let newletter = alt_from.indexOf(haiku[i]);
    console.log(i, newletter);
    if (newletter>=0) {
        haiku[i] = alt_to[newletter];
        console.log(i, newletter, alt_to[newletter]);
        span.innerText = haiku[i];
    }
}

function submit() {
    let game_log = haiku.join('')+ "\r\n\r\nを拾いました。 #magarimiz #samidare";
    navigator.clipboard.writeText(game_log);
    let comment = document.getElementById("share")
    let p = document.createElement("p");
    p.setAttribute("id", "copy-record-description")
    p.innerText = "クリップボードにコピーしました"
    comment.appendChild(p);
}


const div_haiku = document.getElementById("haiku");

function yomu(id) {
    haiku.push(letters[id]);
    div_haiku.innerText = haiku.join('');
    console.log(letters[id], haiku);
}
