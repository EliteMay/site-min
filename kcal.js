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
const syokiHomeButton = document.getElementById('syokiHomeButton');
const nyuryokuHomeButton = document.getElementById('nyuryokuHomeButton');
const kekkaHomeButton = document.getElementById('kekkaHomeButton');

const nenreisou = document.getElementById('nenrei');
const shintyoBox = document.getElementById('shintyo');
const taijuBox = document.getElementById('taiju');
const mtaijuBox = document.getElementById('mtaiju');
const mbmiBox = document.getElementById('mbmi');
const mokuhyouPlanBox = document.getElementById('mokuhyouPlan');
const mokuhyouHoukou = document.getElementById('mokuhyouHoukou');
const nyuryokutugihe = document.getElementById('nyuryokutugihe');

const genzaiTaiju = document.getElementById('genzaiTaiju');
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

const kekkaTaiju = document.getElementById('kekkaTaiju');
const shkarori = document.getElementById('shkarori');
const sekarori = document.getElementById('sekarori');
const ashitaOsusume = document.getElementById('ashitaOsusume');
const souhyou = document.getElementById('souhyou');

const homeSummary = document.getElementById('homeSummary');
const homeGoalType = document.getElementById('homeGoalType');
const homeStartWeight = document.getElementById('homeStartWeight');
const homeCurrentWeight = document.getElementById('homeCurrentWeight');
const homeTargetWeight = document.getElementById('homeTargetWeight');
const homeProgressBar = document.getElementById('homeProgressBar');
const homeProgressText = document.getElementById('homeProgressText');
const homeRemainingText = document.getElementById('homeRemainingText');
const homePlan = document.getElementById('homePlan');
const homeDeadline = document.getElementById('homeDeadline');
const homePace = document.getElementById('homePace');
const homeRecordCount = document.getElementById('homeRecordCount');

const numericInputs = [
    shintyoBox, taijuBox, mtaijuBox, genzaiTaiju,
    gohan, men, pan, kudamono, yasai, nomimono, jikan
];

setupAchievementUI();
setupNumericLimits();
refreshHome();

sutatobotan.addEventListener('click', () => {
    if (localStorage.getItem(STORAGE_KEY)) {
        const startNew = confirm('保存済みの記録があります。新しくスタートすると今までの進捗・履歴が削除されます。\n本当に新しく始めますか？');
        if (!startNew) return;
        localStorage.removeItem(STORAGE_KEY);
        refreshHome();
    }

    resetInputs();
    tuginogamenhe(sutatogamen, syokinyuuryoku);
});

tudukikara.addEventListener('click', continueFromSavedData);
syokiModoruButton.addEventListener('click', goHome);
syokiHomeButton.addEventListener('click', goHome);
nyuryokuHomeButton.addEventListener('click', goHome);
kekkaHomeButton.addEventListener('click', goHome);

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

    if (!validateRange(shintyoBox, '身長') || !validateRange(taijuBox, '体重') || !validateRange(mtaijuBox, '目標体重')) return;

    bmi = taiju / (shintyo / 100) ** 2;
    mbmi = mtaiju / (shintyo / 100) ** 2;
    mbmiBox.value = mbmi.toFixed(1);
    setBasalMetabolism();
    calculateGoalPlan();
    genzaiTaiju.value = taiju;
    tuginogamenhe(syokinyuuryoku, sonohinyuuryokugamen);
});

