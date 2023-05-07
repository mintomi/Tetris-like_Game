const board = [];
for (let y = -1; y < 21; y++) {
  board[y] = [];
  for (let x = -1; x < 11; x++) {
    if (y === 20 || x < 0 || x >= 10) {
      board[y][x] = 1;
    } else {
      board[y][x] = 0;
    }
  }
}

//背景の定義
const showBoard = () => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  //綺麗にする時はxyを逆にする
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) {
      const v = board[y][x];
      let edgeColor, bgColor;
      if (v === 0) {
        edgeColor = "#888";
        bgColor = "#ccc";
      } else {
        edgeColor = `hsl(${((v - 1) / 7) * 360}deg, 100%, 50%)`;
        edgeColor = `hsl(${((v - 1) / 7) * 360}deg, 100%, 70%)`;
      }
      const div = document.createElement("div");
      div.style.position = "absolute";
      div.style.left = `${x * 24}px`;
      div.style.top = `${y * 24}px`;
      div.style.width = `24px`;
      div.style.height = `24px`;
      div.style.boxSizing = "border-box";
      div.style.border = ` 4px ridge ${edgeColor}`;
      div.style.backgroundColor = bgColor;
      document.body.appendChild(div);
    }
  }
};
//ブロック設定
const blockShapes = [
  [0, []],
  [2, [-1, 0], [1, 0], [2, 0]], //tetris
  [2, [-1, 0], [0, 1], [1, 1]], //key 1
  [2, [-1, 0], [0, -1], [1, -1]], //key 2
  [1, [0, 1], [1, 0], [1, 1]], //square
  [4, [-1, 0], [1, 0], [1, 1]], //L1
  [4, [-1, 0], [1, 0], [1, -1]], //L2
  [4, [-1, 0], [0, 1], [0, -1]], //T
];

//ブロック配置
const putBlock = (
  blockIndex,
  x,
  y,
  rotation,
  remove = false,
  action = false
) => {
  //ブロック設定が一つ入るようにする
  const blockShape = [...blockShapes[blockIndex]];
  //先頭の回転数をrotateMax変数に取り出す
  const rotateMax = blockShape.shift();
  //blockShapeの先頭に[0,0]を追加して基準のブロックを作りブロック設定と合わせて4情報が揃う
  blockShape.unshift([0, 0]);
  //それぞれの位置情報をdx,dyに代入してそれを用いてboard上の適切な座標に書いていく
  //dy,dx逆にした方が綺麗
  for (let [dy, dx] of blockShape) {
    for (let i = 0; i < rotation % rotateMax; i++) {
      [dx, dy] = [dy, -dx];
    }
    //すでに置かれたブロックの削除の実装開始
    if (remove) {
      board[y + dy][x + dx] = 0;
    } else {
      //既にブロックがあればfalseを返す
      if (board[y + dy][x + dx]) {
        return false;
      }
      //もしactionがあれば実際に置く
      if (action) {
        board[y + dy][x + dx] = blockIndex;
      }
    }
  }
  //上は置けない場合falseにする処理なので全て当てはまらなかったらtrueを返す
  if (!action) {
    putBlock(blockIndex, x, y, rotation, remove, true);
  }
  return true;
};
//キーボードで操作できるようにする

let cx = 4,
  cy = 0,
  cr = 0,
  ci = 5,
  //プレイ中かどうかを判断する
  gameover = false;

//自分の状態をdx, dy, dr変化させる関数
const move = (dx, dy, dr) => {
  //自分の場所
  putBlock(ci, cx, cy, cr, true);
  if (putBlock(ci, cx + dx, cy + dy, cr + dr)) {
    cx += dx;
    cy += dy;
    cr += dr;
    //showboardで更新
    showBoard();
    return true;
  } else {
    //もし置けなかったら元の場所に戻す
    putBlock(ci, cx, cy, cr);
    return false;
  }
};

//ブロックがこれ以上下がらなかったら新しいブロックを生成する
const createNewBlock = () => {
  clearLine();
  //ciは1以上7以下のランダム
  ci = Math.trunc(Math.random() * 7 + 1);
  cr = Math.trunc(Math.random() * 4);
  cx = 4;
  cy = 0;
  //置けなかったときはgameoverになるのでその処理
  if (!putBlock(ci, cx, cy, cr)) {
    gameover = true;
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        if (board[y][x]) {
          board[y][x] = 1;
        }
      }
    }
    showBoard();
  }
};

//一列揃ったら消す
const clearLine = () => {
  for (let y = 0; y < 20; y++) {
    let removable = true;
    for (let x = 0; x < 10; x++) {
      if (board[y][x] === 0) {
        removable = false;
        break;
      }
    }
    //removableがtrueなら
    if (removable) {
      for (let j = y; j >= -1; j--) {
        for (let x = 0; x < 10; x++) {
          board[j][x] = j === -1 ? 0 : board[j - 1][x];
        }
      }
      y--;
    }
  }
};

window.onload = () => {
  putBlock(ci, cx, cy, cr);
  //上からブロックが自動で落ちてくるようにする
  setInterval(() => {
    if (gameover) {
      return;
    }
    if (!move(0, 1, 0)) {
      createNewBlock();
    }
  }, 500);
  //キーボードが押された時に呼ばれるイベント
  document.onkeydown = (e) => {
    if (gameover) return;
    switch (e.key) {
      case "ArrowLeft":
        move(-1, 0, 0);
        break;
      case "ArrowRight":
        move(1, 0, 0);
        break;
      case "ArrowUp":
        move(0, 0, 1);
        break;
      case "ArrowDown":
        if (!move(0, 1, 0)) {
          //これ以上、下に行けなかったらcreateNewBlock呼び出す
          createNewBlock();
        }

        break;
      default:
        break;
    }
    //ブラウザの標準の動作をキャンセルさせる
    e.preventDefault();
  };
  showBoard();
};
