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
        this.friction = 0.9;
        this.fireballs = [];
        this.iceballs = [];

        if(this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }
        if(this.character === "me"){
            this.fireball_coldtime = 3; // 冷却3s
            this.fireball_img = new Image();
            this.fireball_img.src = "https://app4634.acapp.acwing.com.cn/static/image/playground/fireball.png";

            this.iceball_coldtime = 4;
            this.iceball_img = new Image();
            this.iceball_img.src = "https://app4634.acapp.acwing.com.cn/static/image/playground/iceball.png";

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
            this.move_to(tx, ty);
        }
    }

    listen_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(tmp) {
            if(outer.playground.state !== "fighting"){
                return true;
            }
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (tmp.which === 3) {
                let tx = (tmp.clientX - rect.left) / outer.playground.scale;
                let ty = (tmp.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);

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
                } else if(outer.cur_skill === "iceball"){
                    if(outer.iceball_coldtime > outer.eps){
                        return false;
                    }
                    let iceball = outer.shoot_ball("iceball", tx, ty);
                    if(outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_shoot_iceball(tx, ty, iceball.uid);
                    }
                } else if(outer.cur_skill === "blink"){
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
                if(outer.blink_coldtime > outer.eps){
                    return true;
                }
                outer.cur_skill = "blink";
                return false;
            } else if (tmp.which === 87){   //表示W键
                if(outer.iceball_coldtime > outer.eps){
                    return true;
                }
                outer.cur_skill = "iceball";
                return false;
            }
        });
    }

    shoot_ball(cur, tx, ty){
        let x = this.x;
        let y = this.y;
        let r = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        if(cur === "fireball"){
            let color = "orange";
            let speed = 0.5;
            let move_length = 1;
            let fireball = new FireBall(this.playground, this, x, y, r, vx, vy, color, speed, move_length, 0.01);
            this.fireballs.push(fireball);
            this.fireball_coldtime = 3;
            return fireball;
        } else if (cur === "iceball"){
            let color = "#CCFFFF";
            let speed = 0.5;
            let move_length = 1;
            let iceball = new IceBall(this.playground, this, x, y, r, vx, vy, color, speed, move_length, 0.01);
            this.iceballs.push(iceball);
            this.iceball_coldtime = 4;
            return iceball;
        }
    }

    destroy_fireball(uid){
        for(let i = 0; i < this.fireballs.length; i++){
            let fireball = this.fireballs[i];
            if(fireball.uid === uid){
                fireball.destroy();
                break;
            }
        }
    }

    destory_iceball(uid){
        for(let i = 0; i < this.iceballs.length; i++){
            let iceball = this.iceballs[i];
            if(iceball.uid === uid){
                iceball.destroy();
                break;
            }
        }
    }

    blink(tx, ty){
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 5;
        this.move_length = 0;   //闪现后停止移动
    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dy * dy + dx * dx);
    }

    move_to(tx, ty){
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    attacked(angle, damage, skill){
        for (let i = 0; i < 20 + Math.random() * 10; i++){
            let x = this.x;
            let y = this.y;
            let r = this.r * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.r * Math.random() * 5;
            new Particle(this.playground, x, y, r, vx, vy, speed, color, move_length);
        }
        this.r -= damage;
        if (this.r < this.eps){
            this.destroy();
            return false;
        } else if (skill === "fireball"){
            this.damvx = Math.cos(angle);
            this.damvy = Math.sin(angle);
            this.damspeed = damage * 100;
            this.speed *= 1.2;
        } else if (skill === "iceball"){
            let outer = this;
            this.move_length = 0;
            let sped = this.speed;
            this.speed *= 0.5;
            setTimeout(function(){
                outer.speed = sped;
            }, 2000);
        }
    }

    receive_attack(x, y, angle, damage, ball_uid, attacker, skill){
        if(skill === "fireball"){
            attacker.destroy_fireball(ball_uid);
        } else if (skill === "iceball"){
            attacker.destroy_iceball(ball_uid);
        }
        this.x = x;
        this.y = y;
        this.attacked(angle, damage, skill);
    }

    update(){
        this.cold_time += this.timedelta / 1000;
        this.update_win();
        if(this.character === "me" && this.playground.state === "fighting"){
            this.update_coldtime();
        }
        this.update_move();
        this.render();
    }

    update_win(){
        if(this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1){
            this.playground.state = "over";
            this.playground.score_board.win();
        }
    }

    update_coldtime(){
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.iceball_coldtime -= this.timedelta / 1000;
        this.iceball_coldtime = Math.max(this.iceball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    update_move(){
        if(this.character === "robot" && this.cold_time > 3 && Math.random() < 1 / 300.0){
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            let num = Math.random();
            if (num < 0.6){
                this.shoot_ball("fireball", tx, ty);
            } else {
                this.shoot_ball("iceball", tx, ty);
            }
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
                    this.move_to(tx, ty);
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
        let x = 1.4, y = 0.9, r = 0.04;
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

        x = 1.52, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip;
        this.ctx.drawImage(this.iceball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if(this.iceball_coldtime > 0){
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.iceball_coldtime / 4) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        x = 1.64, y = 0.9, r = 0.04;
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

    on_destroy(){
        if(this.character === "me"){
            if(this.playground.state === "fighting"){
                this.playground.state = "over";
                this.playground.score_board.lose();
            }
        }
        for(let i = 0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}
