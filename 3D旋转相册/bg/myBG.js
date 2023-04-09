const MyBg = function(options) {
        this.faBoxName = options.faBoxId; // 父盒子的 Id 名
        this.faBox = document.getElementById(options.faBoxId); // 承载画布的父容器
        this.Context = null; //画布对象
        // 球
        this.ball_w = options.ball_w || 2; // 宽 
        this.ball_h = options.ball_h || 2; // 高
        this.ball_color = options.ball_color || '0, 117, 183'; // 颜色
        this.ball_count = options.ball_count || 200; // 数量
        this.ball_points = []; // 记录每个点信息{ 位置 x y ，速度 vx vy ,连接数 conn}
        // 线
        this.line_color = options.line_color || '35, 171, 242'; // 颜色
        this.line_conn = options.line_conn || 10; // 数量
        this.line_dist = options.line_dist || 10000; // 连线距离
        // 鼠标
        this.mouse_dist = options.e_dist || 16000; // 鼠标吸附加速范围
        this.mouse_position = undefined; // 鼠标位置信息  {x:0,y:0}
    }
    // 1.0初始化画布的方法
MyBg.prototype.CanvasInit = function() {
        // 缓存this
        const _this = this;
        // 如果获取不到背景盒子则终止函数
        if (this.faBox == null) {
            console.error(`获取不到名为 ${this.faBoxName} 背景盒子！`);
            return;
        }
        // 调用创建画布的方法
        this.CreateCanvas();
        // 调用鼠标触发事件方法
        this.Mouses();
        // 定时器 20 毫秒调用一次点的绘制事件
        setInterval(function() {
            _this.PointCreate();
        }, 40)

    }
    // 2.0 画布-创建的方法
MyBg.prototype.CreateCanvas = function() {
        const _this = this;
        // 创建画布
        const canvas = document.createElement('canvas');
        // 设置宽高
        canvas.width = this.faBox.offsetWidth;
        canvas.height = this.faBox.offsetHeight;
        // 画布对象
        this.Context = canvas.getContext('2d');
        // 追加画布元素
        this.faBox.append(canvas);
        // 画布尺寸随着页面大小变化
        window.onresize = function() {
            canvas.width = _this.faBox.offsetWidth;
            canvas.height = _this.faBox.offsetHeight;
        }
    }
    // 2.1 画布-鼠标事件记录方法
MyBg.prototype.Mouses = function() {
        const _this = this;
        // 鼠标在背景上移动事件
        this.faBox.onmousemove = function(ev) {
                // console.log('移动');
                _this.mouse_position = {
                    // 记录鼠标位置
                    x: ev.clientX,
                    y: ev.clientY
                }
            }
            // 鼠标离开背景事件
        this.faBox.onmouseleave = function() {
            // console.log('离开');
            _this.mouse_position = undefined;
        }
    }
    // 3.0 画点的方法