keisanButton.addEventListener('click', () => {
    const dailyInputs = [
        [genzaiTaiju, '現在の体重'], [gohan, 'ご飯'], [men, '麺'], [pan, 'パン'],
        [kudamono, '果物'], [yasai, '野菜'], [nomimono, '飲み物'], [jikan, '運動時間']
    ];

    if (!genzaiTaiju.value) {
        alert('現在の体重を入力してください。');
        genzaiTaiju.focus();
        return;
    }

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

    const existing = readSavedData();
    const now = new Date();
    const dateKey = toLocalDateString(now);
    const startDate = existing?.startDate || now.toISOString();
    const history = Array.isArray(existing?.history) ? existing.history : [];
    const currentWeight = Number(genzaiTaiju.value);

    const record = {
        date: dateKey,
        savedAt: now.toISOString(),
        weight: currentWeight,
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
        result: currentResult
    };

    const existingIndex = history.findIndex((item) => item.date === dateKey);
    if (existingIndex >= 0) history[existingIndex] = record;
    else history.push(record);
    history.sort((a, b) => String(a.date).localeCompare(String(b.date)));

    const achievedNow = hasReachedGoal(
        mokuhyouType,
        currentWeight,
        mtaiju,
        new Date(startDate),
        mokuhyouPlanMonths,
        now
    );
    const wasAchieved = Boolean(existing?.goalAchieved);

    const savedData = {
        version: 3,
        startDate,
        savedAt: now.toISOString(),
        goalAchieved: wasAchieved || achievedNow,
        achievedAt: wasAchieved ? existing.achievedAt : achievedNow ? now.toISOString() : null,
        achievedWeight: wasAchieved ? existing.achievedWeight : achievedNow ? currentWeight : null,
        profile: {
            gender: seibetu,
            ageGroup: nenrei,
            height: shintyo,
            startWeight: taiju,
            weight: taiju,
            currentWeight,
            bmi: Number(bmi.toFixed(1)),
            targetWeight: mtaiju,
            targetBmi: Number(mbmi.toFixed(1)),
            targetPlanMonths: mokuhyouPlanMonths,
            goalType: mokuhyouType
        },
        history
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));

    if (achievedNow && !wasAchieved) {
        showGoalCelebration(savedData);
        return;
    }

    alert('保存しました。進捗をホームに反映しました。');
    goHome();
});

function goHome() {
    [syokinyuuryoku, sonohinyuuryokugamen, sonohinokekka].forEach((screen) => screen.classList.add('hidden'));
    sutatogamen.classList.remove('hidden');
    currentResult = null;
    refreshHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function refreshHome() {
    const saved = readSavedData();
    const achievedCard = document.getElementById('goalAchievedCard');

    if (!saved) {
        tudukikara.classList.add('hidden');
        homeSummary.classList.add('hidden');
        achievedCard.classList.add('hidden');
        return;
    }

    const profile = saved.profile;
    const history = saved.history || [];
    const startWeight = Number(profile.startWeight ?? profile.weight);
    const currentWeight = getLatestWeight(saved);
    const targetWeight = Number(profile.targetWeight);
    const months = Number(profile.targetPlanMonths) || 3;
    const goalType = getGoalType(startWeight, targetWeight);
    const startDate = new Date(saved.startDate || saved.savedAt || Date.now());
    const achieved = Boolean(saved.goalAchieved) || hasReachedGoal(goalType, currentWeight, targetWeight, startDate, months, new Date());

    if (achieved) {
        homeSummary.classList.add('hidden');
        tudukikara.classList.add('hidden');
        showAchievedHomeCard(saved, currentWeight, targetWeight);
        return;
    }

    achievedCard.classList.add('hidden');

    const progress = calculateWeightProgress(startWeight, currentWeight, targetWeight);
    const remaining = Math.abs(targetWeight - currentWeight);
    const deadline = addMonths(startDate, months);
    const expectedWeight = getExpectedWeight(startWeight, targetWeight, startDate, deadline, new Date());
    const paceText = buildPaceText(goalType, currentWeight, expectedWeight);

    homeGoalType.textContent = goalType === 'gain' ? '増量' : goalType === 'loss' ? '減量' : '維持';
    homeStartWeight.textContent = formatWeight(startWeight);
    homeCurrentWeight.textContent = formatWeight(currentWeight);
    homeTargetWeight.textContent = formatWeight(targetWeight);
    homeProgressBar.style.width = `${progress}%`;
    homeProgressText.textContent = goalType === 'maintain' ? '目標体重を維持中' : `進捗 ${progress}%`;
    homeRemainingText.textContent = goalType === 'maintain' ? `目標との差 ${remaining.toFixed(1)} kg` : `残り ${remaining.toFixed(1)} kg`;
    homePlan.textContent = `${months}か月`;
    homeDeadline.textContent = formatShortDate(deadline);
    homePace.textContent = paceText;
    homeRecordCount.textContent = `${history.length}日`;

    tudukikara.classList.remove('hidden');
    homeSummary.classList.remove('hidden');
}

function continueFromSavedData() {
    const saved = readSavedData();
    if (!saved) {
        refreshHome();
        alert('保存データを読み込めませんでした。');
        return;
    }

    if (saved.goalAchieved) {
        goHome();
        return;
    }

    const profile = saved.profile;
    seibetu = profile.gender;
    nenrei = profile.ageGroup;
    shintyo = Number(profile.height);
    taiju = Number(profile.startWeight ?? profile.weight);
    mtaiju = Number(profile.targetWeight);
    bmi = Number(profile.bmi) || taiju / (shintyo / 100) ** 2;
    mbmi = Number(profile.targetBmi) || mtaiju / (shintyo / 100) ** 2;
    mokuhyouPlanMonths = Number(profile.targetPlanMonths) || 3;
    mokuhyouType = getGoalType(taiju, mtaiju);

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
    clearDailyInputs(getLatestWeight(saved));
    tuginogamenhe(sutatogamen, sonohinyuuryokugamen);
}

function readSavedData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        const profile = parsed.profile;
        if (!profile || !profile.gender || !profile.ageGroup || !profile.height || !profile.targetWeight) return null;

        if (!Array.isArray(parsed.history)) {
            const legacyWeight = Number(profile.currentWeight ?? profile.weight);
            const legacyRecord = parsed.today ? [{
                date: toLocalDateString(new Date(parsed.savedAt || Date.now())),
                savedAt: parsed.savedAt || new Date().toISOString(),
                weight: legacyWeight,
                food: parsed.today.food || {},
                exercise: parsed.today.exercise || '',
                exerciseMinutes: Number(parsed.today.exerciseMinutes) || 0,
                result: parsed.result || null
            }] : [];
            parsed.history = legacyRecord;
        }

        if (!parsed.startDate) parsed.startDate = parsed.savedAt || new Date().toISOString();
        if (profile.startWeight == null) profile.startWeight = Number(profile.weight);
        if (profile.currentWeight == null) profile.currentWeight = getLatestWeight(parsed);
        return parsed;
    } catch (error) {
        return null;
    }
}

