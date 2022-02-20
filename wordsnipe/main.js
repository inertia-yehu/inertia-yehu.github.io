var correctAnswer = "";
var correctAnswer_seion = [];
var correctAnswer_index = [];
var newestAnswer = "     ";
var newestAnswer_seion = "     ";
var attempt = 0;
var correctLetter = 0;
var endgame = false;
var submittedCharacters = "";
var submittedDakuon= [];
var correctCharacters = [];
var grazeCharacters = [];
var graze_index = [];
var game_number = 0;
var game_log;

var today = new Date();
today.setTime(today.getTime());
var month = today.getMonth()+1;
var day = today.getDate();
var todayNumber = today.getFullYear()*10000+month*100 + day
var todayString = (month*100 + day).toString()
var seed = "";

var seed = (todayNumber * 16807 % 2147483647) % answers.length;

// localstorage
var ls_record = JSON.parse(localStorage.getItem("record"));
var ls_char   = localStorage.getItem("char");
var ls_dakuon = JSON.parse(localStorage.getItem("dakuon"));
var ls_gameid = JSON.parse(localStorage.getItem("gameid"));
if ( ls_record ) {;} else { ls_record = [0,0,0,0,0,0,0,0,0,0,0]; };
if (ls_gameid == todayString) {
    if ( ls_char ) { submittedCharacters = ls_char };
    if ( ls_dakuon ) { submittedDakuon = ls_dakuon };
} else {
    ls_dakuon = []; ls_gameid = []; submittedCharacters = ""; submittedDakuon = [];
    writedownCookie(); 
};

function writedownCookie() {
    localStorage["char"] = submittedCharacters;
    localStorage["dakuon"] = JSON.stringify(submittedDakuon);
    localStorage["gameid"] = todayString;
}

let i_log = 0;

if (localStorage["record"] ) { show_record(); }


initialize(seed); // 初回の初期化

function initialize(seed) {
    correctAnswer = answers[seed];
    correctAnswer_kaki = answer_kaki[seed];
    correctAnswer_seion = seionka(correctAnswer).split("");
    for (let i=0; i<4; i++) {
      correctAnswer_index[i] = gojuon_seion.indexOf(correctAnswer_seion[i])
    }
    graze_index = getGraze(correctAnswer_index)
    newestAnswer = "     ";
    newestAnswer_seion = "     ";
    endgame = false;
    let el = document.getElementById('onemoreshot-button')
    el.style.display= "none";
    attempt = 0;
    correctCharacters = [];
    //console.log(game_number);

    if ( game_number == 0 ) {
        const textArea = document.getElementById("slot");
        while ( i_log < submittedDakuon.length) {
            attempt ++;
            //console.log(submittedDakuon[i_log], submittedCharacters.substr(i_log*4,4));
            textArea.appendChild(makeAnswerDisplayNodes(submittedDakuon[i_log], submittedCharacters.substr(i_log*4,4)));
            if ( seionka(correctAnswer) == submittedCharacters.substr(i_log*4,4)) {
                i_log ++;
                finalize( false, attempt == i_log );
                restart();
                i_log --;
            }
            i_log ++;
        };
    } else {
        //submittedCharacters = "";
        grazeCharacters = [];
    }

    correctLetter = 0;

    makeGojuon();
}

function seionka(input) {
    let output = input;
    for (let i=0; i < 35; i++) {
      output = output.split(letter_dakuon[i]).join(letter_seion[i]);
    }
    return output
};

function getGraze(index) {
    let output = [];
    const no = [36,38,48]
    for (i=0; i<4; i++) {
        if (index[i]   >=5 ) {output.push(index[i]-5)}
        if (index[i]   <=45) {output.push(index[i]+5)}
        if (index[i]%5 != 0) {output.push(index[i]-1)}
        if (index[i]%5 != 4) {output.push(index[i]+1)}
    }
    output = output.filter( item=> item != 36)
    output = output.filter( item=> item != 38)
    output = output.filter( item=> item != 48)
    return output
};



//回答を入力したとき
function submit() {
    if (document.getElementById("text-box").value.length != 4) {
        document.getElementById("caution-area").innerText = "ひらがな4文字で入力してください";
        if ( document.getElementById("text-box").value == "showlog" ) {
            document.getElementById("caution-area").innerHTML = localStorage["dakuon"] + "<br>" + localStorage["char"] + "<br>" + game_number + ":" + seed+ ":"+ attempt 
        }
    } else {
        document.getElementById("caution-area").innerText = "";
        var input = document.getElementById("text-box").value;
        if (check(input)) {
            attempt += 1;
            newestAnswer = input;
            newestAnswer_seion = seionka(newestAnswer);

            submittedCharacters += newestAnswer_seion;
            submittedDakuon.push(newestAnswer);
            renderAnswer(newestAnswer, newestAnswer_seion);
            //if (game_number == 1) {
              writedownCookie();
            //}
        } else {
            document.getElementById("caution-area").innerText = input+"は辞書にありません";
        }
        document.getElementById("text-box").value = "";
    }
}

