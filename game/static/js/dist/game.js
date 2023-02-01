class GameMenu{
    constructor(root){
        this.root = root;
        this.$menu = $(`
<div class="game_menu">
    <div class = "game_menu_block">
        <div class = "game_menu_block_item game_menu_block_single">
            单人模式
        </div>
        <br>
        <div class = "game_menu_block_item game_menu_block_multi">
            多人模式
        </div>
        <br>
        <div class = "game_menu_block_item game_meny_block_settings">
            设置
        </div>
    </div>
</div>
`);
        this.$menu.hide();
        this.root.$lty.append(this.$menu);
        this.$single = this.$menu.find('.game_menu_block_single');
        this.$multi = this.$menu.find('.game_menu_block_multi');
        this.$settings = this.$menu.find('.game_menu_block_settings');

        this.start();
    }

    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let now_menu = this;
        this.$single.click(function(){
            console.log("click single mode.");
            now_menu.hide();
            now_menu.root.playground.show();
        })
        this.$multi.click(function(){
            console.log("click multi mode.");

        })
        this.$settings.click(function(){
            console.log("launch setting.");
            now_menu.hide();
            now_menu.root.settings.show();
        })
    }

    show(){
        this.$menu.show();
    }

    hide(){
        this.$menu.hide();
    }
}
let GAME_OBJECT = [];

class GameObject{
    constructor(){
        GAME_OBJECT.push(this);

        this.called_start = false;
        this.timedelta = 0;
    }

    start(){
    }

    update(){
    }

    on_del(){
    }

