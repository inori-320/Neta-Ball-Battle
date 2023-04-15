from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache
from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from sys import stdin
from match_system.src.match_server.match_service import Match
from game.models.players.players import Player
from channels.db import database_sync_to_async

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        self.room_name = None
        self.uid = data['uid']
        transport = TSocket.TSocket('127.0.0.1', 9090)
        transport = TTransport.TBufferedTransport(transport)
        protocol = TBinaryProtocol.TBinaryProtocol(transport)
        client = Match.Client(protocol)

        def db_get_player():
            return Player.objects.get(user__username = data['username'])
        player = await database_sync_to_async(db_get_player)()

        transport.open()

        client.add_player(player.score, data['uid'], data['username'], data['photo'], self.channel_name)

        transport.close()

    async def group_send_event(self, data):
        if not self.room_name:
            keys = cache.keys('*%s*' % (self.uid))
            if keys:
                self.room_name = keys[0]
        await self.send(text_data = json.dumps(data))

    async def move(self, data):
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': "group_send_event",
                    'event': "move",
                    'uid': data['uid'],
                    'tx': data['tx'],
                    'ty': data['ty'],
                }
            )

    async def shoot_ball(self, data):
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': "group_send_event",
                    'event': "shoot_ball",
                    'uid': data['uid'],
                    'tx': data['tx'],
                    'ty': data['ty'],
                    'ball_uid': data['ball_uid'],
                }
            )

    async def attack(self, data):
        if not self.room_name:
            return

        players = cache.get(self.room_name)
        if not players:
            return

        for player in players:
            if player['uid'] == data['attackee_uid']:
                player['hp'] -= 25
        remain_cnt = 0
        for player in players:
            if player['hp'] > 0:
                remain_name += 1
        if remain_cnt > 1:
            if self.room_name:
                cache.set(self.room_name, players, 3600)
        else:
            def db_update_player_score(username, score):
                player = Player.objects.get(user__username = username)
                player.score += score
                player.save()

            for player in players:
                if player['hp'] <= 0:
                    await database_sync_to_async(db_update_player_score)(player['username'], -10)
                else:
                    await database_sync_to_async(db_update_player_score)(player['username'], 10)

        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': "group_send_event",
                    'event': "attack",
                    'uid': data['uid'],
                    'attackee_uid': data['attackee_uid'],
                    'x': data['x'],
                    'y': data['y'],
                    'angle': data['angle'],
                    'damage': data['damage'],
                    'ball_uid': data['ball_uid'],
                }
            )

    async def blink(self, data):
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': "group_send_event",
                    'event': "blink",
                    'uid': data['uid'],
                    'tx': data['tx'],
                    'ty': data['ty'],
                }
            )

    async def message(self, data):
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': "group_send_event",
                    'event': "message",
                    'uid': data['uid'],
                    'username': data['username'],
                    'text': data['text'],
                }
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
        elif event == "move":
            await self.move(data)
        elif event == "shoot_ball":
            await self.shoot_ball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "message":
            await self.message(data)
