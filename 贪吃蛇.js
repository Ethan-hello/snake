var squarewidth = 20,
    squareheight = 20,
    tr = 30,
    td = 30;

var snake = null, // 蛇的实例
    food = null,
    game = null; // 游戏实例

function Square(x, y, classname) {
    this.x = x * squarewidth;
    this.y = y * squareheight;
    this.class = classname;

    this.square = document.createElement('div');
    this.square.className = classname;


    this.parent = document.getElementById('snakeWrap');

}

Square.prototype.create = function() {
    this.square.style.position = 'absolute';
    this.square.style.width = squarewidth + 'px';
    this.square.style.height = squareheight + 'px';
    this.square.style.left = this.x + 'px';
    this.square.style.top = this.y + 'px';

    this.parent.appendChild(this.square);
}

Square.prototype.remove = function() {
    this.parent.removeChild(this.square);
}

function Snake() {
    this.head = null; // 存储蛇头的信息
    this.tail = null; // 存储蛇尾的信息

    this.pos = []; // 存储蛇身位置
    this.directionNum = { // 蛇走的方向
        left: {
            x: -1,
            y: 0,
            rotate: 180
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }
    }

}

Snake.prototype.init = function() {
    var snakeHead = new Square(2, 0, 'snakeHead');

    snakeHead.create();

    this.head = snakeHead;
    this.pos.push([2, 0]);

    var snakeB1 = new Square(1, 0, 'snakeBody');
    snakeB1.create();
    var snakeB2 = new Square(0, 0, 'snakeBody');
    snakeB2.create();
    this.tail = snakeB2;

    this.pos.push([1, 0]);
    this.pos.push([0, 0]);

    // 形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeB1;
    snakeB1.last = snakeHead;
    snakeB1.next = snakeB2;
    snakeB2.last = snakeB1;
    snakeB2.next = null;

    // 蛇默认的方向

    this.direction = this.directionNum.right;
}

// 获取蛇头下一个位置对应的元素，根据元素做不同的事情
Snake.prototype.getNextPos = function() {
    var nextPos = [
        this.head.x / squarewidth + this.direction.x, // 真实坐标 / squarewidth
        this.head.y / squareheight + this.direction.y
    ];
    //console.log(nextPos);

    // 撞到自己
    var selfCollied = false; // 是否撞到自身
    this.pos.forEach(function(value) {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            selfCollied = true;
        }
    });
    if (selfCollied) {
        console.log('撞到自己了');
        this.strategies.die.call(this);
        return;
    }

    // 遇到墙
    if (nextPos[0] < 0 || nextPos[0] > tr - 1 || nextPos[1] < 0 || nextPos[1] > td - 1) {
        console.log('撞到墙喽');
        this.strategies.die.call(this);
        return;
    }


    // 遇到食物
    // this.strategies.eat.call(this, true);
    if (food && nextPos[0] == food.pos[0] && nextPos[1] == food.pos[1]) {
        this.strategies.eat.call(this, true);
        return;
    }

    // 什么都不是， 继续移动
    this.strategies.move.call(this);

}

// 处理碰撞后的事情
Snake.prototype.strategies = {
    move: function(format) { // format决定是否删除蛇尾, 传参吃， 不传参不吃
        // 创建一个新的身体

        var newBody = new Square(this.head.x / squarewidth, this.head.y / squareheight, 'snakeBody');
        // 更新链表关系
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;

        this.head.remove(); // 旧蛇头删除
        newBody.create();

        // 创建新蛇头
        var x = this.head.x / squarewidth + this.direction.x;
        var y = this.head.y / squareheight + this.direction.y;
        var newHead = new Square(x, y, 'snakeHead');


        // 更新链表关系
        newBody.last = newHead;
        newHead.last = null;
        newHead.next = newBody;

        newHead.square.style.transform = 'rotate(' + this.direction.rotate + 'deg)';
        newHead.create();

        // 更新 pos
        this.pos.splice(0, 0, [x, y]);
        this.head = newHead;

        // 删除尾节点    
        if (!format) {
            this.tail.remove();
            this.tail = this.tail.last;
            this.pos.pop();
        }
    },
    eat: function() {
        // console.log('eat');       
        this.strategies.move.call(this, true);
        createFood();
        game.score++;
    },
    die: function() {
        // console.log('die');
        game.over();
    }
}

// 创建食物
function createFood() {
    var x = null,
        y = null;


    var include = true; // true 表示食物的坐标在蛇身上
    while (include) {
        x = Math.round(Math.random() * (squarewidth - 1));
        y = Math.round(Math.random() * (squareheight - 1));

        snake.pos.forEach(function(value) {
            if (value[0] != x && value[1] != y) {
                include = false;
            }
        });

    }

    food = new Square(x, y, 'food');
    food.pos = [x, y];
    var foodDom = document.querySelector('.food');
    if (foodDom) {
        foodDom.style.left = x * squarewidth + 'px';
        foodDom.style.top = y * squareheight + 'px';
    } else {
        food.create();
    }


}

// 控制逻辑

function Game() {
    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function() {
    snake.init();
    // snake.getNextPos();
    createFood();

    document.onkeydown = function(e) {
        if (e.keyCode == 37 && snake.direction != snake.directionNum.right) {
            snake.direction = snake.directionNum.left;
        } else if (e.keyCode == 38 && snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up;
        } else if (e.keyCode == 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        } else if (e.keyCode == 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    }

    this.start();

}

Game.prototype.start = function(e) {
    this.timer = setInterval(function() {
        snake.getNextPos();
    }, 200);
}

Game.prototype.pause = function() {
    clearInterval(this.timer);
}

Game.prototype.over = function() {
    clearInterval(this.timer);
    alert('您的得分是' + this.score);

    // 回到初始状态
    var snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';
    snake = new Snake();
    game = new Game();
    var startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';
}

snake = new Snake();
game = new Game();
// 开始游戏
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function() {
    startBtn.parentNode.style.display = 'none';
    game.init();
}

// 暂停游戏
var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');

snakeWrap.onclick = function() {
    game.pause();
    pauseBtn.parentNode.style.display = 'block';
}

pauseBtn.onclick = function() {
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}