    del(){
        this.on_del();

        for (let i = 0; i < GAME_OBJECT.length; i++ ){
            if (GAME_OBJECT[i] === this){
                GAME_OBJECT.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;

let Game_Animation = function(timestamp) {
    for (let i = 0; i < GAME_OBJECT.length; i++) {
        let obj = GAME_OBJECT[i];
        if (!obj.called_start) {
            obj.start();
            obj.called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(Game_Animation);
}

requestAnimationFrame(Game_Animation);
class GameMap extends GameObject {
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start(){

    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);

    }
}
class Particle extends GameObject{
    constructor(playground, x, y, r, vx, vy, speed, color, move_length){
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.r = r;
        this.speed = speed;
        this.color = color;
        this.move_length = move_length;
        this.vy = vy;
        this.vx = vx;
        this.ctx = this.playground.game_map.ctx;
        this.friction = 0.9;
    }

    start(){
    }

    update(){
        if(this.move_length < 1 || this.speed < 1) {
            this.del();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends GameObject {
    constructor(playground, x, y, r, speed, color, is_me){
        super();
        this.x = x;
        this.y = y;
        this.playground = playground;
        this.r = r;
        this.speed = speed;
        this.color = color;
        this.is_me = is_me;
        this.ctx = this.playground.game_map.ctx;
        this.eps = 0.1;
        this.vx = 0;
        this.vy = 0;
        this.damvx = 0;
        this.damvy = 0;
        this.damspeed = 0;
        this.move_length = 0;
        this.cur_skill = null;
        this.cold_time = 0;
        this.friction = 0.7;

        if(this.is_me){
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    start(){
        if(this.is_me){
            this.listen_events();
        }
        else{
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move(tx, ty);
        }
    }

    listen_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        })
        this.playground.game_map.$canvas.mousedown(function(tmp) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (tmp.which === 3) {
                outer.move(tmp.clientX - rect.left, tmp.clientY - rect.top);
            } else if (tmp.which === 1){
                if(outer.cur_skill === "fireball"){
                    outer.shoot_ball(outer.cur_skill, tmp.clientX - rect.left, tmp.clientY - rect.top);
                }
                outer.cur_skill = null;
            }
        })

        $(window).keydown(function(tmp) {
                if (tmp.which === 81){           //表示Q键，详见keycode对照表
                    outer.cur_skill = "fireball";
                    return false;
                }
            })
    }

    shoot_ball(cur, tx, ty){
        let x = this.x;
        let y = this.y;
        let r = this.playground.height * 0.02;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        if(cur === "fireball"){
            let color = "orange";
            let speed = this.playground.height * 0.5;
            let move_length = this.playground.height * 0.8;
            new FireBall(this.playground, this, x, y, r, vx, vy, color, speed, move_length, this.playground.height * 0.01);
        }
    }

    get_dist(x1, x2, y1, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dy * dy + dx * dx);
    }

    move(tx, ty){
        this.move_length = this.get_dist(this.x, tx, this.y, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    attacked(angle, damage){
        for (let i = 0; i < 10 + Math.random() * 8; i++){
            let x = this.x;
            let y = this.y;
            let r = this.r * Math.random() * 0.2;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.r * Math.random() * 7;
            new Particle(this.playground, x, y, r, vx, vy, speed, color, move_length);
        }
        this.r -= damage;
        if (this.r < 10){
            this.del();
            return false;
        } else {
            this.damvx = Math.cos(angle);
            this.damvy = Math.sin(angle);
            this.damspeed = damage * 70;
        }
    }

    update(){
        this.cold_time += this.timedelta / 1000;
        if(!this.is_me && this.cold_time > 3 && Math.random() < 1 / 250.0){
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_ball("fireball", tx, ty);
        }
        if(this.damspeed > 9) {
            this.vx = this.vy = this.move_length = 0;
            this.x += this.damvx * this.damspeed * this.timedelta / 1000;
            this.y += this.damvy * this.damspeed * this.timedelta / 1000;
            this.damspeed *= this.friction;
        } else {
            if(this.move_length < this.eps){
                this.move_length = this.vx = this.vy = 0;
                if(!this.is_me){
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render(){
        if(this.is_me){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    on_del(){
        for(let i = 0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
            }
        }
    }
}
class FireBall extends GameObject {
    constructor(playground, player, x, y, r, vx, vy, color, speed, move_length, damage){
        super();
        this.playground = playground;
        this.player = player;
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.ctx = this.playground.game_map.ctx;
        this.damage = damage;
        this.eps = 0.1;
    }

    start(){
    }

    update(){
        if (this.move_length < this.eps){
            this.del();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        for(let i = 0; i < this.playground.players.length; i++){
            let player = this.playground.players[i];
            if(this.player != player && this.is_collision(player)){
                this.attack(player);
            }
        }

        this.render();
    }

    get_dist(x1, x2, y1, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player){
        let distance = this.get_dist(this.x, player.x, this.y, player.y);
        if (distance < this.r + player.r){
            return true;
        }
        return false;
    }

    attack(player){
        this.del();

        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.attacked(angle, this.damage);
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class GamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`
<div class = "game_playground">
</div>
        `);
        this.hide();
        this.start();
    }

    start(){
    }

    random_color() {
        let colors = ["blue", "green", "red", "white", "grey", "purple"];
        return colors[Math.floor(Math.random() * 6)];
    }

    show(){
        this.$playground.show();
        this.root.$lty.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.height * 0.2, "pink", true));

        for(let i = 0; i < 5; i++){
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.height * 0.2, this.random_color(), false));
        }
    }

    hide(){
        this.$playground.hide();
    }
}
class GameSettings{
    constructor(root){
        this.root = root;
        this.$settings = $(`
<div class = "game_settings">
    <div class = "game_settings_login">
        <div class = "game_settings_title">
        登录
        </div>
        <div class = "game_settings_username">
            <div class = "game_settings_item">
                <input type = "text" placeholder = "用户名">
            </div>
        </div>
        <div class = "game_settings_passwd">
            <div class = "game_settings_item">
                <input type = "password" placeholder = "密码">
            </div>
        </div>
        <div class = "game_settings_affirm">
            <div class = "game_settings_item">
                <button>确认</button>
            </div>
        </div>
        <div class = "game_settings_error">
        </div>
        <div class = "game_settings_choice">
            注册
        </div>
        <br>
        <div class = "game_settings_qq">
            <img width = "40" src = "http://8.130.15.181:8000/static/image/settings/qq_logo.png">
            <br>
            <div class = "game_settings_qq_title">
                QQ一键登录
            </div>
        </div>
    </div>
    <div class = "game_settings_register">
        <div class = "game_settings_title">
            注册
        </div>
        <div class = "game_settings_username">
            <div class = "game_settings_item">
                <input type = "text" placeholder = "用户名">
            </div>
        </div>
        <div class = "game_settings_passwd">
            <div class = "game_settings_item">
                <input type = "password" placeholder = "密码">
            </div>
        </div>
        <div class = "game_settings_comfirm_passwd">
            <div class = "game_settings_item">
                <input type = "password" placeholder = "确认密码">
            </div>
        </div>
        <div class = "game_settings_affirm">
            <div class = "game_settings_item">
                <button>确认</button>
            </div>
        </div>
        <div class = "game_settings_error">
        </div>
        <div class = "game_settings_choice">
            登录
        </div>
        <br>
        <div class = "game_settings_qq">
            <img width = "40" src = "http://8.130.15.181:8000/static/image/settings/qq_logo.png">
            <br>
            <div class = "game_settings_qq_title">
                QQ一键注册
            </div>
        </div>
    </div>
</div>
            `);

        this.$login = this.$settings.find(".game_settings_login");
        this.$login_username = this.$login.find(".game_settings_username input");
        this.$login_passwd = this.$login.find(".game_settings_passwd input");
        this.$login_affirm = this.$login.find(".game_settings_affirm button");
        this.$login_error = this.$login.find(".game_settings_error");
        this.$login_register = this.$login.find(".game_settings_choice");

        this.$login.hide();

        this.$register = this.$settings.find(".game_settings_register");
        this.$register_username = this.$register.find(".game_settings_username input");
        this.$register_passwd_1 = this.$register.find(".game_settings_passwd input");
        this.$register_passwd_2 = this.$register.find(".game_settings_comfirm_passwd input");
        this.$register_affirm = this.$register.find(".game_settings_affirm button");
        this.$register_error = this.$register.find(".game_settings_error");
        this.$register_login = this.$register.find(".game_settings_choice");

        this.$register.hide();

        this.root.$lty.append(this.$settings);
        this.platform = "WEB";
        this.username = "";
        this.photo = "";

        this.start();
    }

    start(){
        this.get_info();
        this.listening_events();
    }

    listening_events(){
        this.listening_events_login();
        this.listening_events_register();
    }

    listening_events_login(){
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });
    }

    listening_events_register(){
        let outer = this;
        this.$register_login.click(function(){
            outer.login();
        });
    }

    register(){
        this.$login.hide();
        this.$register.show();
    }

    login(){
        this.$register.hide();
        this.$login.show();
    }

    get_info(){
        let outer = this;
        $.ajax({
            url: "http://8.130.15.181:8000/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp){
                console.log(resp);
                if(resp.result === "success"){
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        });
    }

    show(){
        this.$settings.show();
    }

    hide(){
        this.$settings.hide();
    }
}

export class Game{
    constructor(id){
        this.id = id;
        this.$lty = $('#' + id);
        this.settings = new GameSettings(this);
        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);

        this.start();
    }

    start(){
    }
}
