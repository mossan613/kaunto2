// ============================================================
// 交通量カウントシステム
// 動画再生優先版
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

    // 上り
    "1": ["up", "car"],
    "2": ["up", "truck"],
    "3": ["up", "bus"],
    "4": ["up", "bike"],
    "5": ["up", "person"],
    "6": ["up", "bicycle"],

    // 下り
    "q": ["down", "car"],
    "w": ["down", "truck"],
    "e": ["down", "bus"],
    "r": ["down", "bike"],
    "t": ["down", "person"],
    "y": ["down", "bicycle"]

};


// ============================================================
// 現在読み込んでいる動画
// ============================================================

let currentVideoUrl = null;


// ============================================================
// 保存
// ============================================================

function saveCounts() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(counts)
        );

        updateSaveStatus(
            "保存済み"
        );

    } catch (error) {

        console.error(
            "データ保存エラー:",
            error
        );

        updateSaveStatus(
            "保存エラー"
        );

    }

}


// ============================================================
// 保存状態表示
// ============================================================

function updateSaveStatus(message) {

    const element =
        document.getElementById(
            "save-status"
        );

    if (!element) {

        return;

    }

    element.textContent =
        message;

}


// ============================================================
// データ読み込み
// ============================================================

function loadCounts() {

    try {

        const savedData =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!savedData) {

            return;

        }


        const data =
            JSON.parse(
                savedData
            );


        directions.forEach(
            direction => {

                if (
                    !data[direction] ||
                    typeof data[direction] !== "object"
                ) {

                    return;

                }


                types.forEach(
                    type => {

                        const value =
                            data[
                                direction
                            ][type];


                        if (
                            typeof value === "number" &&
                            Number.isInteger(value) &&
                            value >= 0
                        ) {

                            counts[
                                direction
                            ][type] = value;

                        }

                    }
                );

            }
        );


    } catch (error) {

        console.error(
            "データ読み込みエラー:",
            error
        );

    }

}


// ============================================================
// カウント表示更新
// ============================================================

function updateDisplay(
    direction,
    type
) {

    const element =
        document.getElementById(
            `${direction}-${type}`
        );


    if (!element) {

        return;

    }


    element.textContent =
        counts[
            direction
        ][type];

}


// ============================================================
// 合計更新
// ============================================================

function updateTotal(
    direction
) {

    const data =
        counts[
            direction
        ];


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


    element.textContent =
        total;

}


// ============================================================
// 全表示更新
// ============================================================

function updateAllDisplay() {

    directions.forEach(
        direction => {

            types.forEach(
                type => {

                    updateDisplay(
                        direction,
                        type
                    );

                }
            );


            updateTotal(
                direction
            );

        }
    );

}


// ============================================================
// 動画時間を取得
// ============================================================

function getVideoTime() {

    const video =
        document.getElementById(
            "traffic-video"
        );


    if (!video) {

        return 0;

    }


    if (
        !Number.isFinite(
            video.currentTime
        )
    ) {

        return 0;

    }


    return video.currentTime;

}


// ============================================================
// 動画時間を表示用文字列へ変換
// ============================================================

function formatVideoTime(
    seconds
) {

    if (
        !Number.isFinite(seconds)
    ) {

        return "00:00";

    }


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    const secs =
        Math.floor(
            seconds % 60
        );


    if (hours > 0) {

        return (

            String(hours)
                .padStart(2, "0")

            +

            ":" +

            String(minutes)
                .padStart(2, "0")

            +

            ":" +

            String(secs)
                .padStart(2, "0")

        );

    }


    return (

        String(minutes)
            .padStart(2, "0")

        +

        ":" +

        String(secs)
            .padStart(2, "0")

    );

}


// ============================================================
// カウント変更
// ============================================================