function check(input) { //辞書にありますか
    if ( dict.includes(input) ) {
      return true
    } else {
      return false
    }
}

// 再描画 submitされたときのみ
function renderAnswer(input, input_seion) {
    const textArea = document.getElementById("slot");
    textArea.appendChild(makeAnswerDisplayNodes(input, input_seion));
    makeGojuon();

    if(correctLetter == 4) { //正解してたら
        finalize(true, game_number==0); 
    }
}

function finalize( add_cookie, add_share ) {

    const textArea = document.getElementById("slot");
    var p = document.createElement("p");
    p.classList.add("correct");
    p.innerText = correctAnswer_kaki+"（"+correctAnswer+"）";
    textArea.appendChild(p);
    endgame = true;

    if ( add_cookie ) {
        if (attempt <= 10) { // cookieのrecordを更新
            ls_record[attempt-1] ++;
        } else {
            ls_record[10] ++;
        };
        localStorage['record'] = JSON.stringify(ls_record);
    };

    show_record();

    if ( add_share ) { // 0-> initialize; 1-> firstgame
        make_game_log(attempt);
        let div_btn = document.createElement("div");
        div_btn.setAttribute("id", "share");
        let button = document.createElement("button");
        button.innerText = "SNSに投稿";
        button.setAttribute("id", "share-button");
        button.setAttribute("onclick", "share()");
        div_btn.appendChild(button);
        textArea.appendChild(div_btn);
    }

    let em = document.getElementById('onemoreshot-button');
    em.style.display= "inline";
    let el = document.getElementById('answer-input');
    el.style.display= "none";
    document.getElementById("caution-area").innerText = "";
}

function show_record() {
    const textArea = document.getElementById("record");
    textArea.innerHTML = "";
    let p = document.createElement("p");
    p.innerHTML = "<u>一二三四五六七八九十他</u>";
    textArea.appendChild(p);
    let texts = [[],[],[],[],[],[],[],[],[],[],[]];
    let texts_length = [];
    let d   = ls_record.slice();
    for (i=0; i < 11; i++) {
        while ( d[i] >= 5  ) { texts[i].push(5); d[i] -= 5; };
        texts[i].push(d[i]);
        texts_length.push(texts[i].length);
    };
    
    let p2 = document.createElement("p");
    for (j=0; j<Math.max(...texts_length); j++) {
        let a = 0; let text = "";
        for (i=0; i<11; i++) {
            p2.appendChild((texts[i].length >=j+1 ? add_five(texts[i][j]) : add_five(0)));
        }
        p2.appendChild (document.createElement("br"));
    };
    textArea.appendChild(p2);
}

function erase_records() {
    localStorage.removeItem['record'];
    ls_record = [0,0,0,0,0,0,0,0,0,0,0];
    localStorage['record'] = JSON.stringify(ls_record);
    show_record();
}

function add_five(n) {
  let svg = document.createElement("img");
  svg.setAttribute("class", "five");
  svg.setAttribute("src"  , "./svgs/"+n.toString()+".svg");
  return svg;
}

function makeGojuon() {
    var gojuonField = document.getElementById("gojuon-area");
    var gojuonClone = gojuonField.cloneNode( false );
    gojuonField.parentNode.replaceChild( gojuonClone , gojuonField );
    var gojuonField = document.getElementById("gojuon-area");

    for(var i = 0; i < gojuons.length; i ++) {
        var div = document.createElement("span");
        let id = (9-i%10)*5 + Math.floor(i/10);
        let moji = gojuons[id];
        div.setAttribute("onclick", "dictate("+id.toString()+")");

        if(submittedCharacters.substr(-attempt*4,4*attempt).includes(moji)) {
            if(correctCharacters.includes(moji)) {
                div.classList.add("green")
            } else if (correctAnswer_seion.includes(moji)) {
                div.classList.add("yellow");
            } else if (graze_index.includes(id)) {
                div.classList.add("red");
            } else {
                div.classList.add("used");
            }
        } else {
            div.classList.add("not-used");
        }
        div.innerText = moji;
        gojuonField.appendChild(div);
        if(i % 10 == 9) {
            var br =document.createElement("br");
            gojuonField.appendChild(br);
        }
    }
    let p = document.createElement("p");
    p.setAttribute("style","text-align:right; color: var(--gray)");
    for (let i = 0; i < 4; i++) {
        const span = document.createElement("span");
        span.setAttribute("onclick", "modify("+i.toString()+")")
        if (i == 3) { 
            span.innerHTML = ' \
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-backspace" viewBox="0 0 20 20">\
                <path d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z"/>\
                <path d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7.08a2 2 0 0 1-1.519-.698L.241 8.65a1 1 0 0 1 0-1.302L5.084 1.7A2 2 0 0 1 6.603 1h7.08zm-7.08 1a1 1 0 0 0-.76.35L1 8l4.844 5.65a1 1 0 0 0 .759.35h7.08a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-7.08z"/>\
                </svg>\
                '
        } else {
            span.innerText = tenten[i];
        }
        span.classList.add("not-used");
        p.appendChild(span);
    }
    gojuonField.appendChild(p);
};

