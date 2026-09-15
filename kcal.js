'use strict';

const STORAGE_KEY = 'healthSupportSavedData';

let seibetu;
let nenrei;
let shintyo;
let taiju;
let bmi;
let mtaiju;
let mbmi;
let mokuhyouPlanMonths;
let kisotaisya;
let sekcal = 0;
let shkcal = 0;
let mokuhyouType = 'maintain';
let dailyAdjust = 0;
let currentResult = null;

const otokokisotaisya = [1520, 1530, 1400];
const onnakisotisya = [1110, 1160, 1110];

const sutatogamen = document.getElementById('suta-togamen');
const syokinyuuryoku = document.getElementById('syokinyuuryoku');
const sonohinyuuryokugamen = document.getElementById('sonohinyuuryokugamen');
const sonohinokekka = document.getElementById('sonohinokekka');

const sutatobotan = document.getElementById('sutatobotan');
const tudukikara = document.getElementById('tudukikara');
const syokiModoruButton = document.getElementById('syokiModoruButton');
const nyuryokuModoruButton = document.getElementById('nyuryokuModoruButton');
const kekkaModoruButton = document.getElementById('kekkaModoruButton');
const nenreisou = document.getElementById('nenrei');
const shintyoBox = document.getElementById('shintyo');
const taijuBox = document.getElementById('taiju');
const mtaijuBox = document.getElementById('mtaiju');
const mbmiBox = document.getElementById('mbmi');
const mokuhyouPlanBox = document.getElementById('mokuhyouPlan');
const mokuhyouHoukou = document.getElementById('mokuhyouHoukou');
const nyuryokutugihe = document.getElementById('nyuryokutugihe');

const gohan = document.getElementById('gohan');
const men = document.getElementById('men');
const pan = document.getElementById('pan');
const kudamono = document.getElementById('kudamono');
const yasai = document.getElementById('yasai');
const nomimono = document.getElementById('nomimono');
const undousentaku = document.getElementById('undousentaku');
const jikan = document.getElementById('jikan');
const keisanButton = document.getElementById('keisanButton');
const hozonButton = document.getElementById('hozonButton');

const shkarori = document.getElementById('shkarori');
const sekarori = document.getElementById('sekarori');
const ashitaOsusume = document.getElementById('ashitaOsusume');
const souhyou = document.getElementById('souhyou');

const numericInputs = [
    shintyoBox, taijuBox, mtaijuBox,
    gohan, men, pan, kudamono, yasai, nomimono, jikan
];

setupNumericLimits();
updateContinueButton();

sutatobotan.addEventListener('click', () => {
    if (localStorage.getItem(STORAGE_KEY)) {
        const startNew = confirm(
            '保存済みのデータがあります。新しくスタートすると保存済みデータは削除されます。\n本当に新しく始めますか？'
        );
        if (!startNew) return;
        localStorage.removeItem(STORAGE_KEY);
        updateContinueButton();
    }

    resetInputs();
    tuginogamenhe(sutatogamen, syokinyuuryoku);
});

tudukikara.addEventListener('click', () => {
    continueFromSavedData();
});

syokiModoruButton.addEventListener('click', () => {
    tuginogamenhe(syokinyuuryoku, sutatogamen);
    updateContinueButton();
});

nyuryokuModoruButton.addEventListener('click', () => {
    tuginogamenhe(sonohinyuuryokugamen, syokinyuuryoku);
});

kekkaModoruButton.addEventListener('click', () => {
    currentResult = null;
    tuginogamenhe(sonohinokekka, sonohinyuuryokugamen);
});

document.querySelectorAll('input[name="gender"]').forEach((gender) => {
    gender.addEventListener('change', () => {
        seibetu = gender.value;
    });
});

nenreisou.addEventListener('change', () => {
    nenrei = nenreisou.value;
});

shintyoBox.addEventListener('input', updateBodyValues);
taijuBox.addEventListener('input', updateBodyValues);
mtaijuBox.addEventListener('input', updateGoalValues);

