'use strict';

const STORAGE_KEY = 'healthSupportSavedData';

let seibetu;
let nenrei;
let shintyo;
let taiju;
let bmi;
let mtaiju;
let mbmi;
let mokuhyouKijitsu;
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
const nenreisou = document.getElementById('nenrei');
const shintyoBox = document.getElementById('shintyo');
const taijuBox = document.getElementById('taiju');
const mtaijuBox = document.getElementById('mtaiju');
const mbmiBox = document.getElementById('mbmi');
const mokuhyouKijitsuBox = document.getElementById('mokuhyouKijitsu');
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
const koudou = document.getElementById('koudou');
const keisanButton = document.getElementById('keisanButton');
const hozonButton = document.getElementById('hozonButton');

const shkarori = document.getElementById('shkarori');
const sekarori = document.getElementById('sekarori');
const ashitaOsusume = document.getElementById('ashitaOsusume');
const souhyou = document.getElementById('souhyou');

setDateMinimum();

sutatobotan.addEventListener('click', () => {
    if (localStorage.getItem(STORAGE_KEY)) {
        const startNew = confirm(
            '保存済みのデータがあります。新しくスタートすると保存済みデータは削除されます。\n本当に新しく始めますか？'
        );
        if (!startNew) return;
        localStorage.removeItem(STORAGE_KEY);
    }

    resetInputs();
    tuginogamenhe(sutatogamen, syokinyuuryoku);
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
    mokuhyouKijitsu = mokuhyouKijitsuBox.value;

    if (!seibetu || !nenrei || !shintyoBox.value || !taijuBox.value || !mtaijuBox.value || !mokuhyouKijitsu) {
        alert('未入力項目があります。');
        return;
    }

    if (!validateRange(shintyoBox, '身長') ||
        !validateRange(taijuBox, '体重') ||
        !validateRange(mtaijuBox, '目標体重')) {
        return;
    }

    const today = startOfToday();
    const goalDate = parseLocalDate(mokuhyouKijitsu);
    if (!goalDate || goalDate <= today) {
        alert('目標期日は明日以降の日付を選んでください。');
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
    const dailyInputs = [gohan, men, pan, kudamono, yasai, nomimono, jikan];
    for (const input of dailyInputs) {
        if (input.value !== '' && !validateRange(input, input.previousElementSibling?.textContent || '入力値')) {
            return;
        }
    }

    if (undousentaku.value && !jikan.value) {
        alert('運動を選択した場合は運動時間も入力してください。');
        return;
    }

    if (!undousentaku.value && Number(jikan.value) > 0) {
        alert('運動時間を入力する場合は、行った運動も選択してください。');
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
            targetDate: mokuhyouKijitsu,
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
            exerciseMinutes: numberOrZero(jikan.value),
            actions: koudou.value.trim()
        },
        result: currentResult
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
    alert('保存しました。');
    tuginogamenhe(sonohinokekka, sutatogamen);
});

function updateBodyValues() {
    shintyo = Number(shintyoBox.value);
    taiju = Number(taijuBox.value);

    if (isValueInRange(shintyoBox) && isValueInRange(taijuBox)) {
        bmi = taiju / (shintyo / 100) ** 2;
        document.getElementById('mokuhyou').classList.remove('hidden');
        updateGoalValues();
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
    }
}

function setBasalMetabolism() {
    const table = seibetu === '男性' ? otokokisotaisya : onnakisotisya;
    const index = nenrei === 'seinen' ? 0 : nenrei === 'tyuunen' ? 1 : 2;
    kisotaisya = table[index];
}

function calculateGoalPlan() {
    const goalDate = parseLocalDate(mokuhyouKijitsu);
    const days = Math.max(1, Math.ceil((goalDate - startOfToday()) / 86400000));
    const weightDiff = mtaiju - taiju;

    // 体重変化に必要なエネルギーは個人差が大きいため、あくまでアプリ内の簡易目安。
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
    const exercise = undousentaku.value;
    const perMinute = {
        running: 8,
        walking: 4,
        squat: 6
    };
    shkcal = Math.round(exerciseMinutes * (perMinute[exercise] || 0));
}

function showResult() {
    shkarori.textContent = shkcal;
    sekarori.textContent = sekcal;

    const estimatedTarget = Math.round(kisotaisya + dailyAdjust);
    const difference = sekcal - estimatedTarget;

    const recommendations = buildRecommendations(difference, estimatedTarget);
    const review = buildReview(difference, estimatedTarget);

    ashitaOsusume.innerHTML = recommendations.map((item) => `<p><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.text)}</p>`).join('');
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

function buildRecommendations(difference, estimatedTarget) {
    let meal;
    let exercise;
    let action;

    if (mokuhyouType === 'gain') {
        if (difference < -250) {
            meal = '主食だけで増やすのではなく、ご飯やパンなどの主食に、肉・魚・卵・乳製品などを組み合わせて食事量を少し増やしてみましょう。';
        } else if (difference > 350) {
            meal = '増量中でも一度に大きく増やしすぎず、明日は普段の食事量に近づけてバランスを整えるのがおすすめです。';
        } else {
            meal = '今の食事量を大きく崩さず、主食・たんぱく質・野菜や果物をそろえることを意識してみましょう。';
        }
        exercise = '無理のない範囲で筋力トレーニングや軽い運動を取り入れ、食事と休養もセットで考えるのがおすすめです。';
        action = '体重だけでなく、食事量・運動・体調の変化も一緒に記録すると増量のペースを確認しやすくなります。';
    } else if (mokuhyouType === 'loss') {
        if (difference > 250) {
            meal = '極端に食事を抜くのではなく、明日は量を少し整えて、主食・たんぱく質・野菜や果物をバランスよく選びましょう。';
        } else if (difference < -350) {
            meal = '今日は食事量がかなり少なめです。明日は無理に減らし続けず、必要な食事をとることを優先しましょう。';
        } else {
            meal = '今の食事量を基準に、間食や飲み物も含めて無理なく続けられるバランスを意識しましょう。';
        }
        exercise = shkcal === 0 ? '体調に問題がなければ、軽いウォーキングなど続けやすい運動から始めるのがおすすめです。' : '今日の運動量を基準に、無理なく続けられる強度を保つのがおすすめです。';
        action = '短期間で大きく落とそうとせず、同じ条件で体重を記録して変化を見ていきましょう。';
    } else {
        meal = Math.abs(difference) <= 250
            ? '現在の食事量を大きく変えず、食品の偏りが出ないようにバランスを意識しましょう。'
            : '体重維持が目標なので、食事量の大きな増減を避けて普段のペースに戻すのがおすすめです。';
        exercise = shkcal === 0 ? '健康維持のために、軽いウォーキングやストレッチなど取り入れやすい運動がおすすめです。' : '今日と同程度の無理のない運動を継続するのがおすすめです。';
        action = '食事・運動・睡眠など、続けやすい生活リズムを優先して記録を続けましょう。';
    }

    return [
        { title: '食事', text: meal },
        { title: '運動', text: exercise },
        { title: '行動', text: action }
    ];
}

function buildReview(difference, estimatedTarget) {
    const goalLabel = mokuhyouType === 'gain' ? '増量' : mokuhyouType === 'loss' ? '減量' : '体重維持';
    const goalDateText = formatDate(mokuhyouKijitsu);
    const comments = [
        `現在は「${goalLabel}」を目標として、${goalDateText}までの記録を進めています。`,
        `今日の摂取カロリーは約${sekcal} kcal、運動による消費は約${shkcal} kcalでした。`
    ];

    if (Math.abs(difference) <= 250) {
        comments.push('今日の食事量は、設定した目標ペースから大きく外れていません。1日だけで判断せず、数日単位で変化を見るのがおすすめです。');
    } else if (difference > 250) {
        comments.push(`アプリ内の簡易目安（約${estimatedTarget} kcal）より今日は多めでした。明日だけ極端に減らすのではなく、少しずつ整えてください。`);
    } else {
        comments.push(`アプリ内の簡易目安（約${estimatedTarget} kcal）より今日は少なめでした。目標が減量でも、食事を極端に減らし続けるのは避けましょう。`);
    }

    if (numberOrZero(yasai.value) === 0 && numberOrZero(kudamono.value) === 0) {
        comments.push('野菜・果物の記録がありません。食べている場合は記録し、明日はどちらかを食事に加えると内容を整えやすくなります。');
    } else {
        comments.push('野菜または果物の記録があります。量だけでなく、食事全体の組み合わせも意識すると記録がより役立ちます。');
    }

    if (koudou.value.trim()) {
        comments.push(`今日の行動メモ「${koudou.value.trim()}」も保存対象です。続けられた行動は、明日も無理のない範囲で繰り返してみましょう。`);
    } else {
        comments.push('行動メモは未入力でした。運動以外の小さな工夫も残しておくと、後から振り返りやすくなります。');
    }

    comments.push('この結果は入力した食品量と簡易計算による目安です。体調や治療目的の食事管理が必要な場合は、医師や管理栄養士などの専門家の指示を優先してください。');
    return comments;
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
}

function resetInputs() {
    document.querySelectorAll('input[name="gender"]').forEach((item) => {
        item.checked = false;
    });
    document.querySelectorAll('input[type="number"], input[type="text"], input[type="date"], textarea').forEach((item) => {
        item.value = '';
    });
    document.querySelectorAll('select').forEach((item) => {
        item.selectedIndex = 0;
    });

    document.getElementById('mokuhyou').classList.add('hidden');
    mokuhyouHoukou.textContent = '目標体重を入力すると目標タイプを表示します。';
    setDateMinimum();

    seibetu = undefined;
    nenrei = undefined;
    shintyo = undefined;
    taiju = undefined;
    bmi = undefined;
    mtaiju = undefined;
    mbmi = undefined;
    mokuhyouKijitsu = undefined;
    kisotaisya = undefined;
    mokuhyouType = 'maintain';
    dailyAdjust = 0;
    currentResult = null;
}

function setDateMinimum() {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    mokuhyouKijitsuBox.min = toLocalDateString(tomorrow);
}

function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function parseLocalDate(dateText) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return null;
    const [year, month, day] = dateText.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
}

function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(dateText) {
    const date = parseLocalDate(dateText);
    if (!date) return dateText;
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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