function dictate(id) {
    const text = document.getElementById("text-box");
    if (text.value.length <=3) {
      text.value = text.value + gojuons[id];
    };
};

function dictate(id) {
    const text = document.getElementById("text-box");
    if (text.value.length <=3) {
      text.value = text.value + gojuons[id];
    };
};

function modify(id) {
    const text = document.getElementById("text-box");
    let word = text.value;
    let len = word.length;
    let last = word.substr(-1,1);
    if (len == 0) {return}

    if (id <=2 ) {
        let i = letter_modify[0][id].indexOf(last);
        if ( 0 <= i  ) {
            text.value = word.substr(0,len-1) + letter_modify[1][id][i];
            return;
        }
        i = letter_modify[1][id].indexOf(last);
        if ( 0 <= i ) {
            text.value = word.substr(0,len-1) + letter_modify[0][id][i];
            return;
        }
    };
    if ( id == 3 ) {
        text.value = word.substr(0,len-1);
        return;
    }
}

// 解答のinputから1行分のHTML<div>を返す
function makeAnswerDisplayNodes(input, input_seion) {
    var p = document.createElement("p");
    var inputs_seion = input_seion.split("");
    var inputs = input.split("");
    correctLetter = 0; 

    for(var i = 0; i < inputs.length; i ++) {
        var div = document.createElement("span");
        if (isHit(inputs_seion[i], i)) {
            correctCharacters.push(seionka(inputs_seion[i]))
            div.classList.add("green");
            correctLetter ++;
        } else if (isBlow(inputs_seion[i])) {
            div.classList.add("yellow");
        }  else if (isGraze(inputs_seion[i])) {
            div.classList.add("red");
        } else {
            div.classList.add("gray");
        }
        div.innerText = inputs[i];
        p.append(div);
    }
    return p;
}

function isHit(character, i) {
    return correctAnswer_seion[i] == character
}

function isBlow(character) {
    return correctAnswer_seion.includes(character);
}

function isGraze(character) {
    let ans = false
    let char_id = gojuon_seion.indexOf(character)
    let ao = char_id % 5

    for (let i=0; i<5; i++) {
      let diff = char_id - correctAnswer_index[i]
      if ( diff == 1 && ao != 0) {
        ans = true;
        break;
      } else if ( diff == -1 && ao != 4) {
        ans = true;
        break;
      } else if ( diff == 5 ) {
        ans = true;
        break;
      } else if ( diff == -5 ) {
        ans = true;
        break;
      }
    }
    return ans
}

function make_game_log(attempt) {
    game_log = "ワードスナイプ / 日本語Wordle inertia-yehu.github.io/wordsnipe\r\n No. " + todayString + "\r\n";
    let log_char = submittedCharacters.substr(0,attempt*4);
    for(var i = 0; i < log_char.length; i ++){
        if ((i - 1) % 4 == 3) {
            game_log += "\r\n";
        }
        if (isHit(log_char[i], i%4)) {
            game_log += "🟩";
        } else if (isBlow(log_char[i])) {
            game_log += "🟧";
        } else if (isGraze(log_char[i])) {
            game_log += "🟨";
        } else {
            game_log += "⬜";
        }
    }
}
function share() {
    navigator.clipboard.writeText(game_log);
    let comment = document.getElementById("share")
    let p = document.createElement("p");
    p.setAttribute("id", "copy-record-description")
    p.innerText = "クリップボードにコピーしました"
    comment.appendChild(p);
}
function enterSubmit(){
    if( window.event.keyCode == 13 ){
      submit();
    }
}


function restart() {
  seed = (seed + 100) % answers.length; // 更新
  game_number ++;
  initialize(seed);
  let box = document.getElementById('answer-input')
  box.style.display= "flex";
  return
}


function close_it() {
    let div = document.getElementById('wrapper-explain')
    div.style.display= "none";
    return
};
function showRule() {
  let div = document.getElementById('wrapper-explain');
  div.style.display="flex";
  return
};