nyuryokutugihe.addEventListener('click', () => {
    const selectedGender = document.querySelector('input[name="gender"]:checked');
    seibetu = selectedGender ? selectedGender.value : undefined;
    nenrei = nenreisou.value;
    shintyo = Number(shintyoBox.value);
    taiju = Number(taijuBox.value);
    mtaiju = Number(mtaijuBox.value);
    mokuhyouPlanMonths = Number(mokuhyouPlanBox.value);

    if (!seibetu || !nenrei || !shintyoBox.value || !taijuBox.value || !mtaijuBox.value || !mokuhyouPlanMonths) {
        alert('未入力項目があります。');
        return;
    }

    if (!validateRange(shintyoBox, '身長') ||
        !validateRange(taijuBox, '体重') ||
        !validateRange(mtaijuBox, '目標体重')) {
        return;
    }

    bmi = taiju / (shintyo / 100) ** 2;
    mbmi = mtaiju / (shintyo / 100) ** 2;
    mbmiBox.value = mbmi.toFixed(1);

    setBasalMetabolism();
    calculateGoalPlan();
    tuginogamenhe(syokinyuuryoku, sonohinyuuryokugamen);
});

keisanButton.addEventListener('click', () => {
    const dailyInputs = [
        [gohan, 'ご飯'],
        [men, '麺'],
        [pan, 'パン'],
        [kudamono, '果物'],
        [yasai, '野菜'],
        [nomimono, '飲み物'],
        [jikan, '運動時間']
    ];

    for (const [input, label] of dailyInputs) {
        if (input.value !== '' && !validateRange(input, label)) return;
    }

    if (undousentaku.value && (!jikan.value || Number(jikan.value) <= 0)) {
        alert('運動を選択した場合は、運動時間を1分以上入力してください。');
        jikan.focus();
        return;
    }

    if (!undousentaku.value && Number(jikan.value) > 0) {
        alert('運動時間を入力する場合は、行った運動も選択してください。');
        undousentaku.focus();
        return;
    }

    calculateCalories();
    showResult();
});

hozonButton.addEventListener('click', () => {
    if (!currentResult) return;

    const savedData = {
        savedAt: new Date().toISOString(),
        profile: {
            gender: seibetu,
            ageGroup: nenrei,
            height: shintyo,
            weight: taiju,
            bmi: Number(bmi.toFixed(1)),
            targetWeight: mtaiju,
            targetBmi: Number(mbmi.toFixed(1)),
            targetPlanMonths: mokuhyouPlanMonths,
            goalType: mokuhyouType
        },
        today: {
            food: {
                rice: numberOrZero(gohan.value),
                noodles: numberOrZero(men.value),
                bread: numberOrZero(pan.value),
                fruit: numberOrZero(kudamono.value),
                vegetables: numberOrZero(yasai.value),
                drink: numberOrZero(nomimono.value)
            },
            exercise: undousentaku.value,
            exerciseMinutes: numberOrZero(jikan.value)
        },
        result: currentResult
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
    updateContinueButton();
    alert('保存しました。');
    tuginogamenhe(sonohinokekka, sutatogamen);
});

function updateContinueButton() {
    if (localStorage.getItem(STORAGE_KEY)) {
        tudukikara.classList.remove('hidden');
    } else {
        tudukikara.classList.add('hidden');
    }
}

function continueFromSavedData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        updateContinueButton();
        return;
    }

    try {
        const savedData = JSON.parse(raw);
        const profile = savedData.profile;

        if (!profile || !profile.gender || !profile.ageGroup || !profile.height || !profile.weight || !profile.targetWeight) {
            throw new Error('invalid saved data');
        }

        seibetu = profile.gender;
        nenrei = profile.ageGroup;
        shintyo = Number(profile.height);
        taiju = Number(profile.weight);
        mtaiju = Number(profile.targetWeight);
        bmi = Number(profile.bmi) || taiju / (shintyo / 100) ** 2;
        mbmi = Number(profile.targetBmi) || mtaiju / (shintyo / 100) ** 2;
        mokuhyouPlanMonths = Number(profile.targetPlanMonths) || 3;
        mokuhyouType = profile.goalType || 'maintain';

        const genderRadio = document.querySelector(`input[name="gender"][value="${seibetu}"]`);
        if (genderRadio) genderRadio.checked = true;
        nenreisou.value = nenrei;
        shintyoBox.value = shintyo;
        taijuBox.value = taiju;
        mtaijuBox.value = mtaiju;
        mbmiBox.value = mbmi.toFixed(1);
        mokuhyouPlanBox.value = String(mokuhyouPlanMonths);
        document.getElementById('mokuhyou').classList.remove('hidden');
        updateGoalValues();
        setBasalMetabolism();
        calculateGoalPlan();
        clearDailyInputs();
        tuginogamenhe(sutatogamen, sonohinyuuryokugamen);
    } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        updateContinueButton();
        alert('保存データを読み込めませんでした。新しくスタートしてください。');
    }
}