function getLatestWeight(saved) {
    const history = Array.isArray(saved.history) ? saved.history : [];
    if (history.length) {
        const latest = history[history.length - 1];
        const weight = Number(latest.weight);
        if (Number.isFinite(weight) && weight > 0) return weight;
    }
    const profileWeight = Number(saved.profile.currentWeight ?? saved.profile.startWeight ?? saved.profile.weight);
    return Number.isFinite(profileWeight) ? profileWeight : 0;
}

function clearDailyInputs(weight) {
    [gohan, men, pan, kudamono, yasai, nomimono, jikan].forEach((input) => input.value = '');
    genzaiTaiju.value = weight ? formatWeight(weight) : '';
    undousentaku.selectedIndex = 0;
    sekcal = 0;
    shkcal = 0;
    currentResult = null;
    kekkaTaiju.textContent = '--';
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
            if (!Number.isFinite(value)) input.value = '';
            else if (value < 0) input.value = '0';
            else if (value > max) input.value = String(max);
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
        [shintyoBox, '身長'], [taijuBox, '開始時の体重'], [mtaijuBox, '目標体重'], [genzaiTaiju, '現在の体重'],
        [gohan, 'ご飯'], [men, '麺'], [pan, 'パン'], [kudamono, '果物'], [yasai, '野菜'], [nomimono, '飲み物'], [jikan, '運動時間']
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
    } else mbmiBox.value = '';

    if (isValueInRange(taijuBox) && isValueInRange(mtaijuBox)) {
        mokuhyouType = getGoalType(taiju, mtaiju);
        mokuhyouHoukou.textContent = `目標タイプ：${mokuhyouType === 'gain' ? '増量' : mokuhyouType === 'loss' ? '減量' : '体重維持'}`;
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
    sekcal = Math.round(
        numberOrZero(gohan.value) * 1.56 +
        numberOrZero(men.value) * 1.30 +
        numberOrZero(pan.value) * 2.60 +
        numberOrZero(kudamono.value) * 0.50 +
        numberOrZero(yasai.value) * 0.30 +
        numberOrZero(nomimono.value) * 0.40
    );

    const perMinute = { walking: 4, briskWalking: 5, running: 8, cycling: 7, strength: 6, squat: 6, swimming: 8, stairs: 8, jumpRope: 10, yoga: 3 };
    shkcal = Math.round(numberOrZero(jikan.value) * (perMinute[undousentaku.value] || 0));
}

