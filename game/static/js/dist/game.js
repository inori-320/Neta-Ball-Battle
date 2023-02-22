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
        <div class = "game_menu_block_item game_menu_block_settings">
            退出
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
            now_menu.root.playground.show("single mode");
        });
        this.$multi.click(function(){
            console.log("click multi mode.");
            now_menu.hide();
            now_menu.root.playground.show("multi mode");

        });
        this.$settings.click(function(){
            console.log("launch setting.");
            now_menu.root.settings.remote_logout();
        });
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
        this.uid = this.create_uid();
    }

    create_uid(){
        let outer = this;
        let res = ""l;
        for(let i = 0; i < 8; i ++){
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
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

    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

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
        if(this.move_length < 0.01 || this.speed < 0.01) {
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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends GameObject {
    constructor(playground, x, y, r, speed, color, character, username, photo){
        super();
        this.x = x;
        this.y = y;
        this.playground = playground;
        this.r = r;
        this.speed = speed;
        this.color = color;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.ctx = this.playground.game_map.ctx;
        this.eps = 0.01;
        this.vx = 0;
        this.vy = 0;
        this.damvx = 0;
        this.damvy = 0;
        this.damspeed = 0;
        this.move_length = 0;
        this.cur_skill = null;
        this.cold_time = 0;
        this.friction = 0.7;
        this.alive = true;

        if(character !== "robot"){
            this.img = new Image();
            this.img.src = photo;
        }
    }

    start(){
        if(this.character === "me"){
            this.listen_events();
        }
        else if (this.character === "robot"){
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
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
            if(outer.alive){
                if (tmp.which === 3) {
                    outer.move((tmp.clientX - rect.left) / outer.playground.scale, (tmp.clientY - rect.top) / outer.playground.scale);
                } else if (tmp.which === 1){
                    if(outer.cur_skill === "fireball"){
                        outer.shoot_ball(outer.cur_skill, (tmp.clientX - rect.left) / outer.playground.scale, (tmp.clientY - rect.top) / outer.playground.scale);
                    }
                    outer.cur_skill = null;
                }
            }
        });

        $(window).keydown(function(tmp) {
                if (tmp.which === 81){           //表示Q键，详见keycode对照表
                    outer.cur_skill = "fireball";
                    return false;
                }
            });
    }

    shoot_ball(cur, tx, ty){
        let x = this.x;
        let y = this.y;
        let r = 0.02;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        if(cur === "fireball"){
            let color = "orange";
            let speed = 0.5;
            let move_length = 0.8;
            new FireBall(this.playground, this, x, y, r, vx, vy, color, speed, move_length, 0.01);
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
        if (this.r < this.eps){
            this.del();
            this.alive = false;
            return false;
        } else {
            this.damvx = Math.cos(angle);
            this.damvy = Math.sin(angle);
            this.damspeed = damage * 70;
            this.speed *= 1.2;
        }
    }

    update(){
        this.update_move();
        this.render();
    }

    update_move(){
        this.cold_time += this.timedelta / 1000;
        if(this.character === "robot" && this.cold_time > 3 && Math.random() < 1 / 250.0){
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_ball("fireball", tx, ty);
        }
        if(this.damspeed > this.eps) {
            this.vx = this.vy = this.move_length = 0;
            this.x += this.damvx * this.damspeed * this.timedelta / 1000;
            this.y += this.damvy * this.damspeed * this.timedelta / 1000;
            this.damspeed *= this.friction;
        } else {
            if(this.move_length < this.eps){
                this.move_length = this.vx = this.vy = 0;
                if(this.character === "robot"){
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    render(){
        let scale = this.playground.scale;
        if(this.character !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.r) * scale, (this.y - this.r) * scale, this.r * 2 * scale, this.r * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, Math.PI*2, false);
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
        this.eps = 0.01;
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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class MultiPlayer{
    constructor(playground){
        this.playground = playground;

        this.ws = new WebSocket("wss://8.130.15.181:8000/wss/multiplayer/");

        this.start();
    }

    start(){
        this.handle_receive();
    }

    handle_receive(){
        let outer = this;
        this.ws.onmessage = function(s) {
            let data = JSON.parse(s.data);
            let event = data.event;
            let uid = data.uid;
            if(uid === outer.uid) return false;
            if (event === "create_player"){
                outer.receive_create_player(uid, data.username, data.photo);
            }
        }
    }

    send_create_player(username, photo){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uid': outer.uid,
            'username': username,
            'photo': photo,
        }));
    }

    receive_create_player(uid, username, photo){
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo
        );

        player.uid = uid;
        this.playground.players.push(player);
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
        this.root.$lty.append(this.$playground);

        this.start();
    }

    start(){
        let outer = this;
        $(window).resize(function() {
            outer.resize();
        });
    }

    resize(){
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 20, this.height / 9.5);
        this.width = unit * 20;
        this.height = unit * 9.5;
        this.scale = this.height;

        if(this.game_map) this.game_map.resize();
    }

    random_color() {
        let colors = ["blue", "green", "red", "white", "grey", "purple"];
        return colors[Math.floor(Math.random() * 6)];
    }

    show(mode){
        let outer = this;
        this.$playground.show();
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.resize();

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5 , 0.05, 0.2, "pink", "me", this.root.settings.username, this.root.settings.photo));
        if(mode === "single mode"){
            for(let i = 0; i < 5; i++){
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, 0.2, this.random_color(), "robot"));
            }
        } else {
            this.mps = new MultiPlayer(this);
            this.mps.uid = this.players[0].uid;

            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
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
            <img width = "40" src = "http://59.110.53.20:8000/static/image/settings/qq_logo.png">
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
            <img width = "40" src = "http://59.110.53.20:8000/static/image/settings/qq_logo.png">
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
        let outer = this;
        this.listening_events_login();
        this.listening_events_register();
    }

    listening_events_login(){
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });
        this.$login_affirm.click(function(){
            outer.remote_login();
        })
    }

    listening_events_register(){
        let outer = this;
        this.$register_login.click(function(){
            outer.login();
        });
        this.$register_affirm.click(function(){
            outer.remote_register();
        })
    }

    register(){
        this.$login.hide();
        this.$register.show();
    }

    login(){
        this.$register.hide();
        this.$login.show();
    }

    remote_login(){
        let outer = this;
        let username = this.$login_username.val();
        let passwd = this.$login_passwd.val();
        this.$login_error.empty();
        console.log(username, passwd);
        $.ajax({
            url: "http://59.110.53.20:8000/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: passwd,
            },
            success: function(resp){
                console.log(resp);
                if(resp.result === "success"){
                    location.reload();
                } else {
                    outer.$login_error.html(resp.result);
                }
            }
        })
    }

    remote_register(){
        let outer = this;
        let username = this.$register_username.val();
        let passwd_1 = this.$register_passwd_1.val();
        let passwd_2 = this.$register_passwd_2.val();
        this.$register_error.empty();

        $.ajax({
            url:"http://59.110.53.20:8000/settings/register/",
            type: "GET",
            data:{
                username: username,
                passwd_1: passwd_1,
                passwd_2: passwd_2,
            },
            success: function(resp){
                console.log(resp);
                if(resp.result == "success"){
                    outer.login();
                } else {
                    outer.$register_error.html(resp.result);
                }
            }

        })
    }

    remote_logout(){
        $.ajax({
            url: "http://59.110.53.20:8000/settings/logout/",
            type: "GET",
            success: function(resp) {
                console.log(resp);
                if(resp.result === "success"){
                    location.reload();
                }
            }
        })
    }

    get_info(){
        let outer = this;
        $.ajax({
            url: "http://59.110.53.20:8000/settings/getinfo/",
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