function clearDailyInputs() {
    [gohan, men, pan, kudamono, yasai, nomimono, jikan].forEach((input) => {
        input.value = '';
    });
    undousentaku.selectedIndex = 0;
    sekcal = 0;
    shkcal = 0;
    currentResult = null;
    shkarori.textContent = '0';
    sekarori.textContent = '0';
    ashitaOsusume.textContent = '---';
    souhyou.textContent = '---';
}

function setupNumericLimits() {
    numericInputs.forEach((input) => {
        input.addEventListener('input', () => {
            if (input.value === '') return;
            const value = Number(input.value);
            const max = input.max === '' ? Infinity : Number(input.max);

            if (!Number.isFinite(value)) {
                input.value = '';
                return;
            }

            if (value < 0) {
                input.value = '0';
            } else if (value > max) {
                input.value = String(max);
            }
        });

        input.addEventListener('blur', () => {
            if (input.value === '') return;
            const value = Number(input.value);
            const min = input.min === '' ? -Infinity : Number(input.min);
            const max = input.max === '' ? Infinity : Number(input.max);

            if (!Number.isFinite(value) || value < min || value > max) {
                alert(`${rangeLabel(input)}は${min}〜${max}の範囲で入力してください。`);
                input.value = '';
                if (input === shintyoBox || input === taijuBox) updateBodyValues();
                if (input === mtaijuBox) updateGoalValues();
            }
        });
    });
}

function rangeLabel(input) {
    const labels = new Map([
        [shintyoBox, '身長'], [taijuBox, '体重'], [mtaijuBox, '目標体重'],
        [gohan, 'ご飯'], [men, '麺'], [pan, 'パン'], [kudamono, '果物'],
        [yasai, '野菜'], [nomimono, '飲み物'], [jikan, '運動時間']
    ]);
    return labels.get(input) || '入力値';
}

function updateBodyValues() {
    shintyo = Number(shintyoBox.value);
    taiju = Number(taijuBox.value);

    if (isValueInRange(shintyoBox) && isValueInRange(taijuBox)) {
        bmi = taiju / (shintyo / 100) ** 2;
        document.getElementById('mokuhyou').classList.remove('hidden');
        updateGoalValues();
    } else {
        document.getElementById('mokuhyou').classList.add('hidden');
    }
}

function updateGoalValues() {
    shintyo = Number(shintyoBox.value);
    taiju = Number(taijuBox.value);
    mtaiju = Number(mtaijuBox.value);

    if (isValueInRange(shintyoBox) && isValueInRange(mtaijuBox)) {
        mbmi = mtaiju / (shintyo / 100) ** 2;
        mbmiBox.value = mbmi.toFixed(1);
    } else {
        mbmiBox.value = '';
    }

    if (isValueInRange(taijuBox) && isValueInRange(mtaijuBox)) {
        if (mtaiju > taiju + 0.1) {
            mokuhyouType = 'gain';
            mokuhyouHoukou.textContent = '目標タイプ：増量';
        } else if (mtaiju < taiju - 0.1) {
            mokuhyouType = 'loss';
            mokuhyouHoukou.textContent = '目標タイプ：減量';
        } else {
            mokuhyouType = 'maintain';
            mokuhyouHoukou.textContent = '目標タイプ：体重維持';
        }
    } else {
        mokuhyouHoukou.textContent = '目標体重を入力すると目標タイプを表示します。';
    }
}

