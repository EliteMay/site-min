'use strict';
/*変数まとめ*/
/*初期入力画面*/
let seibetu;      // 性別
let nenrei;       // 年齢
let shintyo;      // 身長
let taiju;        // 体重
let bmi;          // BMI
let mtaiju;       // 目標体重
let mbmi;         // 目標BMI
let kisotaisya;   // 基礎代謝
/* その日ごと入力画面 */
let ktabemono;    // 今日食べたもの
let kundou;       // 今日やった運動
let shkcal;       // 消費カロリー
let sekcal;       // 摂取カロリー
let tkcal;        // 次の日とっていいカロリー
let tundou;       // 次の日の運動
/* 基礎代謝配列 */
const otokokisotaisya = [1520, 1530, 1400];
const onnakisotisya = [1110, 1160, 1110];
/*画面ID取得*/
const sutatogamen =
    document.getElementById('suta-togamen');
const syokinyuuryoku =
    document.getElementById('syokinyuuryoku');
const sonohinyuuryokugamen =
    document.getElementById('sonohinyuuryokugamen');
const sonohinokekka =
    document.getElementById('sonohinokekka');
/*スタートボタン*/
const sutatobotan =
    document.getElementById('sutatobotan');
sutatobotan.addEventListener('click', () => {
    tuginogamenhe(
        sutatogamen,
        syokinyuuryoku
    );
});
/*性別選択*/
const genderList = document.querySelectorAll('input[name="gender"]');
genderList.forEach(function (gender) {
    gender.addEventListener('change', function () {
        seibetu = gender.value;
        console.log(seibetu + "が選択されました。");
    });
});
/*年齢入力*/
const nenreisou = document.getElementById("nenrei");
nenreisou.addEventListener("change", () => {
    nenrei = nenreisou.value;
    console.log("年齢：" + nenrei);
});
/*身長・体重入力*/
const shintyoBox = document.getElementById('shintyo');
const taijuBox = document.getElementById('taiju');
/*身長入力*/
shintyoBox.addEventListener('input', () => {
    shintyo = shintyoBox.value;
    console.log("身長：" + shintyo + "cm");
    if (shintyo != "" && taiju != "") {
        bmikeisan(shintyo, taiju);
    }
});
/*体重入力*/
taijuBox.addEventListener('input', () => {
    taiju = taijuBox.value;
    console.log("体重：" + taiju + "kg");
    if (shintyo != "" && taiju != "") {
        bmikeisan(shintyo, taiju);
    }
});
/*目標値入力*/
const mtaijuBox = document.getElementById('mtaiju');
const mbmiBox = document.getElementById('mbmi');
/*目標体重から目標BMIを計算*/
mtaijuBox.addEventListener('input', () => {
    mtaiju = mtaijuBox.value;
    if (shintyo != "" && mtaiju != "") {
        mbmi = mtaiju / (shintyo / 100) ** 2;
        mbmiBox.value = mbmi.toFixed(1);
        console.log("目標BMI：" + mbmi.toFixed(1));
    }
});
/*目標BMIを直接入力した場合*/
mbmiBox.addEventListener('input', () => {
    mbmi = mbmiBox.value;
});
/*「次へ」ボタン*/
const nyuryokutugihe = document.getElementById('nyuryokutugihe');
nyuryokutugihe.addEventListener('click', () => {
    /*念のため現在選択されている性別を取得*/
    const selectedGender = document.querySelector(
        'input[name="gender"]:checked');
    if (selectedGender != null) {
        seibetu = selectedGender.value;
    }
    /*基礎代謝計算*/
    if (seibetu == "男性") {
        switch (nenrei) {
            case "seinen":
                kisotaisya = otokokisotaisya[0];
                break;
            case "tyuunen":
                kisotaisya = otokokisotaisya[1];
                break;
            case "kounen":
                kisotaisya = otokokisotaisya[2];
                break;
        }
    }
    else if (seibetu == "女性") {
        switch (nenrei) {
            case "seinen":
                kisotaisya = onnakisotisya[0];
                break;
            case "tyuunen":
                kisotaisya = onnakisotisya[1];
                break;
            case "kounen":
                kisotaisya = onnakisotisya[2];
                break;
        }
    }
    console.log("基礎代謝：" + kisotaisya);
    /*未入力チェック*/
    if (
        seibetu != undefined &&
        nenrei != undefined &&
        shintyo != "" &&
        taiju != "" &&
        bmi != undefined &&
        mtaiju != "" &&
        mbmi != undefined &&
        kisotaisya != undefined
    ) {
        tuginogamenhe(syokinyuuryoku, sonohinyuuryokugamen);
    }
    else {
        alert("未入力項目があります！");
    }
});
/*今日の入力画面*/
const gohan = document.getElementById('gohan');
const men = document.getElementById('men');
const pan = document.getElementById('pan');
const kudamono = document.getElementById('kudamono');
const yasai = document.getElementById('yasai');
const nomimono = document.getElementById('nomimono');
const undousentaku = document.getElementById('undousentaku');
const jikan = document.getElementById('jikan');
const keisanButton = document.getElementById('keisanButton');
/*カロリー計算ボタン*/
keisanButton.addEventListener('click', () => {
    /*摂取カロリー*/
    sekcal = 0;
    /*入力された数字をgとして計算
    ご飯     100g = 156kcal
    麺       100g = 130kcal
    パン     100g = 260kcal
    果物     100g = 50kcal
    野菜     100g = 30kcal
    飲み物   100ml = 40kcal
    */
    if (gohan.value != "") {
        sekcal += Number(gohan.value) * 1.56;
    }
    if (men.value != "") {
        sekcal += Number(men.value) * 1.30;
    }
    if (pan.value != "") {
        sekcal += Number(pan.value) * 2.60;
    }
    if (kudamono.value != "") {
        sekcal += Number(kudamono.value) * 0.50;
    }
    if (yasai != null) {
        if (yasai.value != "") {
            sekcal += Number(yasai.value) * 0.30;
        }
    }
    if (nomimono.value != "") {
        sekcal += Number(nomimono.value) * 0.40;
    }
    sekcal = Math.round(sekcal);
    console.log("摂取カロリー：" + sekcal + "kcal");
    /*運動による消費カロリー*/
    kundou = undousentaku.value;
    let undoujikan = Number(jikan.value);
    shkcal = 0;
    switch (kundou) {
        case "running":
            /* 1分 約8kcal */
            shkcal = undoujikan * 8;
            break;
        case "walking":
            /* 1分 約4kcal */
            shkcal = undoujikan * 4;
            break;
        case "squat":
            /* 1分 約6kcal */
            shkcal = undoujikan * 6;
            break;
        default:
            shkcal = 0;
            break;
    }
    shkcal =
        Math.round(shkcal);
    console.log("運動消費カロリー：" + shkcal + "kcal");
    /*結果を表示*/
    kekkahyouji();
});
/*関数まとめ*/
/*画面切り替え*/
let tuginogamenhe = (kasusugamen, tuginogamen) => {
        kasusugamen.classList.add("hidden");
        tuginogamen.classList.remove("hidden");
    };