function showResult() {
    const currentWeight = Number(genzaiTaiju.value);
    kekkaTaiju.textContent = formatWeight(currentWeight);
    shkarori.textContent = shkcal;
    sekarori.textContent = sekcal;

    const estimatedTarget = Math.round(kisotaisya + dailyAdjust);
    const difference = sekcal - estimatedTarget;
    const recommendations = buildRecommendations(difference);
    const review = buildReview(difference, currentWeight);

    ashitaOsusume.innerHTML = recommendations.map((item) => `<p><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.text)}</p>`).join('');
    souhyou.innerHTML = review.map((item) => `<p>${escapeHtml(item)}</p>`).join('');

    currentResult = {
        weight: currentWeight,
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
        meal = difference < -250 ? '主食とたんぱく質を少し増やしましょう。' : difference > 350 ? '増量中でも食べすぎは避け、明日は少し整えましょう。' : '今の量を大きく変えず、バランスを意識しましょう。';
        exercise = '筋トレを中心に、疲れを残さない範囲で続けましょう。';
        lifestyle = '睡眠と休養も確保して、急に増やしすぎないようにしましょう。';
    } else if (mokuhyouType === 'loss') {
        meal = difference > 250 ? '食事を抜かず、明日は量を少し整えましょう。' : difference < -350 ? '今日は少なめです。明日は減らしすぎないようにしましょう。' : '今の量を基準に、無理なく続けましょう。';
        exercise = shkcal === 0 ? '余裕があれば短いウォーキングから始めましょう。' : '今日くらいの運動量を無理なく続けましょう。';
        lifestyle = '短期間で落としすぎず、体重の推移を見ながら続けましょう。';
    } else {
        meal = Math.abs(difference) <= 250 ? '今の食事量を大きく変えず、バランスを意識しましょう。' : '体重維持が目標なので、明日は普段の量に戻しましょう。';
        exercise = shkcal === 0 ? '軽いウォーキングやストレッチがおすすめです。' : '今日と同程度の運動を無理なく続けましょう。';
        lifestyle = '食事・運動・睡眠のリズムを優先しましょう。';
    }

    return [{ title: '食事', text: meal }, { title: '運動', text: exercise }, { title: '生活', text: lifestyle }];
}

function buildReview(difference, currentWeight) {
    const comments = [];
    const startDiff = currentWeight - taiju;

    if (mokuhyouType === 'loss' && startDiff < -0.05) comments.push(`開始時から${Math.abs(startDiff).toFixed(1)}kg減っています。進捗は出ています。`);
    else if (mokuhyouType === 'gain' && startDiff > 0.05) comments.push(`開始時から${startDiff.toFixed(1)}kg増えています。進捗は出ています。`);
    else if (mokuhyouType === 'maintain') comments.push(`目標体重との差は${Math.abs(mtaiju - currentWeight).toFixed(1)}kgです。大きく崩さず維持しましょう。`);
    else comments.push('体重はまだ開始時に近いです。1日単位ではなく推移で見ていきましょう。');

    if (Math.abs(difference) <= 250) comments.push('今日の食事量は目標ペースから大きく外れていません。');
    else if (difference > 250) comments.push('今日は食事量がやや多めです。明日は少しだけ整えましょう。');
    else comments.push('今日は食事量が少なめです。減らしすぎないようにしましょう。');

    if (undousentaku.value) comments.push(`${exerciseName(undousentaku.value)}を${numberOrZero(jikan.value)}分できています。`);
    else comments.push('運動は未記録です。余裕があれば短時間だけ動いてみましょう。');

    return comments.slice(0, 3);
}

function getGoalType(startWeight, targetWeight) {
    if (targetWeight > startWeight + 0.1) return 'gain';
    if (targetWeight < startWeight - 0.1) return 'loss';
    return 'maintain';
}

