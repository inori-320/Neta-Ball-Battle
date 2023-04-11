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
        let outer = this;
        this.$single.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");

        });
        this.$settings.click(function(){
            outer.root.settings.remote_logout();
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
        let res = "";
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
        this.$canvas = $(`<canvas tabindex = 0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start(){
        this.$canvas.focus();
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
class NoticeBoard extends GameObject {
    constructor(playground){
        super();

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已就绪：0人";
    }

    start(){
    }

    write(text){
        this.text = text;
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
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
        this.fireballs = [];

        if(character !== "robot"){
            this.img = new Image();
            this.img.src = photo;
        }
        if(this.character === "me"){
            this.fireball_coldtime = 3; // 冷却3s
            this.fireball_img = new Image();
            this.fireball_img.src = "https://app4634.acapp.acwing.com.cn/static/image/playground/fireball.png";

            this.blink_coldtime = 5;
            this.blink_img = new Image();
            this.blink_img.src = "https://app4634.acapp.acwing.com.cn/static/image/playground/blink.png";
        }
    }

    start(){
        this.playground.player_count ++;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "人");

        if(this.playground.player_count >= 3){
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }
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
            if(outer.playground.state !== "fighting"){
                return true;
            }
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (tmp.which === 3) {
                let tx = (tmp.clientX - rect.left) / outer.playground.scale;
                let ty = (tmp.clientY - rect.top) / outer.playground.scale;
                outer.move(tx, ty);

                if(outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_move(tx, ty);
                }
            } else if (tmp.which === 1){
                let tx = (tmp.clientX - rect.left) / outer.playground.scale;
                let ty = (tmp.clientY - rect.top) / outer.playground.scale;
                if(outer.cur_skill === "fireball"){
                    if(outer.fireball_coldtime > outer.eps){
                        return false;
                    }
                    let fireball = outer.shoot_ball("fireball", tx, ty);
                    if(outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uid);
                    }
                } else if (outer.cur_skill === "blink"){
                    if(outer.blink_coldtime > outer.eps){
                        return false;
                    }
                    outer.blink(tx, ty);
                    if(outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_blink(tx, ty);
                    }
                }
                outer.cur_skill = null;
            }
        });

        this.playground.game_map.$canvas.keydown(function(tmp) {
            if (tmp.which === 13){      //Enter
                if(outer.playground.mode === "multi mode"){
                    outer.playground.chat_field.show_input();
                    return false;
                }
            } else if(tmp.which === 27){        //Esc
                if(outer.playground.mode === "multi mode"){
                    outer.playground.chat_field.hide_input();
                }
            }
            if (tmp.which === 81){           //表示Q键，详见keycode对照表
                if(outer.fireball_coldtime > outer.eps){
                    return true;
                }

                outer.cur_skill = "fireball";
                return false;
            } else if (tmp.which === 70){      //表示F键
                console.log("blink");
                if(outer.blink_coldtime > outer.eps){
                    return true;
                }

                outer.cur_skill = "blink";
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
            let fireball = new FireBall(this.playground, this, x, y, r, vx, vy, color, speed, move_length, 0.01);
            this.fireballs.push(fireball);
            this.fireball_coldtime = 3;
            return fireball;
        }
    }

    destory_fireball(uid){
        for(let i = 0; i < this.fireballs.length; i++){
            let fireball = this.fireballs[i];
            if(fireball.uid === uid){
                fireball.destory();
                break;
            }
        }
    }

    blink(tx, ty){
        console.log("blink_move");
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.7);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 5;
        this.move_length = 0;   //闪现后停止移动
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
            return false;
        } else {
            this.damvx = Math.cos(angle);
            this.damvy = Math.sin(angle);
            this.damspeed = damage * 70;
            this.speed *= 1.2;
        }
    }

    receive_attack(x, y, angle, damage, ball_uid, attacker){
        attacker.destory_fireball(ball_uid);
        this.x = x;
        this.y = y;
        this.attacked(angle, damage);
    }

    update(){
        this.cold_time += this.timedelta / 1000;
        if(this.character === "me" && this.playground.state === "fighting"){
            this.update_coldtime();
        }
        this.update_move();
        this.render();
    }

    update_coldtime(){
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    update_move(){
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
        if(this.character === "me" && this.playground.state === "fighting"){
            this.render_skill_coldtime();
        }
    }

    render_skill_coldtime(){
        let scale = this.playground.scale;
        let x = 1.7, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if(this.fireball_coldtime > 0){
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        x = 1.82, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
        if(this.blink_coldtime > 0){
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    on_del(){
        if(this.character === "me"){
            this.playground.state = "over";
        }
        for(let i = 0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
                break;
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
        this.update_move();

        if(this.player.character !== "enemy"){
            this.update_attack();
        }
        this.update_attack();

        this.render();
    }

    update_move(){
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack(){
        for(let i = 0; i < this.playground.players.length; i++){
             let player = this.playground.players[i];
             if(this.player !== player && this.is_collision(player)){
                 this.attack(player);
                 break;
             }
         }
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
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.attacked(angle, this.damage);

        if (this.playground.mode === "multi mode"){
            this.playground.mps.send_attack(player.uid, player.x, player.y, angle, this.damage, this.uid);
        }

        this.del();
    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_del(){
        let fireballs = this.player.fireballs;
        for(let i = 0; i < fireballs.length; i++){
            if(fireballs[i] === this){
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}
class ChatField {
    constructor(playground){
        this.playground = playground;
        this.$history = $(`<div class = "chatfield_history"></div>`);
        this.$input = $(`<input type = "text" class = "chatfield_input">`);
        this.func_id = null;

        this.$history.hide();
        this.$input.hide();

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }

    start(){
        this.listening_events();
    }

    listening_events(){
        let outer = this;
        this.$input.keydown(function(e){
            if(e.which === 27){
                outer.hide_input();
                return false;
            } else if (e.which === 13){     // Enter
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if(text){
                    outer.$input.val("");
                    outer.add_message(username, text);
                    outer.playground.mps.send_message(username, text);
                }
                return false;
            }
        });
    }

    show_input(){
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }

    hide_input(){
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }

    render_message(message){
        return $(`<div>${message}</div>`);
    }

    add_message(username, text){
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_history(){
        let outer = this;
        this.$history.fadeIn();
        if(this.func_id){
            clearTimeout(this.func_id);
        }
        this.func_id = setTimeout(function(){
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 3000);
    }
}
class MultiPlayer{
    constructor(playground){
        this.playground = playground;

        this.ws = new WebSocket("wss://app4634.acapp.acwing.com.cn/wss/multiplayer/");

        this.start();
    }

    start(){
        this.receive();
    }

    receive(){
        let outer = this;
        this.ws.onmessage = function(s) {
            let data = JSON.parse(s.data);
            let event = data.event;
            let uid = data.uid;
            if(uid === outer.uid) return false;
            if (event === "create_player"){
                outer.receive_create_player(uid, data.username, data.photo);
            } else if (event === "move"){
                outer.receive_move(uid, data.tx, data.ty);
            } else if (event === "shoot_fireball"){
                outer.receive_shoot_fireball(uid, data.tx, data.ty, data.ball_uid);
            } else if (event === "attack"){
                outer.receive_attack(uid, data.attackee_uid, data.x, data.y, data.angle, data.damage, data.ball_uid);
            } else if (event === "blink"){
                outer.receive_blink(uid, data.tx, data.ty);
            } else if (event === "message"){
                outer.receive_message(uid, data.username, data.text);
            }
        }
    }

    get_player(uid){
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++){
            let player = players[i];
            if(player.uid === uid) return player;
        }
        return null;
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

    send_move(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move",
            'uid': outer.uid,
            'tx':tx,
            'ty': ty,
        }));
    }

    receive_move(uid, tx, ty){
        let outer = this;
        let player = this.get_player(uid);
        if(player){
            player.move(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uid': outer.uid,
            'tx': tx,
            'ty':ty,
            'ball_uid': ball_uid
        }));
    }

    receive_shoot_fireball(uid, tx, ty, ball_uid){
        let outer = this;
        let player = this.get_player(uid);
        if(player){
            let ball = player.shoot_ball("fireball", tx, ty);
            ball.uid = ball_uid;
        }
    }

    send_attack(attackee_uid, x, y, angle, damage, ball_uid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uid': outer.uid,
            'attackee_uid': attackee_uid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uid': ball_uid
        }));
    }

    receive_attack(uid, attackee_uid, x, y, angle, damage, ball_uid){
        let attacker = this.get_player(uid);
        let attackee = this.get_player(attackee_uid);
        if(attacker && attackee){
            attackee.receive_attack(x, y, angle, damage, ball_uid, attacker);
        }
    }

    send_blink(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uid': outer.uid,
            'tx': tx,
            'ty': ty
        }));
    }

    receive_blink(uid, tx, ty){
        let player = this.get_player(uid);
        if(player){
            player.blink(tx, ty);
        }
    }

    send_message(username, text){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uid': outer.uid,
            'username': username,
            'text': text,
        }));
    }

    receive_message(uid, username, text){
        this.playground.chat_field.add_message(username, text);
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
        let uid = this.create_uid();
        $(window).on(`resize.${uid}`, function(){
            outer.resize();
        });

        if(this.root.AcWingOS) {
            this.root.AcWingOS.api.window.on_close(function() {
                $(window).off(`resize.${uid}`);
            });
        }
    }

    create_uid(){
        let ans = "";
        for(let i = 0; i < 8; i++){
            let x = parseInt(Math.floor(Math.random() * 10 ));
            ans += x;
        }
        return ans;
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
        this.mode = mode;
        this.state = "waiting";
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;
        this.resize();

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5 , 0.05, 0.2, "pink", "me", this.root.settings.username, this.root.settings.photo));
        if(mode === "single mode"){
            for(let i = 0; i < 5; i++){
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, 0.2, this.random_color(), "robot"));
            }
        } else if(mode === "multi mode"){
            this.chat_field = new ChatField(this);
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
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

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
        <div class = "game_settings_acwing">
            <img width = "40" src = "https://app4634.acapp.acwing.com.cn/static/image/settings/acwing.png">
            <br>
            <div class = "game_settings_acwing_title">
                ACWing一键登录
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
        <div class = "game_settings_acwing">
            <img width = "40" src = "https://app4634.acapp.acwing.com.cn/static/image/settings/acwing.png">
            <br>
            <div class = "game_settings_acwing_title">
                ACWing一键注册
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

        this.$acwing_login = this.$settings.find('.game_settings_acwing img');

        this.root.$lty.append(this.$settings);

        this.start();
    }

    start(){
        if(this.platform === "ACAPP"){
            this.getinfo_acapp();
        } else {
            this.getinfo_web();
            this.listening_events();
        }
    }

    listening_events(){
        let outer = this;
        this.listening_events_login();
        this.listening_events_register();

        this.$acwing_login.click(function(){
            outer.acwing_login();
        })
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

    acwing_login(){
        $.ajax({
            url:"https://app4634.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function(resp){
                if(resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    remote_login(){
        let outer = this;
        let username = this.$login_username.val();
        let passwd = this.$login_passwd.val();
        this.$login_error.empty();
        $.ajax({
            url: "https://app4634.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: passwd,
            },
            success: function(resp){
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
            url:"https://app4634.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data:{
                username: username,
                passwd_1: passwd_1,
                passwd_2: passwd_2,
            },
            success: function(resp){
                if(resp.result == "success"){
                    outer.login();
                } else {
                    outer.$register_error.html(resp.result);
                }
            }

        });
    }

    remote_logout(){
        if(this.platform === "ACAPP"){
            this.root.AcWingOS.api.window.close();
        } else{
            $.ajax({
                url: "https://app4634.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function(resp) {
                    if(resp.result === "success"){
                        location.reload();
                    }
                }
            });
        }
    }

    acapp_login(appid, redirect_uri, scope, state){
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp){
            if(resp.result === "success"){
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    getinfo_acapp(){
        let outer = this;
        $.ajax({
            url: "https://app4634.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp){
                if(resp.result === "success"){
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

    getinfo_web(){
        let outer = this;
        $.ajax({
            url: "https://app4634.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp){
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
    constructor(id, AcWingOS){
        this.id = id;
        this.$lty = $('#' + id);
        this.AcWingOS = AcWingOS;
        this.settings = new GameSettings(this);
        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);

        this.start();
    }

    start(){
    }
}