function changeCount(
    direction,
    type,
    amount
) {

    if (
        !counts[direction]
    ) {

        return;

    }


    if (
        typeof counts[
            direction
        ][type] !== "number"
    ) {

        return;

    }


    // ----------------------------------------
    // カウント前の動画時間
    // ----------------------------------------

    const videoTime =
        getVideoTime();


    // ----------------------------------------
    // カウント変更
    // ----------------------------------------

    counts[
        direction
    ][type] += amount;


    // ----------------------------------------
    // 0未満防止
    // ----------------------------------------

    if (
        counts[
            direction
        ][type] < 0
    ) {

        counts[
            direction
        ][type] = 0;

    }


    // ----------------------------------------
    // 表示更新
    // ----------------------------------------

    updateDisplay(
        direction,
        type
    );


    updateTotal(
        direction
    );


    // ----------------------------------------
    // 保存
    // ----------------------------------------

    saveCounts();


    // ----------------------------------------
    // デバッグ表示
    // ----------------------------------------

    console.log(

        `${typeNames[type]} ` +

        `${amount > 0 ? "+" : ""}${amount}` +

        ` / 動画時間 ${formatVideoTime(videoTime)}`

    );

}


// ============================================================
// 全てリセット
// ============================================================

function resetAll() {

    const result =
        window.confirm(
            "全てのカウントをリセットしますか？"
        );


    if (!result) {

        return;

    }


    directions.forEach(
        direction => {

            types.forEach(
                type => {

                    counts[
                        direction
                    ][type] = 0;

                }
            );

        }
    );


    updateAllDisplay();


    saveCounts();


    console.log(
        "全てのカウントをリセットしました。"
    );

}


// ============================================================
// CSV出力
// ============================================================

function exportCSV() {

    const rows = [

        [
            "方向",
            "種類",
            "カウント"
        ]

    ];


    // ----------------------------------------
    // 上り
    // ----------------------------------------

    types.forEach(
        type => {

            rows.push([

                "上り",

                typeNames[type],

                counts.up[type]

            ]);

        }
    );


    // ----------------------------------------
    // 下り
    // ----------------------------------------

    types.forEach(
        type => {

            rows.push([

                "下り",

                typeNames[type],

                counts.down[type]

            ]);

        }
    );


    // ----------------------------------------
    // CSV文字列
    // ----------------------------------------

    const csv =
        rows
            .map(
                row => {

                    return row
                        .map(
                            value => {

                                const text =
                                    String(
                                        value ?? ""
                                    );


                                return `"${text.replace(
                                    /"/g,
                                    '""'
                                )}"`;

                            }
                        )
                        .join(",");

                }
            )
            .join("\r\n");


    // ----------------------------------------
    // BOM付きUTF-8
    // ----------------------------------------

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


    // ----------------------------------------
    // ダウンロードURL
    // ----------------------------------------

    const url =
        URL.createObjectURL(
            blob
        );


    // ----------------------------------------
    // ファイル名
    // ----------------------------------------

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    const hour =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minute =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const second =
        String(
            now.getSeconds()
        ).padStart(
            2,
            "0"
        );


    const filename =
        `交通量カウント_${year}${month}${day}_${hour}${minute}${second}.csv`;


    // ----------------------------------------
    // ダウンロード
    // ----------------------------------------

    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    // ----------------------------------------
    // URL解放
    // ----------------------------------------

    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );


    updateSaveStatus(
        "CSVを出力しました"
    );


    console.log(
        "CSV出力:",
        filename
    );

}


