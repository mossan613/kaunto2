// ============================================================
// 交通量カウント
// ============================================================

// ============================================================
// localStorageの保存キー
// ============================================================

const STORAGE_KEY = "traffic_counts";


// ============================================================
// カウントデータ
// ============================================================

const counts = {

    up: {
        car: 0,
        truck: 0,
        bus: 0,
        bike: 0,
        person: 0,
        bicycle: 0
    },

    down: {
        car: 0,
        truck: 0,
        bus: 0,
        bike: 0,
        person: 0,
        bicycle: 0
    }

};


// ============================================================
// 種類
// ============================================================

const types = [
    "car",
    "truck",
    "bus",
    "bike",
    "person",
    "bicycle"
];


// ============================================================
// 方向
// ============================================================

const directions = [
    "up",
    "down"
];


// ============================================================
// 日本語名称
// ============================================================

const typeNames = {

    car: "普通車",
    truck: "トラック",
    bus: "バス",
    bike: "バイク",
    person: "歩行者",
    bicycle: "自転車"

};


// ============================================================
// キーボード設定
// ============================================================

const KEY_MAP = {

    "1": ["up", "car"],
    "2": ["up", "truck"],
    "3": ["up", "bus"],
    "4": ["up", "bike"],
    "5": ["up", "person"],
    "6": ["up", "bicycle"],

    "q": ["down", "car"],
    "w": ["down", "truck"],
    "e": ["down", "bus"],
    "r": ["down", "bike"],
    "t": ["down", "person"],
    "y": ["down", "bicycle"]

};


// ============================================================
// データ保存
// ============================================================

function saveCounts() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(counts)
        );

        updateSaveStatus("保存済み");

    } catch (error) {

        console.error(
            "データ保存エラー:",
            error
        );

        updateSaveStatus("保存エラー");

    }

}


// ============================================================
// 保存状態
// ============================================================

function updateSaveStatus(message) {

    const element =
        document.getElementById("save-status");

    if (!element) {
        return;
    }

    element.textContent = message;

}


// ============================================================
// データ読み込み
// ============================================================

function loadCounts() {

    try {

        const savedData =
            localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return;
        }

        const data =
            JSON.parse(savedData);

        directions.forEach(direction => {

            if (
                !data[direction] ||
                typeof data[direction] !== "object"
            ) {
                return;
            }

            types.forEach(type => {

                const value =
                    data[direction][type];

                if (
                    typeof value === "number" &&
                    Number.isInteger(value) &&
                    value >= 0
                ) {

                    counts[direction][type] = value;

                }

            });

        });

    } catch (error) {

        console.error(
            "データ読み込みエラー:",
            error
        );

    }

}


// ============================================================
// 表示更新
// ============================================================

function updateDisplay(direction, type) {

    const element =
        document.getElementById(
            `${direction}-${type}`
        );

    if (!element) {
        return;
    }

    element.textContent =
        counts[direction][type];

}


// ============================================================
// 合計更新
// ============================================================

function updateTotal(direction) {

    const data =
        counts[direction];

    const total =
        data.car +
        data.truck +
        data.bus +
        data.bike +
        data.person +
        data.bicycle;

    const element =
        document.getElementById(
            `${direction}-total`
        );

    if (!element) {
        return;
    }

    element.textContent = total;

}


// ============================================================
// 全表示更新
// ============================================================

function updateAllDisplay() {

    directions.forEach(direction => {

        types.forEach(type => {

            updateDisplay(
                direction,
                type
            );

        });

        updateTotal(direction);

    });

}


// ============================================================
// カウント変更
// ============================================================

function changeCount(
    direction,
    type,
    amount
) {

    if (!counts[direction]) {
        return;
    }

    if (
        typeof counts[direction][type] !== "number"
    ) {
        return;
    }

    counts[direction][type] += amount;

    if (counts[direction][type] < 0) {
        counts[direction][type] = 0;
    }

    updateDisplay(
        direction,
        type
    );

    updateTotal(
        direction
    );

    saveCounts();

}


// ============================================================
// 全リセット
// ============================================================

function resetAll() {

    const result =
        window.confirm(
            "全てのカウントをリセットしますか？"
        );

    if (!result) {
        return;
    }

    directions.forEach(direction => {

        types.forEach(type => {

            counts[direction][type] = 0;

        });

    });

    updateAllDisplay();

    saveCounts();

}


// ============================================================
// CSV出力
// ============================================================

function exportCSV() {

    const rows = [
        ["方向", "種類", "カウント"]
    ];


    types.forEach(type => {

        rows.push([
            "上り",
            typeNames[type],
            counts.up[type]
        ]);

    });


    types.forEach(type => {

        rows.push([
            "下り",
            typeNames[type],
            counts.down[type]
        ]);

    });


    const csv =
        rows
            .map(row =>
                row
                    .map(value => {

                        const text =
                            String(value ?? "");

                        return `"${text.replace(
                            /"/g,
                            '""'
                        )}"`;

                    })
                    .join(",")
            )
            .join("\r\n");


    const blob =
        new Blob(
            [
                "\uFEFF",
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const now =
        new Date();


    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    const hour =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minute =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    const second =
        String(
            now.getSeconds()
        ).padStart(2, "0");


    const filename =
        `交通量カウント_${year}${month}${day}_${hour}${minute}${second}.csv`;


    const link =
        document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    updateSaveStatus(
        "CSVを出力しました"
    );

}


// ============================================================
// キーボード入力
// ============================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA" ||
            event.target.isContentEditable
        ) {
            return;
        }

        if (event.repeat) {
            return;
        }

        const key =
            event.key.toLowerCase();

        if (!KEY_MAP[key]) {
            return;
        }

        event.preventDefault();

        const [
            direction,
            type
        ] = KEY_MAP[key];

        changeCount(
            direction,
            type,
            1
        );

    }
);


// ============================================================
// 動画読み込み
// ============================================================

function loadVideo(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    const video =
        document.getElementById(
            "traffic-video"
        );

    const message =
        document.getElementById(
            "video-message"
        );


    const url =
        URL.createObjectURL(file);


    video.src = url;

    video.load();


    message.style.display = "none";


    updateSaveStatus(
        `動画：${file.name}`
    );

}


// ============================================================
// 起動
// ============================================================

function initialize() {

    loadCounts();

    updateAllDisplay();

    console.log(
        "交通量カウントシステム起動"
    );

    console.log(
        "キーボード操作：ON"
    );

    console.log(
        "上り：1 2 3 4 5 6"
    );

    console.log(
        "下り：Q W E R T Y"
    );

}


// ============================================================
// 起動
// ============================================================

initialize();