function setBasalMetabolism() {
    const table = seibetu === '男性' ? otokokisotaisya : onnakisotisya;
    const index = nenrei === 'seinen' ? 0 : nenrei === 'tyuunen' ? 1 : 2;
    kisotaisya = table[index];
}

function calculateGoalPlan() {
    const days = Math.max(30, mokuhyouPlanMonths * 30);
    const weightDiff = mtaiju - taiju;
    dailyAdjust = (weightDiff * 7700) / days;
    dailyAdjust = Math.max(-500, Math.min(500, dailyAdjust));
}

function calculateCalories() {
    sekcal = 0;
    sekcal += numberOrZero(gohan.value) * 1.56;
    sekcal += numberOrZero(men.value) * 1.30;
    sekcal += numberOrZero(pan.value) * 2.60;
    sekcal += numberOrZero(kudamono.value) * 0.50;
    sekcal += numberOrZero(yasai.value) * 0.30;
    sekcal += numberOrZero(nomimono.value) * 0.40;
    sekcal = Math.round(sekcal);

    const exerciseMinutes = numberOrZero(jikan.value);
    const perMinute = {
        walking: 4,
        briskWalking: 5,
        running: 8,
        cycling: 7,
        strength: 6,
        squat: 6,
        swimming: 8,
        stairs: 8,
        jumpRope: 10,
        yoga: 3
    };
    shkcal = Math.round(exerciseMinutes * (perMinute[undousentaku.value] || 0));
}

function showResult() {
    shkarori.textContent = shkcal;
    sekarori.textContent = sekcal;

    const estimatedTarget = Math.round(kisotaisya + dailyAdjust);
    const difference = sekcal - estimatedTarget;
    const recommendations = buildRecommendations(difference);
    const review = buildReview(difference);

    ashitaOsusume.innerHTML = recommendations
        .map((item) => `<p><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.text)}</p>`)
        .join('');
    souhyou.innerHTML = review.map((item) => `<p>${escapeHtml(item)}</p>`).join('');

    currentResult = {
        intakeCalories: sekcal,
        exerciseCalories: shkcal,
        estimatedTargetCalories: estimatedTarget,
        recommendations: recommendations.map((item) => `${item.title}: ${item.text}`),
        review
    };

    tuginogamenhe(sonohinyuuryokugamen, sonohinokekka);
}

function buildRecommendations(difference) {
    let meal;
    let exercise;
    let lifestyle;

    if (mokuhyouType === 'gain') {
        meal = difference < -250
            ? '主食とたんぱく質を少し増やし、無理なく食事量を上げましょう。'
            : difference > 350
                ? '増量中でも食べすぎは避け、明日は普段の量に少し戻しましょう。'
                : '今の量を大きく変えず、主食・たんぱく質・野菜や果物をそろえましょう。';
        exercise = '筋トレを中心に、疲れを残さない範囲で継続しましょう。';
        lifestyle = '睡眠と休養も確保し、急に体重を増やしすぎないようにしましょう。';
    } else if (mokuhyouType === 'loss') {
        meal = difference > 250
            ? '食事を抜かず、明日は量を少し整えましょう。'
            : difference < -350
                ? '今日は少なめです。明日は減らしすぎず、必要な食事をとりましょう。'
                : '今の量を基準に、間食や飲み物も含めて無理なく続けましょう。';
        exercise = shkcal === 0
            ? '体調が良ければ、短いウォーキングから始めましょう。'
            : '今日くらいの運動量を無理なく続けましょう。';
        lifestyle = '短期間で落としすぎず、同じ条件で体重を記録して変化を見ましょう。';
    } else {
        meal = Math.abs(difference) <= 250
            ? '今の食事量を大きく変えず、バランスを意識しましょう。'
            : '体重維持が目標なので、明日は普段の食事量に戻しましょう。';
        exercise = shkcal === 0
            ? '軽いウォーキングやストレッチを取り入れるのがおすすめです。'
            : '今日と同程度の運動を無理なく続けましょう。';
        lifestyle = '食事・運動・睡眠のリズムを崩さないことを優先しましょう。';
    }

    return [
        { title: '食事', text: meal },
        { title: '運動', text: exercise },
        { title: '生活', text: lifestyle }
    ];
}