function hasReachedGoal(goalType, currentWeight, targetWeight, startDate, months, now = new Date()) {
    if (goalType === 'loss') return currentWeight <= targetWeight;
    if (goalType === 'gain') return currentWeight >= targetWeight;

    const deadline = addMonths(startDate, months || 3);
    return now >= deadline && Math.abs(currentWeight - targetWeight) <= 1;
}

function calculateWeightProgress(startWeight, currentWeight, targetWeight) {
    if (Math.abs(targetWeight - startWeight) < 0.1) return 100;
    const progress = ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100;
    return Math.round(Math.max(0, Math.min(100, progress)));
}

function getExpectedWeight(startWeight, targetWeight, startDate, deadline, now) {
    const total = Math.max(1, deadline - startDate);
    const elapsed = Math.max(0, Math.min(total, now - startDate));
    const ratio = elapsed / total;
    return startWeight + (targetWeight - startWeight) * ratio;
}

function buildPaceText(goalType, currentWeight, expectedWeight) {
    const diff = currentWeight - expectedWeight;
    if (Math.abs(diff) < 0.2) return 'ほぼ計画通り';
    if (goalType === 'loss') return diff < 0 ? `${Math.abs(diff).toFixed(1)}kg先行` : `${diff.toFixed(1)}kg遅れ`;
    if (goalType === 'gain') return diff > 0 ? `${diff.toFixed(1)}kg先行` : `${Math.abs(diff).toFixed(1)}kg遅れ`;
    return `目標差 ${Math.abs(diff).toFixed(1)}kg`;
}

function exerciseName(value) {
    const names = { walking: 'ウォーキング', briskWalking: '早歩き', running: 'ランニング', cycling: '自転車', strength: '筋力トレーニング', squat: 'スクワット', swimming: '水泳', stairs: '階段昇降', jumpRope: '縄跳び', yoga: 'ヨガ・ストレッチ' };
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
    document.querySelectorAll('input[name="gender"]').forEach((item) => item.checked = false);
    document.querySelectorAll('input[type="number"], input[type="text"]').forEach((item) => item.value = '');
    document.querySelectorAll('select').forEach((item) => item.selectedIndex = 0);
    document.getElementById('mokuhyou').classList.add('hidden');
    mokuhyouHoukou.textContent = '目標体重を入力すると目標タイプを表示します。';
    seibetu = nenrei = shintyo = taiju = bmi = mtaiju = mbmi = mokuhyouPlanMonths = kisotaisya = undefined;
    mokuhyouType = 'maintain';
    dailyAdjust = 0;
    currentResult = null;
}

function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

