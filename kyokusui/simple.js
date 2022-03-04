const letters = "いろはにほへとちりぬるをわかよたれそつねならむういのおくやまけふこえてあさきゆめみしえいもせすんー"

const alt_from = "かきくけこさしすせとたちつてとはひふへほあいうえおやゆよがぎぐげござじずぜぞだぢづでどばびぶべぼぁぃぅぇぉゃゅょぱぴぷぺぽ".split("");
const alt_to   = "がぎぐげござじずぜぞだぢづでどばびぶべぼぁぃぅぇぉゃゅょかきくけこさしすせとたちってとぱぴぷぺぽあいゔえおやゆよはひふへほ".split("");

const n_letters = letters.length

const windowX = 280;
const windowY = 550;
const outframeX = 100;
const outframeY = 200;

let mojis = [];
let mojis_id = [];
let main_window = document.getElementById("main_window");

let count_mojis = 0;

let typhoons = [];

let n_typhoons = 0;

let endtime = 60*60;

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



class typhoon {
    constructor(id, power, x, y, t_vx, t_vy, lifetime) {
        this.id = id;
        this.power0 = power;
        this.power = power;
        this.lifetime = lifetime;
        this.lt = 0;
        this.x = x;
        this.y = y;
        this.vx = t_vx;
        this.vy = t_vy;
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
        if ( this.x< 0 ) { this.x += flen_x};
        this.div.style.top  = (this.y-outframeY).toString()+"px";
        this.div.style.left = (this.x-outframeX).toString()+"px";
        this.lt ++;
        this.power = this.power0*Math.sin(Math.PI*this.lt/this.lifetime)**2;
    }
    vissitude () {

    }
}

const hosei_x = [0, -1,  0, 1, 0, -1,  1,  1,  1];
const hosei_y = [0,  0, -1, 0, 1, -1, -1, -1,  1];

class c_moji {
    constructor(id, cid, y0) {
        this.id = id;
        this.cid = cid;
        this.l = letters[cid];
        this.go = Math.floor(2*Math.random())*2-1;
        this.x =  flen_x * Math.random();//* ( 0.5 + id% 7 ) /  7;
        this.y =  flen_y * Math.random();//* ( 0.5 + Math.floor(id/7) ) / 7;
        if (y0 == true ) {this.y = 50;}
        this.vx = 0.;
        this.vy = 0.;
        this.vx0 = Math.random()*0.1;
        this.vy0 = 1.5+Math.random()*0.5;
        this.size = 95- (this.vx0**2 + this.vy0**2)**0.5*300;

        this.div = document.createElement("div");
        this.div.innerText = this.l;
        this.div.classList.add("letter");
        this.div.style.left = (this.x-outframeX).toString()+"px";
        this.div.style.top  = (this.y-outframeY).toString()+"px";
        this.div.setAttribute("onclick", "yomu("+cid.toString()+")");
        main_window.appendChild(this.div);
        this.div.style.zIndex = 40+Math.floor(Math.random()*8);
        this.div.setAttribute("style", "font-size:" + this.size.toString()+"px");
        this.ouch = true;
        console.log(mojis_id.findIndex(dum => dum == this.id), this.id);

    }

    vector() {
        this.vx = this.vx0+0.; this.vy = this.vy0+0.;
        for ( let j=0 ; j<9; j++ ) {
            for ( let i=0 ; i<n_typhoons; i++ ) {
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
        for ( let i=0 ; i<mojis.length; i++ ) {
            let dx1 = (this.x-mojis[i].x);
            let dy1 = (this.y-mojis[i].y);
            let r2 = (dx1**2+dy1**2)+5;
            if (mojis[i].id==this.id ) { continue }
            else if (r2<10000) {
                this.x += 100* (dx1) / r2**1.5;
                this.y += 100* (dy1) / r2**1.5;
            }
        }
        this.x += this.vx;
        this.y += this.vy;
        this.div.style.top  = (this.y-outframeY).toString()+"px";
        this.div.style.left = (this.x-outframeX).toString()+"px";
        if ( this.x > flen_x ){
            this.x -= flen_x;
            this.y += (Math.random()-0.5)*40;
        } else if ( this.x < 0) {
            this.x += flen_x;
            this.y += (Math.random()-0.5)*40;
        }
        if ( this.y > flen_y ){
            console.log(this.id, this.y, flen_y, this.vy, letters[this.cid]);
            let killid = mojis_id.findIndex(dum => dum == this.id);
            mojis.splice(killid,1);
            mojis_id.splice(killid,1);
            this.div.remove();
            add_mojis(true);
        } 
    } 

}

const add_mojis = (y0) => {
    mojis.push(new c_moji(count_mojis, count_mojis%n_letters, y0));
    mojis_id.push(count_mojis);
    count_mojis += 1+Math.floor(Math.random()**4*100);
}

initialize();



function initialize() {
    for (let i=0; i<35; i++) {
        add_mojis(false);
    }
    typhoons.push(new typhoon(0, 150, 800, 100, 0.3, 1., 1000));
    typhoons.push(new typhoon(1, -50,  100, 550, 0.2, 1., 500));
    n_typhoons = 2;
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
      for (let i=0; i<mojis.length; i++) {
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
    for (let i=0; i<mojis.length; i++) {
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
    ending.style.display = "flex";
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
    let game_log = "60秒で「"+haiku.join('')+ "」を詠みました。 https://yehu-inertia.github.io/kyokusui #kyokusui";
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