// ============================================================
// 動画読み込み
// ============================================================
//
// 重要：
// 動画ファイルをメモリへコピーしない。
// FileReader / ArrayBuffer は使用しない。
// Blob URLをvideoへ直接渡す。
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


    if (!video) {

        console.error(
            "video要素が見つかりません。"
        );

        return;

    }


    // ----------------------------------------
    // 前の動画URLを解放
    // ----------------------------------------

    if (
        currentVideoUrl
    ) {

        URL.revokeObjectURL(
            currentVideoUrl
        );

        currentVideoUrl =
            null;

    }


    // ----------------------------------------
    // 古い動画を停止
    // ----------------------------------------

    video.pause();


    // ----------------------------------------
    // 動画URLを作成
    // ----------------------------------------

    currentVideoUrl =
        URL.createObjectURL(
            file
        );


    // ----------------------------------------
    // 動画を設定
    // ----------------------------------------

    video.src =
        currentVideoUrl;


    // ----------------------------------------
    // ブラウザに動画情報だけ先に取得させる
    // ----------------------------------------

    video.preload =
        "metadata";


    // ----------------------------------------
    // メッセージ非表示
    // ----------------------------------------

    if (message) {

        message.style.display =
            "none";

    }


    // ----------------------------------------
    // 読み込み開始
    // ----------------------------------------

    video.load();


    // ----------------------------------------
    // メタデータ読み込み完了
    // ----------------------------------------

    video.onloadedmetadata =
        function() {

            const duration =
                video.duration;


            console.log(
                "動画読み込み完了"
            );


            console.log(
                "動画時間:",
                formatVideoTime(duration)
            );


            console.log(
                "動画サイズ:",
                (
                    file.size /
                    1024 /
                    1024 /
                    1024
                ).toFixed(2),
                "GB"
            );


            updateSaveStatus(

                `動画読み込み完了 ` +

                `(${formatVideoTime(duration)})`

            );

        };


    // ----------------------------------------
    // 動画エラー
    // ----------------------------------------

    video.onerror =
        function() {

            console.error(
                "動画再生エラー:",
                video.error
            );


            if (message) {

                message.textContent =
                    "この動画は再生できません";

                message.style.display =
                    "block";

            }


            updateSaveStatus(
                "動画再生エラー"
            );

        };


    // ----------------------------------------
    // 再生開始
    // ----------------------------------------

    video.onplay =
        function() {

            console.log(
                "動画再生開始"
            );

        };


    // ----------------------------------------
    // 一時停止
    // ----------------------------------------

    video.onpause =
        function() {

            console.log(
                "動画一時停止"
            );

        };

}


// ============================================================
// 動画終了時
// ============================================================

function handleVideoEnded() {

    const video =
        document.getElementById(
            "traffic-video"
        );


    if (!video) {

        return;

    }


    console.log(
        "動画再生終了"
    );


    updateSaveStatus(
        "動画再生終了"
    );

}


// ============================================================
// キーボード入力
// ============================================================

document.addEventListener(
    "keydown",
    function(event) {

        // ----------------------------------------
        // 入力欄ではキーボードカウントしない
        // ----------------------------------------

        if (

            event.target.tagName === "INPUT"

            ||

            event.target.tagName === "TEXTAREA"

            ||

            event.target.isContentEditable

        ) {

            return;

        }


        // ----------------------------------------
        // 長押しによる連続カウント防止
        // ----------------------------------------

        if (
            event.repeat
        ) {

            return;

        }


        // ----------------------------------------
        // キー取得
        // ----------------------------------------

        const key =
            event.key.toLowerCase();


        // ----------------------------------------
        // 登録されていないキー
        // ----------------------------------------

        if (
            !KEY_MAP[key]
        ) {

            return;

        }


        // ----------------------------------------
        // ブラウザ標準操作を止める
        // ----------------------------------------

        event.preventDefault();


        // ----------------------------------------
        // 方向・種類
        // ----------------------------------------

        const [
            direction,
            type
        ] = KEY_MAP[key];


        // ----------------------------------------
        // カウント
        // ----------------------------------------

        changeCount(
            direction,
            type,
            1
        );

    }
);


// ============================================================
// 動画の終了イベント
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const video =
            document.getElementById(
                "traffic-video"
            );


        if (!video) {

            return;

        }


        video.addEventListener(
            "ended",
            handleVideoEnded
        );

    }
);


// ============================================================
// ページ終了時
// ============================================================
//
// Blob URLを解放
// ============================================================

window.addEventListener(
    "beforeunload",
    function() {

        if (
            currentVideoUrl
        ) {

            URL.revokeObjectURL(
                currentVideoUrl
            );

        }

    }
);


// ============================================================
// ページ起動
// ============================================================

function initialize() {

    loadCounts();

    updateAllDisplay();


    console.log(
        "================================"
    );

    console.log(
        "交通量カウントシステム起動"
    );

    console.log(
        "================================"
    );

    console.log(
        "動画再生：優先"
    );

    console.log(
        "動画メモリコピー：なし"
    );

    console.log(
        "キーボード操作：ON"
    );

    console.log(
        "長押し防止：ON"
    );

    console.log(
        "CSV出力：ON"
    );

    console.log(
        "localStorage保存：ON"
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