function formatShortDate(date) {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function formatWeight(value) {
    return Number(value).toFixed(1).replace(/\.0$/, '');
}

function toLocalDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function numberOrZero(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function escapeHtml(text) {
    return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function setupAchievementUI() {
    if (document.getElementById('goalAchievedCard')) return;

    const style = document.createElement('style');
    style.textContent = `
        .goal-achieved-card{margin:0 0 24px;padding:26px 22px;border:1px solid #dceede;border-radius:16px;background:#f3faf4;text-align:center}
        .goal-achieved-mark{width:54px;height:54px;margin:0 auto 12px;display:grid;place-items:center;border-radius:50%;background:#37b64a;color:#fff;font-size:28px;font-weight:800;box-shadow:0 8px 18px rgba(55,182,74,.18)}
        .goal-achieved-card h2{margin:0;color:#263238;font-size:22px}
        .goal-achieved-card p{margin:8px 0 0;color:#59645f}
        .goal-achieved-meta{display:flex;justify-content:center;gap:18px;margin-top:16px;font-size:13px;color:#7a8580}
        .goal-achieved-meta strong{display:block;margin-top:2px;color:#2d963d;font-size:17px}
        .achievement-overlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:24px;background:rgba(25,36,31,.48);backdrop-filter:blur(5px)}
        .achievement-panel{position:relative;z-index:2;width:min(420px,100%);padding:34px 28px 28px;border-radius:22px;background:#fff;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.2);animation:achievement-pop .45s cubic-bezier(.2,.8,.2,1)}
        .achievement-icon{width:72px;height:72px;margin:0 auto 16px;display:grid;place-items:center;border-radius:50%;background:#eaf7ec;color:#2d963d;font-size:38px;font-weight:800}
        .achievement-panel h2{margin:0 0 8px;color:#263238;font-size:28px}
        .achievement-panel p{margin:0;color:#59645f}
        .achievement-weight{margin:16px 0 20px!important;font-size:18px!important;color:#2d963d!important;font-weight:700}
        .achievement-panel button{margin-top:6px}
        .confetti-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none}
        .confetti-piece{position:absolute;top:-24px;width:9px;height:16px;border-radius:2px;animation:confetti-fall linear forwards}
        @keyframes achievement-pop{0%{opacity:0;transform:translateY(15px) scale(.94)}100%{opacity:1;transform:none}}
        @keyframes confetti-fall{0%{transform:translate3d(0,-10px,0) rotate(0deg);opacity:1}100%{transform:translate3d(var(--drift),110vh,0) rotate(720deg);opacity:.1}}
        @media (prefers-reduced-motion:reduce){.achievement-panel,.confetti-piece{animation:none!important}.confetti-piece{display:none}}
    `;
    document.head.appendChild(style);

    const achievedCard = document.createElement('section');
    achievedCard.id = 'goalAchievedCard';
    achievedCard.className = 'goal-achieved-card hidden';
    achievedCard.innerHTML = `
        <div class="goal-achieved-mark">✓</div>
        <h2>目標達成済み</h2>
        <p>設定していた目標を達成しました。</p>
        <div class="goal-achieved-meta">
            <span>達成体重<strong id="achievedHomeWeight">-- kg</strong></span>
            <span>達成日<strong id="achievedHomeDate">--</strong></span>
        </div>
    `;
    homeSummary.insertAdjacentElement('afterend', achievedCard);

    const overlay = document.createElement('div');
    overlay.id = 'achievementOverlay';
    overlay.className = 'achievement-overlay hidden';
    overlay.innerHTML = `
        <div class="confetti-layer" id="confettiLayer"></div>
        <div class="achievement-panel" role="dialog" aria-modal="true" aria-labelledby="achievementTitle">
            <div class="achievement-icon">✓</div>
            <h2 id="achievementTitle">目標達成！</h2>
            <p>設定していた体重目標に到達しました。</p>
            <p class="achievement-weight" id="achievementWeightText"></p>
            <button type="button" id="achievementCloseButton">ホームで確認する</button>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('achievementCloseButton').addEventListener('click', () => {
        overlay.classList.add('hidden');
        goHome();
    });
}

function showGoalCelebration(savedData) {
    const overlay = document.getElementById('achievementOverlay');
    const weightText = document.getElementById('achievementWeightText');
    const weight = Number(savedData.achievedWeight ?? getLatestWeight(savedData));
    const target = Number(savedData.profile.targetWeight);

    weightText.textContent = `${formatWeight(weight)} kg / 目標 ${formatWeight(target)} kg`;
    createConfetti();
    overlay.classList.remove('hidden');
}

function showAchievedHomeCard(saved, currentWeight, targetWeight) {
    const card = document.getElementById('goalAchievedCard');
    const weightEl = document.getElementById('achievedHomeWeight');
    const dateEl = document.getElementById('achievedHomeDate');
    const achievedWeight = Number(saved.achievedWeight ?? currentWeight);
    const achievedDate = new Date(saved.achievedAt || saved.savedAt || Date.now());

    weightEl.textContent = `${formatWeight(achievedWeight)} kg`;
    dateEl.textContent = formatShortDate(achievedDate);
    card.querySelector('p').textContent = `目標 ${formatWeight(targetWeight)} kg を達成しました。`;
    card.classList.remove('hidden');
}

function createConfetti() {
    const layer = document.getElementById('confettiLayer');
    if (!layer) return;
    layer.innerHTML = '';
    const colors = ['#37b64a', '#ffc857', '#5aa9e6', '#ff7b7b', '#8d7cf0'];

    for (let i = 0; i < 42; i += 1) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[i % colors.length];
        piece.style.animationDuration = `${2.6 + Math.random() * 2}s`;
        piece.style.animationDelay = `${Math.random() * .7}s`;
        piece.style.setProperty('--drift', `${-90 + Math.random() * 180}px`);
        layer.appendChild(piece);
    }
}