function buildReview(difference) {
    const comments = [];

    if (Math.abs(difference) <= 250) {
        comments.push('今日は目標ペースから大きく外れていません。この調子で続けましょう。');
    } else if (difference > 250) {
        comments.push('今日は食事量がやや多めです。明日は少しだけ量を整えましょう。');
    } else {
        comments.push('今日は食事量が少なめです。無理に減らしすぎないようにしましょう。');
    }

    if (numberOrZero(yasai.value) === 0 && numberOrZero(kudamono.value) === 0) {
        comments.push('野菜か果物を1品追加すると、食事のバランスを取りやすくなります。');
    }

    if (undousentaku.value) {
        comments.push(`${exerciseName(undousentaku.value)}を${numberOrZero(jikan.value)}分できています。無理のない範囲で継続しましょう。`);
    } else {
        comments.push('運動は未記録です。余裕があれば短時間の運動を入れてみましょう。');
    }

    return comments.slice(0, 3);
}

function exerciseName(value) {
    const names = {
        walking: 'ウォーキング',
        briskWalking: '早歩き',
        running: 'ランニング',
        cycling: '自転車',
        strength: '筋力トレーニング',
        squat: 'スクワット',
        swimming: '水泳',
        stairs: '階段昇降',
        jumpRope: '縄跳び',
        yoga: 'ヨガ・ストレッチ'
    };
    return names[value] || '運動';
}

function validateRange(input, label) {
    if (input.value === '') return true;
    const value = Number(input.value);
    const min = input.min === '' ? -Infinity : Number(input.min);
    const max = input.max === '' ? Infinity : Number(input.max);

    if (!Number.isFinite(value) || value < min || value > max) {
        alert(`${label}は${min}〜${max}の範囲で入力してください。`);
        input.focus();
        return false;
    }
    return true;
}

function isValueInRange(input) {
    if (input.value === '') return false;
    const value = Number(input.value);
    const min = input.min === '' ? -Infinity : Number(input.min);
    const max = input.max === '' ? Infinity : Number(input.max);
    return Number.isFinite(value) && value >= min && value <= max;
}

function tuginogamenhe(kasusugamen, tuginogamen) {
    kasusugamen.classList.add('hidden');
    tuginogamen.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetInputs() {
    document.querySelectorAll('input[name="gender"]').forEach((item) => {
        item.checked = false;
    });
    document.querySelectorAll('input[type="number"], input[type="text"]').forEach((item) => {
        item.value = '';
    });
    document.querySelectorAll('select').forEach((item) => {
        item.selectedIndex = 0;
    });

    document.getElementById('mokuhyou').classList.add('hidden');
    mokuhyouHoukou.textContent = '目標体重を入力すると目標タイプを表示します。';

    seibetu = undefined;
    nenrei = undefined;
    shintyo = undefined;
    taiju = undefined;
    bmi = undefined;
    mtaiju = undefined;
    mbmi = undefined;
    mokuhyouPlanMonths = undefined;
    kisotaisya = undefined;
    mokuhyouType = 'maintain';
    dailyAdjust = 0;
    currentResult = null;
}

function numberOrZero(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function escapeHtml(text) {
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