/*要素を隠す*/
let yousokakusi = (kakusu) => {
        kakusu.classList.add("hidden");
        console.log("要素を隠します。");
    };
/*要素を表示*/
let yousohyouji = (hyouji) => {
        hyouji.classList.remove("hidden");
        console.log("要素を表示します。");
    };
/*数字判定*/
let suujihanntei = (hannteisuuji) => {
        if (isNaN(hannteisuuji)) {
            alert("数字を入力してください!");
            return false;
        }
        return true;
    };
/*BMI計算*/
let bmikeisan = (shintyo, taiju) => {
        bmi = taiju / (shintyo / 100) ** 2;
        const mokuhyou = document.getElementById('mokuhyou');
        /* 目標入力欄を表示 */
        yousohyouji(mokuhyou);
        console.log("BMI：" + bmi.toFixed(1));
        return bmi;
    };
/*結果表示*/
let kekkahyouji = () => {
    /*HTMLの結果表示場所*/
    const shkarori = document.getElementById('shkarori');
    const sekarori = document.getElementById('sekarori');
    const tasseiritsu = document.getElementById('tasseiritsu');
    const ashitakaori = document.getElementById('ashitakaori');
    const ashinoUndou = document.getElementById('ashinoUndou');
    const souhyou = document.getElementById('souhyou');
    /*消費・摂取カロリー表示*/
    shkarori.textContent = shkcal;
    sekarori.textContent = sekcal;
    /*1日の目標カロリー
      今回は基礎代謝を基準として使用
      */
    let mokuhyouKcal = kisotaisya;
    /*達成率*/
    let tassei = 0;
    if (mokuhyouKcal > 0) {
        tassei = sekcal / mokuhyouKcal * 100;
    }
    tassei = Math.round(tassei);
    tasseiritsu.textContent = tassei;
    /*明日とっていいカロリー*/
    let sa = sekcal - mokuhyouKcal;
    if (sa > 0) {
        /*今日食べすぎた場合
          明日は少し減らす
        */
        tkcal = mokuhyouKcal - sa;
    }
    else {
        /*今日が目標以下なら
          基礎代謝分を目安
        */
        tkcal = mokuhyouKcal;
    }
    /*極端に少なくならないように
      最低1000kcalにする
    */
    if (tkcal < 1000) {
        tkcal = 1000;
    }
    tkcal = Math.round(tkcal);
    ashitakaori.textContent = tkcal +" kcal";
    /*明日の運動目安*/
    if (sa > 300) {
        tundou = "ランニングを30分程度";
    }
    else if (sa > 100) {
        tundou = "ウォーキングを30分程度";
    }
    else {
        tundou = "軽いウォーキングを20分程度";
    }
    ashinoUndou.textContent = tundou;
    /*総評*/
    if (tassei >= 90 && tassei <= 110) {
        souhyou.textContent = "今日は目標に近いカロリー摂取ができています。この調子で続けましょう！";
    }
    else if (tassei > 110) {
        souhyou.textContent = "今日は少しカロリーを多く摂取しています。明日は食事量と運動を少し意識してみましょう。";
    }
    else {
        souhyou.textContent = "今日は摂取カロリーが少なめです。無理に減らしすぎず、バランスよく食事をとりましょう。";
    }
    /*結果画面へ*/
    tuginogamenhe(sonohinyuuryokugamen,sonohinokekka);
    const modoruButton = document.getElementById('modoruButton');
    modoruButton.addEventListener('click', () => {
        tuginogamenhe(sonohinokekka,sutatogamen);
    });
};