MyBg.prototype.PointCreate = function() {
        // 边界判断函数
        const Boders = (p) => {
                // 如果位置超界-加速度变为负值
                if (p.x <= 0 || p.x >= this.faBox.offsetWidth) {
                    p.vx = -p.vx;
                    p.x += p.vx;
                } else if (p.y <= 0 || p.y >= this.faBox.offsetHeight) {
                    p.vy = -p.vy;
                    p.y += p.vy;
                }
                // 位置不超界
                else {
                    p = {
                        x: p.x + p.vx,
                        y: p.y + p.vy,
                        vx: p.vx,
                        vy: p.vy,
                        conn: p.conn
                    }
                }
                // 返回该点的位置
                return p;
            }
            // 清空画布
            // console.log(this.Context)
        this.Context.clearRect(0, 0, this.faBox.offsetWidth, this.faBox.offsetHeight);
        // 设置一个对象记录当前点信息
        let points = {};
        // 画笔开始
        this.Context.beginPath();
        // 设置填充颜色
        this.Context.fillStyle = `rgb(${this.ball_color})`;
        // 遍历所有点
        for (let i = 0; i < this.ball_count; i++) {
            // 判断点未被创建 - 记录点的信息 -位置 X,Y  速度 vx,vh  已连接数 conn
            if (this.ball_points.length < this.ball_count) {
                points = {
                    // 设置随机位置
                    x: Math.floor(Math.random() * this.faBox.offsetWidth),
                    y: Math.floor(Math.random() * this.faBox.offsetHeight),
                    // 设置随机速度
                    vx: (0.5 - Math.random()) * 4,
                    vy: (0.5 - Math.random()) * 4,
                    // 初始化连接数
                    conn: 0,
                }
            }
            // 判断点被创建了 - 判断点的边界值
            else {
                // 调用边界方法
                points = Boders(this.ball_points[i]);
            }
            // 绘制所有填充矩形点
            this.Context.shadowColor = `rgb(${this.line_color})`;
            this.Context.shadowBlur = 12;
            this.Context.fillRect(points.x, points.y, this.ball_w, this.ball_h);
            // 更新/添加点的数据
            this.ball_points[i] = points;
        }
        // 结束画笔
        this.Context.closePath();
        // 调用画线方法
        this.Lines();
    }
    // 4.0 连线
MyBg.prototype.Lines = function() {
    let _this = this;
    // 计算两点的距离
    const Dists = (i, x2, y2) => {
            // 设有两个点的分别为 p1( x1,y1 ) 和 p2( x2,y2 )
            // 连个点的距离为 [(x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)] 的开方
            const distX = this.ball_points[i].x - x2;
            const distY = this.ball_points[i].y - y2;
            return distX * distX + distY * distY;
        }
        // 两点连接的方法
    let binding = (i, x2, y2) => {
            // 绘制线条
            _this.Context.beginPath();
            _this.Context.moveTo(_this.ball_points[i].x, _this.ball_points[i].y);
            _this.Context.lineTo(x2, y2);
            _this.Context.stroke();
            // 关闭线条
            _this.Context.closePath();
        }
        // 遍历每一个点
    for (let i = 0; i < this.ball_count; i++) {
        // 初始化连接数量
        this.ball_points[i].conn = 0;
        // 遍历每个点，计算当前点与每个点的关系
        for (let j = 0; j < i; j++) {
            // 调用函数计算两点距离
            let dist = Dists(i, this.ball_points[j].x, this.ball_points[j].y);
            // 如果两点距离小于连线距离 且 当前点连接数小于最大值
            if (dist <= this.line_dist && this.ball_points[i].conn < this.line_conn) {
                this.ball_points[i].conn++;
                // 设置线条 粗细 和 颜色
                this.Context.lineWidth = 0.5 - dist / this.line_dist;
                this.Context.strokeStyle = `rgba(${this.line_color},${1 - dist / this.line_dist})`;
                // 绘制线条
                binding(i, this.ball_points[j].x, this.ball_points[j].y);
            }
        }
        // 当鼠标点加入时,计算当前点跟鼠标的关系
        if (this.mouse_position) {
            // 调用函数计算两点距离
            let dist = Dists(i, this.mouse_position.x, this.mouse_position.y);
            // 如果两点的距离 小于鼠标吸附加速范围 且 大于 连线范围 则让该点加速
            if (dist < this.mouse_dist && dist > this.line_dist) {
                this.ball_points[i].x += (this.mouse_position.x - this.ball_points[i].x) / 20;
                this.ball_points[i].y += (this.mouse_position.y - this.ball_points[i].y) / 20;
            }
            if (dist < this.mouse_dist) {
                // 设置样式
                this.Context.lineWidth = 0.6;
                this.Context.strokeStyle = `rgba(${this.line_color},0.8)`;
                // 绘制线条
                binding(i, this.mouse_position.x, this.mouse_position.y);
            }
        }
    }
}